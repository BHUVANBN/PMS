import mongoose from 'mongoose';
import crypto from 'crypto';
import { sendMail } from '../utils/mailer.js';
import cloudinary from '../utils/cloudinary.js';
import { uploadBufferToCloudinary } from '../utils/uploadToCloudinary.js';
import fetch from 'node-fetch';
import { Onboarding, ONBOARDING_STATUS, USER_ROLES } from '../models/index.js';
import { EmployeeDocuments } from '../models/employeeDocuments.models.js';

const REQUIRED_EMPLOYEE_DOCS = ['aadhar', 'photo', 'tenth', 'twelfth', 'diploma', 'passbook'];
const HR_DOCUMENT_FIELDS = ['codeOfConduct', 'nda', 'employmentAgreement'];

const serializeOnboarding = (doc) => {
  if (!doc) return null;
  return doc.toObject({ virtuals: true });
};

// Generic HR documents
export const addHRGenericDocument = async (req, res, next) => {
  const doUpload = async () => {
    const { userId } = req.params;
    const { name, description } = req.body || {};
    assertObjectId(userId);
    if (!name || !req.file) {
      const err = new Error('Name and file are required');
      err.statusCode = 400;
      throw err;
    }
    const onboarding = await ensureOnboardingRecord(userId);
    const uploadedDocument = await uploadBufferToCloudinary(req.file.buffer, {
      folder: `onboarding/${userId}/hr/generic`,
      public_id: `${Date.now()}-${(name || 'document').toString().slice(0, 40)}`,
    });
    const item = {
      name: name.toString().trim(),
      description: (description || '').toString(),
      file: {
        url: uploadedDocument.secure_url,
        publicId: uploadedDocument.public_id,
        uploadedAt: new Date(),
        uploadedBy: req.user._id,
      },
    };
    onboarding.hrDocumentsList = onboarding.hrDocumentsList || [];
    onboarding.hrDocumentsList.push(item);
    await onboarding.save();
    return { onboarding, item };
  };

  try {
    const { onboarding, item } = await doUpload();
    return res.status(201).json({
      message: 'Generic HR document uploaded',
      document: item,
      onboarding: serializeOnboarding(onboarding),
    });
  } catch (error) {
    // Retry once if duplicate key (E11000) occurs due to race on first create
    if ((error.code === 11000 || /E11000/.test(error.message || '')) && req?.params?.userId) {
      // Special case: legacy bad unique index on employeeId causing dup nulls
      // Attempt to drop it once if present, then retry
      try {
        const collection = Onboarding.collection;
        const indexes = await collection.indexes();
        const bad = indexes.find((i) => i.name === 'employeeId_1');
        if (bad) {
          try { await collection.dropIndex('employeeId_1'); } catch { /* ignore */ }
        }
      } catch { /* ignore */ }
      try {
        await ensureOnboardingRecord(req.params.userId);
        const { onboarding, item } = await doUpload();
        return res.status(201).json({
          message: 'Generic HR document uploaded',
          document: item,
          onboarding: serializeOnboarding(onboarding),
        });
      } catch (e2) {
        return next(e2);
      }
    }
    next(error);
  }
};

export const getHRGenericDocuments = async (req, res, next) => {
  try {
    const { userId } = req.params;
    assertObjectId(userId);
    const onboarding = await ensureOnboardingRecord(userId);
    return res.status(200).json({
      message: 'Generic HR documents retrieved',
      documents: onboarding.hrDocumentsList || [],
    });
  } catch (error) {
    next(error);
  }
};

// Return current user's received HR generic documents
export const getMyHRGenericDocuments = async (req, res, next) => {
  try {
    const onboarding = await ensureOnboardingRecord(req.user._id);
    return res.status(200).json({
      message: 'My HR documents retrieved',
      documents: onboarding.hrDocumentsList || [],
    });
  } catch (error) {
    next(error);
  }
};

export const deleteHRGenericDocument = async (req, res, next) => {
  try {
    const { userId, docId } = req.params;
    assertObjectId(userId);

    const onboarding = await ensureOnboardingRecord(userId);
    const list = onboarding.hrDocumentsList || [];
    const index = list.findIndex((d) => String(d._id) === String(docId));
    if (index === -1) {
      return res.status(404).json({ message: 'Document not found' });
    }
    const doc = list[index];
    await removeExistingAsset(doc.file);
    list.splice(index, 1);
    onboarding.hrDocumentsList = list;
    await onboarding.save();
    return res.status(200).json({ message: 'Document deleted' });
  } catch (error) {
    next(error);
  }
};

