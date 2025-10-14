import mongoose from 'mongoose';

const ONBOARDING_STATUS = {
  PENDING_DOCUMENTS: 'pending_documents',
  PENDING_VERIFICATION: 'pending_verification',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
};

const documentSchema = new mongoose.Schema({
  url: { type: String, required: true },
  publicId: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { _id: false });

const noteSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
}, { _id: false });

const onboardingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  status: {
    type: String,
    enum: Object.values(ONBOARDING_STATUS),
    default: ONBOARDING_STATUS.PENDING_DOCUMENTS,
  },
  employeeDocuments: {
    aadhar: { type: documentSchema, default: null },
    photo: { type: documentSchema, default: null },
    education: { type: documentSchema, default: null },
  },
  hrDocuments: {
    codeOfConduct: { type: documentSchema, default: null },
    nda: { type: documentSchema, default: null },
    employmentAgreement: { type: documentSchema, default: null },
  },
  hrVerification: {
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    verifiedAt: { type: Date, default: null },
    status: {
      type: String,
      enum: [ONBOARDING_STATUS.VERIFIED, ONBOARDING_STATUS.REJECTED],
      default: null,
    },
    remarks: { type: String, default: '' },
  },
  notes: { type: [noteSchema], default: [] },
  history: {
    type: [
      {
        status: { type: String, enum: Object.values(ONBOARDING_STATUS) },
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        remark: { type: String, default: '' },
      },
    ],
    default: [],
  },
}, { timestamps: true });

onboardingSchema.methods.appendHistory = function appendHistory({ status, userId, remark }) {
  this.history.push({ status, changedBy: userId || null, remark: remark || '', changedAt: new Date() });
};

onboardingSchema.pre('save', function handleInitialHistory(next) {
  if (this.isNew && this.history.length === 0) {
    this.history.push({ status: this.status, changedBy: this.user || null, changedAt: new Date(), remark: '' });
  }
  next();
});

const Onboarding = mongoose.models.Onboarding || mongoose.model('Onboarding', onboardingSchema);

export { Onboarding, onboardingSchema, ONBOARDING_STATUS };
