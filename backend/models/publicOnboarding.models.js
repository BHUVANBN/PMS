import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  url: { type: String, required: true },
  publicId: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
}, { _id: false });

const publicOnboardingSchema = new mongoose.Schema({
  // Candidate-supplied details (no auth required)
  fullName: { type: String, default: '' },
  email: { type: String, default: '' },
  mobile: { type: String, default: '' },
  address: { type: String, default: '' },
  dateOfBirth: { type: Date, default: null },
  pan: { type: String, default: '' },
  emergencyContactName: { type: String, default: '' },
  emergencyContactPhone: { type: String, default: '' },
  bankAccountNumber: { type: String, default: '' },
  ifsc: { type: String, default: '' },

  employeeDocuments: {
    aadhar: { type: documentSchema, default: null },
    photo: { type: documentSchema, default: null },
    tenth: { type: documentSchema, default: null },
    twelfth: { type: documentSchema, default: null },
    diploma: { type: documentSchema, default: null },
    passbook: { type: documentSchema, default: null },
  },

  status: {
    type: String,
    enum: ['submitted', 'reviewed', 'converted'],
    default: 'submitted',
  },
  notes: { type: String, default: '' },
}, { timestamps: true });

const PublicOnboarding = mongoose.models.PublicOnboarding || mongoose.model('PublicOnboarding', publicOnboardingSchema);

export { PublicOnboarding };