export const deleteOnboardingDocument = async (req, res, next) => {
  try {
    const { userId, scope, docKey } = req.params;
    assertObjectId(userId);

    const normalizedScope = String(scope || '').toLowerCase();
    if (!['hr', 'employee'].includes(normalizedScope)) {
      return res.status(400).json({ message: 'Scope must be either "hr" or "employee"' });
    }

    const onboarding = await ensureOnboardingRecord(userId);

    // Determine valid keys
    const validEmployeeKeys = new Set(REQUIRED_EMPLOYEE_DOCS);
    const validHRKeys = new Set(HR_DOCUMENT_FIELDS);

    if (normalizedScope === 'employee') {
      if (!validEmployeeKeys.has(docKey)) {
        return res.status(400).json({ message: 'Invalid employee document key' });
      }
      const current = onboarding.employeeDocuments?.[docKey];
      await removeExistingAsset(current);
      onboarding.employeeDocuments[docKey] = null;
      // Downgrade status since required doc removed
      if (onboarding.status !== ONBOARDING_STATUS.PENDING_DOCUMENTS) {
        onboarding.status = ONBOARDING_STATUS.PENDING_DOCUMENTS;
        onboarding.appendHistory({ status: ONBOARDING_STATUS.PENDING_DOCUMENTS, userId: req.user?._id, remark: `HR removed employee document: ${docKey}` });
      }
      // Clear HR verification if any
      onboarding.hrVerification.verifiedBy = null;
      onboarding.hrVerification.verifiedAt = null;
      onboarding.hrVerification.status = null;
      onboarding.hrVerification.remarks = '';
    } else {
      if (!validHRKeys.has(docKey)) {
        return res.status(400).json({ message: 'Invalid HR document key' });
      }
      const current = onboarding.hrDocuments?.[docKey];
      await removeExistingAsset(current);
      onboarding.hrDocuments[docKey] = null;
      // If HR doc removed and status was verified, reset to pending_verification
      if (onboarding.status === ONBOARDING_STATUS.VERIFIED) {
        onboarding.status = ONBOARDING_STATUS.PENDING_VERIFICATION;
        onboarding.appendHistory({ status: ONBOARDING_STATUS.PENDING_VERIFICATION, userId: req.user?._id, remark: `HR removed HR document: ${docKey}` });
        onboarding.hrVerification.verifiedBy = null;
        onboarding.hrVerification.verifiedAt = null;
        onboarding.hrVerification.status = null;
        onboarding.hrVerification.remarks = '';
      }
    }

    await onboarding.save();
    await onboarding.populate('user', 'firstName lastName email role');

    return res.status(200).json({
      message: 'Document deleted',
      onboarding: serializeOnboarding(onboarding)
    });
  } catch (error) {
    next(error);
  }
};

const ensureOnboardingRecord = async (userId) => {
  // Atomic upsert to avoid duplicate key race conditions on first creation
  const onboarding = await Onboarding.findOneAndUpdate(
    { user: userId },
    { $setOnInsert: { user: userId } },
    { new: true, upsert: true }
  );
  return onboarding;
};

const removeExistingAsset = async (document) => {
  if (document?.publicId) {
    try {
      await cloudinary.uploader.destroy(document.publicId);
    } catch (error) {
      console.error('Failed to remove Cloudinary asset', error.message);
    }
  }
};

const assertObjectId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Invalid user id');
    error.statusCode = 400;
    throw error;
  }
};

const canUseEmployeeEndpoints = (role) => {
  return role !== USER_ROLES.ADMIN && role !== USER_ROLES.HR;
};

export const getEmployeeOnboardingStatus = async (req, res, next) => {
  try {
    if (!canUseEmployeeEndpoints(req.user.role)) {
      return res.status(403).json({ message: 'Only employees can access onboarding status' });
    }

    const onboarding = await ensureOnboardingRecord(req.user._id);
    await onboarding.populate('user', 'firstName lastName email role');

    return res.status(200).json({
      message: 'Onboarding status retrieved',
      onboarding: serializeOnboarding(onboarding),
      canAccessPlatform: onboarding.status === ONBOARDING_STATUS.VERIFIED
    });
  } catch (error) {
    next(error);
  }
};

