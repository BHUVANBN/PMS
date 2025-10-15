import multer from 'multer';

const storage = multer.memoryStorage();

const baseUpload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024
  }
});

const employeeOnboardingUpload = baseUpload.fields([
  { name: 'aadhar', maxCount: 1 },
  { name: 'photo', maxCount: 1 },
  { name: 'tenth', maxCount: 1 },
  { name: 'twelfth', maxCount: 1 },
  { name: 'diploma', maxCount: 1 },
  { name: 'passbook', maxCount: 1 }
]);

const hrOnboardingUpload = baseUpload.fields([
  { name: 'codeOfConduct', maxCount: 1 },
  { name: 'nda', maxCount: 1 },
  { name: 'employmentAgreement', maxCount: 1 }
]);

const publicOnboardingUpload = baseUpload.fields([
  { name: 'aadhar', maxCount: 1 },
  { name: 'photo', maxCount: 1 },
  { name: 'tenth', maxCount: 1 },
  { name: 'twelfth', maxCount: 1 },
  { name: 'diploma', maxCount: 1 },
  { name: 'passbook', maxCount: 1 }
]);

export {
  baseUpload,
  employeeOnboardingUpload,
  hrOnboardingUpload,
  publicOnboardingUpload
};
