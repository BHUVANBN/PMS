import mongoose from 'mongoose';
import crypto from 'crypto';
import { sendMail } from '../utils/mailer.js';
import cloudinary from '../utils/cloudinary.js';
import { uploadBufferToCloudinary } from '../utils/uploadToCloudinary.js';
import { Onboarding, ONBOARDING_STATUS, USER_ROLES } from '../models/index.js';

const REQUIRED_EMPLOYEE_DOCS = ['aadhar', 'photo', 'tenth', 'twelfth', 'diploma', 'passbook'];
const HR_DOCUMENT_FIELDS = ['codeOfConduct', 'nda', 'employmentAgreement'];

const serializeOnboarding = (doc) => {
  if (!doc) return null;
  return doc.toObject({ virtuals: true });
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
  let onboarding = await Onboarding.findOne({ user: userId });
  if (!onboarding) {
    onboarding = new Onboarding({ user: userId });
    await onboarding.save();
  }
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
    const filter = {};

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