export const uploadEmployeeDocuments = async (req, res, next) => {
  try {
    if (!canUseEmployeeEndpoints(req.user.role)) {
      return res.status(403).json({ message: 'Only employees can upload onboarding documents' });
    }

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const onboarding = await ensureOnboardingRecord(req.user._id);

    if (onboarding.status === ONBOARDING_STATUS.VERIFIED) {
      return res.status(400).json({ message: 'Onboarding already verified. Document upload not allowed.' });
    }

    // Persist basic details if provided
    const {
      mobile,
      address,
      dateOfBirth,
      pan,
      emergencyContactName,
      emergencyContactPhone,
      bankAccountNumber,
      ifsc,
    } = req.body || {};
    const details = onboarding.employeeDetails || {};
    if (typeof mobile === 'string') details.mobile = mobile;
    if (typeof address === 'string') details.address = address;
    if (typeof pan === 'string') details.pan = pan;
    if (typeof emergencyContactName === 'string') details.emergencyContactName = emergencyContactName;
    if (typeof emergencyContactPhone === 'string') details.emergencyContactPhone = emergencyContactPhone;
    if (typeof bankAccountNumber === 'string') details.bankAccountNumber = bankAccountNumber;
    if (typeof ifsc === 'string') details.ifsc = ifsc;
    if (dateOfBirth) {
      const d = new Date(dateOfBirth);
      if (!isNaN(d.getTime())) details.dateOfBirth = d;
    }
    onboarding.employeeDetails = details;

    for (const field of REQUIRED_EMPLOYEE_DOCS) {
      const file = req.files[field]?.[0];
      if (!file) continue;

      await removeExistingAsset(onboarding.employeeDocuments[field]);

      const uploadedDocument = await uploadBufferToCloudinary(file.buffer, {
        folder: `onboarding/${req.user._id}/employee`,
        public_id: `${field}-${Date.now()}`
      });

      onboarding.employeeDocuments[field] = {
        url: uploadedDocument.secure_url,
        publicId: uploadedDocument.public_id,
        uploadedAt: new Date(),
        uploadedBy: req.user._id
      };
    }

    const hasAllDocs = REQUIRED_EMPLOYEE_DOCS.every((field) => onboarding.employeeDocuments[field]);

    if (hasAllDocs) {
      if (
        onboarding.status === ONBOARDING_STATUS.REJECTED ||
        onboarding.status === ONBOARDING_STATUS.PENDING_DOCUMENTS
      ) {
        onboarding.status = ONBOARDING_STATUS.PENDING_VERIFICATION;
        onboarding.appendHistory({
          status: ONBOARDING_STATUS.PENDING_VERIFICATION,
          userId: req.user._id,
          remark: 'Employee uploaded required documents'
        });
        onboarding.hrVerification.verifiedBy = null;
        onboarding.hrVerification.verifiedAt = null;
        onboarding.hrVerification.status = null;
        onboarding.hrVerification.remarks = '';
      }
    } else {
      if (onboarding.status !== ONBOARDING_STATUS.PENDING_DOCUMENTS) {
        onboarding.status = ONBOARDING_STATUS.PENDING_DOCUMENTS;
        onboarding.appendHistory({
          status: ONBOARDING_STATUS.PENDING_DOCUMENTS,
          userId: req.user._id,
          remark: 'Awaiting remaining documents'
        });
      }
    }

    await onboarding.save();
    await onboarding.populate('user', 'firstName lastName email role');

    return res.status(200).json({
      message: 'Documents uploaded successfully',
      onboarding: serializeOnboarding(onboarding)
    });
  } catch (error) {
    next(error);
  }
};

export const getHROnboardingList = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = { archived: false };

    if (status) {
      filter.status = status;
    }

    const onboardingList = await Onboarding.find(filter)
      .populate('user', 'firstName lastName email role isActive');

    return res.status(200).json({
      message: 'Onboarding records retrieved',
      onboarding: onboardingList.map(serializeOnboarding)
    });
  } catch (error) {
    next(error);
  }
};

export const getHROnboardingDetails = async (req, res, next) => {
  try {
    const { userId } = req.params;
    assertObjectId(userId);

    const onboarding = await ensureOnboardingRecord(userId);
    await onboarding.populate('user', 'firstName lastName email role isActive');

    return res.status(200).json({
      message: 'Onboarding details retrieved',
      onboarding: serializeOnboarding(onboarding)
    });
  } catch (error) {
    next(error);
  }
};

