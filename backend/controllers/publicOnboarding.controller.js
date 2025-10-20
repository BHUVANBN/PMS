import mongoose from 'mongoose';
import fetch from 'node-fetch';
import { PublicOnboarding } from '../models/publicOnboarding.models.js';
import { uploadBufferToCloudinary } from '../utils/uploadToCloudinary.js';
import cloudinary from '../utils/cloudinary.js';

export const submitPublicOnboarding = async (req, res, next) => {
  try {
    const {
      fullName,
      email,
      mobile,
      address,
      dateOfBirth,
      pan,
      emergencyContactName,
      emergencyContactPhone,
      bankAccountNumber,
      ifsc,
    } = req.body || {};

    // Basic validation for required fields
    const requiredTextFields = [
      'fullName', 'email', 'mobile', 'address', 'pan',
      'emergencyContactName', 'emergencyContactPhone', 'bankAccountNumber', 'ifsc'
    ];
    const missingFields = requiredTextFields.filter((f) => !req.body?.[f] || String(req.body[f]).trim() === '');

    // Required docs: aadhar, photo, passbook, tenth, twelfth (diploma optional)
    const requiredFiles = ['aadhar', 'photo', 'passbook', 'tenth', 'twelfth'];
    const missingFiles = requiredFiles.filter((f) => !req.files?.[f] || !req.files[f][0]);

    if (missingFields.length || missingFiles.length) {
      const err = new Error(
        `Missing required fields: ${missingFields.join(', ')}${missingFields.length && missingFiles.length ? '; ' : ''}` +
        `${missingFiles.length ? `Missing files: ${missingFiles.join(', ')}` : ''}`
      );
      err.statusCode = 400;
      throw err;
    }

    const publicRecord = new PublicOnboarding({
      fullName: fullName || '',
      email: email || '',
      mobile: mobile || '',
      address: address || '',
      pan: pan || '',
      emergencyContactName: emergencyContactName || '',
      emergencyContactPhone: emergencyContactPhone || '',
      bankAccountNumber: bankAccountNumber || '',
      ifsc: ifsc || '',
    });

    if (dateOfBirth) {
      const d = new Date(dateOfBirth);
      if (!isNaN(d.getTime())) publicRecord.dateOfBirth = d;
    }

    // Upload any provided files and attach
    const fields = ['aadhar', 'photo', 'tenth', 'twelfth', 'diploma', 'passbook'];
    for (const field of fields) {
      const file = req.files?.[field]?.[0];
      if (!file) continue;
      const uploaded = await uploadBufferToCloudinary(file.buffer, {
        folder: `onboarding/public`,
        public_id: `${field}-${Date.now()}`,
      });
      publicRecord.employeeDocuments[field] = {
        url: uploaded.secure_url,
        publicId: uploaded.public_id,
        uploadedAt: new Date(),
      };
    }

    await publicRecord.save();

    return res.status(201).json({
      message: 'Onboarding submitted successfully',
      onboarding: publicRecord,
    });
  } catch (err) {
    next(err);
  }
};

// HR: List all public onboarding submissions
export const listPublicOnboarding = async (req, res, next) => {
  try {
    const filter = { status: { $ne: 'converted' } };
    const list = await PublicOnboarding.find(filter).sort({ createdAt: -1 });
    res.json({ onboarding: list });
  } catch (err) {
    next(err);
  }
};

// HR: Approve (mark reviewed) a public onboarding submission
export const approvePublicOnboarding = async (req, res, next) => {
  try {
    const { id } = req.params;
    const record = await PublicOnboarding.findById(id);
    if (!record) {
      const err = new Error('Public onboarding record not found');
      err.statusCode = 404;
      throw err;
    }
    record.status = 'reviewed';
    await record.save();
    res.json({ message: 'Public onboarding approved', onboarding: record });
  } catch (err) {
    next(err);
  }
};

// HR: Delete a public onboarding submission
export const deletePublicOnboarding = async (req, res, next) => {
  try {
    const { id } = req.params;
    const record = await PublicOnboarding.findById(id);
    if (!record) {
      const err = new Error('Public onboarding record not found');
      err.statusCode = 404;
      throw err;
    }

    await PublicOnboarding.findByIdAndDelete(id);
    return res.status(200).json({ message: 'Public onboarding deleted' });
  } catch (err) {
    next(err);
  }
};

export const streamPublicOnboardingDocument = async (req, res, next) => {
  try {
    const { id, docKey } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid onboarding id' });
    }

    const record = await PublicOnboarding.findById(id);
    if (!record) {
      return res.status(404).json({ message: 'Public onboarding record not found' });
    }

    const document = record.employeeDocuments?.[docKey];
    if (!document?.url) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const resolveCloudinaryUrl = () => {
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

      if (ext && !document.publicId.toLowerCase().endsWith(`.${ext}`)) {
        options.format = ext;
      }

      if (!document.publicId) {
        return rawUrl;
      }

      const format = options.format;
      const signedDownloadUrl = cloudinary.utils?.private_download_url
        ? cloudinary.utils.private_download_url(document.publicId, format, options)
        : null;

      if (signedDownloadUrl) {
        return signedDownloadUrl;
      }

      return cloudinary.url(document.publicId, options);
    };

    const sourceUrl = resolveCloudinaryUrl();

    const remoteResponse = await fetch(sourceUrl);
    if (!remoteResponse.ok) {
      console.error('PublicOnboarding document fetch failed:', sourceUrl, remoteResponse.status, remoteResponse.statusText);
      return res.status(502).json({ message: 'Failed to retrieve document from storage' });
    }

    const buffer = Buffer.from(await remoteResponse.arrayBuffer());
    const contentType = remoteResponse.headers.get('content-type') || 'application/octet-stream';
    const filename = document.url.split('/').pop() || `${docKey}`;
    const dispositionType = req.query.download === '1' ? 'attachment' : 'inline';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `${dispositionType}; filename="${filename}"`);
    res.status(200).send(buffer);
  } catch (err) {
    next(err);
  }
};
