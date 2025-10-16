import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  url: { type: String, required: true },
  publicId: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { _id: false });

const employeeDocumentsArchiveSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  // Snapshot of onboarding details at time of finalization
  employeeDetails: {
    mobile: { type: String, default: '' },
    address: { type: String, default: '' },
    dateOfBirth: { type: Date, default: null },
    pan: { type: String, default: '' },
    emergencyContactName: { type: String, default: '' },
    emergencyContactPhone: { type: String, default: '' },
    bankAccountNumber: { type: String, default: '' },
    ifsc: { type: String, default: '' },
  },
  employeeDocuments: {
    aadhar: { type: documentSchema, default: null },
    photo: { type: documentSchema, default: null },
    tenth: { type: documentSchema, default: null },
    twelfth: { type: documentSchema, default: null },
    diploma: { type: documentSchema, default: null },
    passbook: { type: documentSchema, default: null },
  },
  hrDocuments: {
    codeOfConduct: { type: documentSchema, default: null },
    nda: { type: documentSchema, default: null },
    employmentAgreement: { type: documentSchema, default: null },
  },
  hrDocumentsList: {
    type: [new mongoose.Schema({
      name: { type: String, required: true },
      description: { type: String, default: '' },
      file: { type: documentSchema, required: true },
    }, { _id: true })],
    default: [],
  },
  finalizedAt: { type: Date, default: Date.now },
}, { timestamps: true });

const EmployeeDocuments = mongoose.models.EmployeeDocuments || mongoose.model('EmployeeDocuments', employeeDocumentsArchiveSchema);

export { EmployeeDocuments };