export const uploadHRDocuments = async (req, res, next) => {
  try {
    const { userId } = req.params;
    assertObjectId(userId);

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const onboarding = await ensureOnboardingRecord(userId);

    for (const field of HR_DOCUMENT_FIELDS) {
      const file = req.files[field]?.[0];
      if (!file) continue;

      await removeExistingAsset(onboarding.hrDocuments[field]);

      const uploadedDocument = await uploadBufferToCloudinary(file.buffer, {
        folder: `onboarding/${userId}/hr`,
        public_id: `${field}-${Date.now()}`
      });

      onboarding.hrDocuments[field] = {
        url: uploadedDocument.secure_url,
        publicId: uploadedDocument.public_id,
        uploadedAt: new Date(),
        uploadedBy: req.user._id
      };
    }

    await onboarding.save();
    await onboarding.populate('user', 'firstName lastName email role');

    return res.status(200).json({
      message: 'HR documents uploaded successfully',
      onboarding: serializeOnboarding(onboarding)
    });
  } catch (error) {
    next(error);
  }
};

export const verifyOnboarding = async (req, res, next) => {
  try {
    const { userId } = req.params;
    assertObjectId(userId);

    const { decision, remarks } = req.body;
    if (!decision) {
      return res.status(400).json({ message: 'Decision (verified/rejected) is required' });
    }

    const normalizedDecision = decision.toLowerCase();
    let targetStatus;
    if (normalizedDecision === 'verified') {
      targetStatus = ONBOARDING_STATUS.VERIFIED;
    } else if (normalizedDecision === 'rejected') {
      targetStatus = ONBOARDING_STATUS.REJECTED;
    } else {
      return res.status(400).json({ message: 'Decision must be either "verified" or "rejected"' });
    }

    if (targetStatus === ONBOARDING_STATUS.REJECTED && !remarks) {
      return res.status(400).json({ message: 'Remarks are required when rejecting onboarding' });
    }

    const onboarding = await ensureOnboardingRecord(userId);

    const hasAllDocs = REQUIRED_EMPLOYEE_DOCS.every((field) => onboarding.employeeDocuments[field]);
    if (!hasAllDocs) {
      return res.status(400).json({ message: 'Employee has not uploaded all required documents' });
    }

    if (targetStatus === ONBOARDING_STATUS.VERIFIED) {
      const hasHRDocs = HR_DOCUMENT_FIELDS.every((field) => onboarding.hrDocuments[field]);
      if (!hasHRDocs) {
        return res.status(400).json({ message: 'Upload Code of Conduct, NDA, and Employment Agreement before verifying' });
      }
    }

    onboarding.status = targetStatus;
    onboarding.hrVerification.verifiedBy = req.user._id;
    onboarding.hrVerification.verifiedAt = new Date();
    onboarding.hrVerification.status = targetStatus;
    onboarding.hrVerification.remarks = remarks || '';
    onboarding.appendHistory({
      status: targetStatus,
      userId: req.user._id,
      remark: remarks || (targetStatus === ONBOARDING_STATUS.VERIFIED ? 'Onboarding verified by HR' : 'Onboarding rejected by HR')
    });

    await onboarding.save();
    await onboarding.populate('user', 'firstName lastName email role');

    return res.status(200).json({
      message: `Onboarding ${targetStatus === ONBOARDING_STATUS.VERIFIED ? 'verified' : 'rejected'}`,
      onboarding: serializeOnboarding(onboarding)
    });
  } catch (error) {
    next(error);
  }
};

export const getOnboardingSummary = async (req, res, next) => {
  try {
    const summary = await Onboarding.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    return res.status(200).json({
      message: 'Onboarding summary retrieved',
      summary
    });
  } catch (error) {
    next(error);
  }
};

// Archive helpers and endpoints
const finalizeToArchiveInternal = async (onboarding) => {
  if (!onboarding) return;
  const userId = onboarding.user;
  await EmployeeDocuments.findOneAndUpdate(
    { user: userId },
    {
      user: userId,
      employeeDetails: onboarding.employeeDetails || {},
      employeeDocuments: onboarding.employeeDocuments || {},
      hrDocuments: onboarding.hrDocuments || {},
      hrDocumentsList: onboarding.hrDocumentsList || [],
      finalizedAt: new Date(),
    },
    { upsert: true, new: true }
  );
  onboarding.archived = true;
  await onboarding.save();
};

export const finalizeOnboardingToEmployeeDocs = async (req, res, next) => {
  try {
    const { userId } = req.params;
    assertObjectId(userId);
    const onboarding = await ensureOnboardingRecord(userId);
    if (onboarding.status !== ONBOARDING_STATUS.VERIFIED) {
      return res.status(400).json({ message: 'Onboarding must be verified before finalizing' });
    }
    await finalizeToArchiveInternal(onboarding);
    return res.status(200).json({ message: 'Onboarding finalized to employee archive' });
  } catch (error) {
    next(error);
  }
};

export const listArchivedEmployeeDocuments = async (req, res, next) => {
  try {
    const list = await EmployeeDocuments.find().populate('user', 'firstName lastName email role isActive');
    return res.status(200).json({ employees: list });
  } catch (error) {
    next(error);
  }
};

export const getArchivedEmployeeDocuments = async (req, res, next) => {
  try {
    const { userId } = req.params;
    assertObjectId(userId);
    const doc = await EmployeeDocuments.findOne({ user: userId }).populate('user', 'firstName lastName email role isActive');
    if (!doc) return res.status(404).json({ message: 'Archive not found' });
    return res.status(200).json({ employee: doc });
  } catch (error) {
    next(error);
  }
};

export const streamHROnboardingDocument = async (req, res, next) => {
  try {
    const { userId, scope, docKey } = req.params;
    assertObjectId(userId);

    const onboarding = await ensureOnboardingRecord(userId);
    if (!onboarding) {
      return res.status(404).json({ message: 'Onboarding record not found' });
    }

    let sourceDoc = null;
    if (scope === 'employee') {
      sourceDoc = onboarding.employeeDocuments?.[docKey] || null;
    } else if (scope === 'hr') {
      sourceDoc = onboarding.hrDocuments?.[docKey] || null;
    } else if (scope === 'generic') {
      const genericDoc = onboarding.hrDocumentsList?.find?.((d) => String(d._id) === docKey);
      sourceDoc = genericDoc || null;
    } else {
      return res.status(400).json({ message: 'Invalid scope' });
    }

    const document = sourceDoc?.url ? sourceDoc : sourceDoc?.file || null;

    if (!document?.url) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const rawUrl = document.url || '';
    const lowerUrl = rawUrl.toLowerCase();
    const match = lowerUrl.match(/res\.cloudinary\.com\/[^/]+\/(raw|image|video)\/([^/]+)\//);
    const resourceType = match ? match[1] : 'raw';
    const deliveryType = match ? match[2] : 'upload';
    const extMatch = lowerUrl.match(/\.([a-z0-9]+)(?:\?|$)/);
    const ext = extMatch ? extMatch[1] : undefined;

    const options = {
      secure: true,
      resource_type: resourceType,
      type: deliveryType,
      sign_url: true,
      expires_at: Math.floor(Date.now() / 1000) + 300,
    };

    if (ext && !document.publicId?.toLowerCase().endsWith(`.${ext}`)) {
      options.format = ext;
    }

    let sourceUrl = rawUrl;
    if (document.publicId) {
      const format = options.format;
      const signed = cloudinary.utils?.private_download_url
        ? cloudinary.utils.private_download_url(document.publicId, format, options)
        : null;
      sourceUrl = signed || cloudinary.url(document.publicId, options);
    }

    const remoteResponse = await fetch(sourceUrl);
    if (!remoteResponse.ok) {
      console.error('HR onboarding document fetch failed:', sourceUrl, remoteResponse.status, remoteResponse.statusText);
      return res.status(502).json({ message: 'Failed to retrieve document from storage' });
    }

    const buffer = Buffer.from(await remoteResponse.arrayBuffer());
    const contentType = remoteResponse.headers.get('content-type') || 'application/octet-stream';
    const filename = document.url.split('/').pop() || `${docKey}`;
    const dispositionType = req.query.download === '1' ? 'attachment' : 'inline';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `${dispositionType}; filename="${filename}"`);
    res.status(200).send(buffer);
  } catch (error) {
    next(error);
  }
};

// Archive all verified onboarding records that are not yet archived
export const finalizeAllVerifiedOnboarding = async (req, res, next) => {
  try {
    const toArchive = await Onboarding.find({ status: ONBOARDING_STATUS.VERIFIED, archived: false });
    let archivedCount = 0;
    for (const ob of toArchive) {
      try {
        await finalizeToArchiveInternal(ob);
        archivedCount += 1;
      } catch (e) {
        // continue archiving others
        console.error('Failed to archive onboarding', String(ob?.user), e?.message || e);
      }
    }
    return res.status(200).json({ message: 'Finalize complete', archivedCount });
  } catch (error) {
    next(error);
  }
};
