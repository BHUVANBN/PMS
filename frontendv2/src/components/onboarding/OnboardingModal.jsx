import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { employeeAPI, publicAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import './OnboardingModal.css';

export default function OnboardingModal({ open, onClose, user }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [status, setStatus] = useState(null);
  const [onboarding, setOnboarding] = useState(null);

  const authenticatedName = useMemo(() => {
    return user?.firstName || user?.lastName
      ? `${user?.firstName || ''} ${user?.lastName || ''}`.trim()
      : (user?.name || user?.username || '');
  }, [user]);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    aadhar: null,
    photo: null,
    tenth: null,
    twelfth: null,
    diploma: null,
    passbook: null,
    mobile: '',
    address: '',
    dateOfBirth: '',
    pan: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    bankAccountNumber: '',
    ifsc: '',
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!form.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!form.email) newErrors.email = 'Email is required';
    if (!form.mobile) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(form.mobile)) {
      newErrors.mobile = 'Mobile number must be 10 digits';
    }
    if (!form.emergencyContactPhone) {
      newErrors.emergencyContactPhone = 'Emergency contact is required';
    } else if (!/^\d{10}$/.test(form.emergencyContactPhone)) {
      newErrors.emergencyContactPhone = 'Must be 10 digits';
    }
    if (!form.aadhar) newErrors.aadhar = 'Aadhar card is required';
    if (!form.photo) newErrors.photo = 'Passport photo is required';
    if (!form.tenth) newErrors.tenth = '10th marks card is required';
    if (!form.twelfth) newErrors.twelfth = '12th marks card is required';
    if (!form.passbook) newErrors.passbook = 'Passbook photo is required';
    if (!form.address) newErrors.address = 'Address is required';
    if (!form.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!form.pan) newErrors.pan = 'PAN is required';
    if (!form.emergencyContactName) newErrors.emergencyContactName = 'Emergency contact name is required';
    if (!form.bankAccountNumber) newErrors.bankAccountNumber = 'Bank account number is required';
    if (!form.ifsc) newErrors.ifsc = 'IFSC code is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const loadStatus = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await employeeAPI.getOnboardingStatus();
      setOnboarding(res.onboarding);
      setStatus(res.onboarding?.status || 'pending_documents');
    } catch (e) {
      setError(e.message || 'Failed to load onboarding status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    // Only attempt to load onboarding status when authenticated
    if (isAuthenticated) {
      loadStatus();
    } else {
      setOnboarding(null);
      setStatus(null);
      setError('');
      setSuccess('');
    }
  }, [open, isAuthenticated]);

  const handleFileChange = (key, file) => {
    setForm((f) => ({
      ...f,
      [key]: file || null
    }));
    
    // Clear error for this field when a file is selected
    if (file) {
      setErrors(prev => ({
        ...prev,
        [key]: undefined
      }));
    }
  };

  const validateFile = (file, allowedTypes, maxSizeMB = 5) => {
    if (!file) return { valid: false, error: 'File is required' };
    
    // Check file type
    const fileType = file.type;
    const fileExt = file.name.split('.').pop().toLowerCase();
    
    if (allowedTypes.includes('pdf') && fileType !== 'application/pdf' && fileExt !== 'pdf') {
      return { valid: false, error: 'Only PDF files are allowed' };
    }
    
    if (allowedTypes.includes('image') && !fileType.startsWith('image/')) {
      return { valid: false, error: 'Only image files are allowed' };
    }
    
    // Check file size (5MB default)
    if (file.size > maxSizeMB * 1024 * 1024) {
      return { valid: false, error: `File size must be less than ${maxSizeMB}MB` };
    }
    
    return { valid: true };
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    
    // Validate all form fields
    if (!validateForm()) {
      setError('Please fill in all required fields correctly');
      return;
    }

    // File validations
    const fileValidations = [
      { 
        key: 'aadhar', 
        file: form.aadhar, 
        types: ['pdf'],
        required: true,
        label: 'Aadhar Card'
      },
      { 
        key: 'photo', 
        file: form.photo, 
        types: ['image'],
        required: true,
        label: 'Passport Photo'
      },
      { 
        key: 'tenth', 
        file: form.tenth, 
        types: ['pdf'],
        required: true,
        label: '10th Marks Card'
      },
      { 
        key: 'twelfth', 
        file: form.twelfth, 
        types: ['pdf'],
        required: true,
        label: '12th Marks Card'
      },
      { 
        key: 'diploma', 
        file: form.diploma, 
        types: ['pdf'],
        required: false,
        label: 'Diploma Certificate'
      },
      { 
        key: 'passbook', 
        file: form.passbook, 
        types: ['pdf'],
        required: true,
        label: 'Passbook Photo'
      },
    ];

    // Validate files
    const newErrors = { ...errors };
    let hasFileErrors = false;

    for (const { key, file, types, required, label } of fileValidations) {
      if (required && !file) {
        newErrors[key] = `${label} is required`;
        hasFileErrors = true;
      } else if (file) {
        const { valid, error } = validateFile(file, types);
        if (!valid) {
          newErrors[key] = error;
          hasFileErrors = true;
        }
      }
    }

    if (hasFileErrors) {
      setErrors(newErrors);
      setError('Please correct the file upload errors');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const fd = new FormData();
      
      // Append all document files
      fd.append('aadhar', form.aadhar);
      fd.append('photo', form.photo);
      fd.append('tenth', form.tenth);
      fd.append('twelfth', form.twelfth);
      if (form.diploma) fd.append('diploma', form.diploma);
      fd.append('passbook', form.passbook);
      
      // Append all form data
      if (!isAuthenticated) {
        // Combine first and last name for backend
        const fullName = `${form.firstName.trim()} ${form.lastName.trim()}`.trim();
        fd.append('fullName', fullName);
        fd.append('email', form.email);
      }
      
      fd.append('mobile', form.mobile);
      fd.append('address', form.address);
      fd.append('dateOfBirth', form.dateOfBirth);
      fd.append('pan', form.pan);
      fd.append('emergencyContactName', form.emergencyContactName);
      fd.append('emergencyContactPhone', form.emergencyContactPhone);
      fd.append('bankAccountNumber', form.bankAccountNumber);
      fd.append('ifsc', form.ifsc);

      let res;
      if (isAuthenticated) {
        res = await employeeAPI.uploadOnboardingDocuments(fd);
      } else {
        res = await publicAPI.submitOnboarding(fd);
      }
      
      setOnboarding(res.onboarding);
      setStatus(res.onboarding?.status || status);
      setSuccess('Documents uploaded successfully');
      navigate('/onboarding-success', { replace: true });
    } catch (e) {
      setError(e.message || 'Failed to upload documents. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={() => { /* prevent backdrop close like standup */ }}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Employee Onboarding</h3>
          <p className="modal-subtitle">Please provide your basic details and upload the required documents for HR verification.</p>
        </div>

        <div className="modal-body">
          {error && (
            <div className="alert alert-error">{error}</div>
          )}
          {success && (
            <div className="alert alert-success">{success}</div>
          )}
          {!isAuthenticated && (
            <div className="alert alert-info">
              You can submit your onboarding details and documents without logging in. HR will verify and then share credentials.
            </div>
          )}

          {onboarding && (
            <div className="status-block">
              <h4 className="status-title">Current Onboarding Status</h4>
              <p className="status-text">{onboarding.status}</p>
              {onboarding.employeeDocuments?.aadhar && (
                <p className="status-text">Aadhar Card: <strong style={{ color: '#047857' }}>Uploaded</strong></p>
              )}
              {onboarding.employeeDocuments?.photo && (
                <p className="status-text">Passport-size Photo: <strong style={{ color: '#047857' }}>Uploaded</strong></p>
              )}
              {onboarding.employeeDocuments?.passbook && (
                <p className="status-text">Passbook Photo: <strong style={{ color: '#047857' }}>Uploaded</strong></p>
              )}
              {(onboarding.employeeDocuments?.tenth || onboarding.employeeDocuments?.twelfth || onboarding.employeeDocuments?.diploma) && (
                <>
                  {onboarding.employeeDocuments?.tenth && (
                    <p className="status-text">10th Marks Card: <strong style={{ color: '#047857' }}>Uploaded</strong></p>
                  )}
                  {onboarding.employeeDocuments?.twelfth && (
                    <p className="status-text">12th Marks Card: <strong style={{ color: '#047857' }}>Uploaded</strong></p>
                  )}
                  {onboarding.employeeDocuments?.diploma && (
                    <p className="status-text">Diploma Certificate: <strong style={{ color: '#047857' }}>Uploaded</strong></p>
                  )}
                </>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-grid two-col">
              {isAuthenticated ? (
                <div className="field">
                  <label>Name</label>
                  <input className="input" value={authenticatedName} readOnly />
                </div>
              ) : (
                <>
                  <div className="field">
                    <label className="required-field">First Name</label>
                    <input
                      className={`input ${errors.firstName ? 'input-error' : ''}`}
                      value={form.firstName}
                      onChange={(e) => {
                        setForm(f => ({ ...f, firstName: e.target.value }));
                        if (errors.firstName) {
                          setErrors(prev => ({ ...prev, firstName: '' }));
                        }
                      }}
                      placeholder="First name"
                      required
                    />
                    {errors.firstName && <div className="error-message">{errors.firstName}</div>}
                  </div>
                  <div className="field">
                    <label className="required-field">Last Name</label>
                    <input
                      className={`input ${errors.lastName ? 'input-error' : ''}`}
                      value={form.lastName}
                      onChange={(e) => {
                        setForm(f => ({ ...f, lastName: e.target.value }));
                        if (errors.lastName) {
                          setErrors(prev => ({ ...prev, lastName: '' }));
                        }
                      }}
                      placeholder="Last name"
                      required
                    />
                    {errors.lastName && <div className="error-message">{errors.lastName}</div>}
                  </div>
                  <div className="field">
                    <label className="required-field">Email</label>
                    <input
                      type="email"
                      className={`input ${errors.email ? 'input-error' : ''}`}
                      value={form.email}
                      onChange={(e) => {
                        setForm(f => ({ ...f, email: e.target.value }));
                        if (errors.email) {
                          setErrors(prev => ({ ...prev, email: '' }));
                        }
                      }}
                      placeholder="you@example.com"
                      required
                    />
                    {errors.email && <div className="error-message">{errors.email}</div>}
                  </div>
                </>
              )}
              <div className="field">
                <label className="required-field">Mobile Number</label>
                <input
                  type="tel"
                  className={`input ${errors.mobile ? 'input-error' : ''}`}
                  value={form.mobile}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setForm(f => ({ ...f, mobile: value }));
                    if (errors.mobile) {
                      setErrors(prev => ({ ...prev, mobile: '' }));
                    }
                  }}
                  placeholder="10-digit mobile number"
                  required
                />
                {errors.mobile && <div className="error-message">{errors.mobile}</div>}
                <div className="file-hint">Must be 10 digits</div>
              </div>
            </div>

            <div className="form-grid two-col" style={{ marginTop: 16 }}>
              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <label>Address</label>
                <input
                  className="input"
                  value={form.address}
                  onChange={(e)=>setForm(f=>({...f, address:e.target.value}))}
                  placeholder="Residential address"
                />
              </div>
              <div className="field">
                <label>Date of Birth</label>
                <input
                  type="date"
                  className="input"
                  value={form.dateOfBirth}
                  onChange={(e)=>setForm(f=>({...f, dateOfBirth:e.target.value}))}
                />
              </div>
              <div className="field">
                <label>PAN</label>
                <input
                  className="input"
                  value={form.pan}
                  onChange={(e)=>setForm(f=>({...f, pan:e.target.value}))}
                  placeholder="ABCDE1234F"
                />
              </div>
              <div className="field">
                <label className="required-field">Emergency Contact Name</label>
                <input
                  className={`input ${errors.emergencyContactName ? 'input-error' : ''}`}
                  value={form.emergencyContactName}
                  onChange={(e) => {
                    setForm(f => ({ ...f, emergencyContactName: e.target.value }));
                    if (errors.emergencyContactName) {
                      setErrors(prev => ({ ...prev, emergencyContactName: '' }));
                    }
                  }}
                  placeholder="Contact person's name"
                  required
                />
                {errors.emergencyContactName && <div className="error-message">{errors.emergencyContactName}</div>}
              </div>
              <div className="field">
                <label className="required-field">Emergency Contact Phone</label>
                <input
                  type="tel"
                  className={`input ${errors.emergencyContactPhone ? 'input-error' : ''}`}
                  value={form.emergencyContactPhone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setForm(f => ({ ...f, emergencyContactPhone: value }));
                    if (errors.emergencyContactPhone) {
                      setErrors(prev => ({ ...prev, emergencyContactPhone: '' }));
                    }
                  }}
                  placeholder="10-digit emergency number"
                  required
                />
                {errors.emergencyContactPhone && <div className="error-message">{errors.emergencyContactPhone}</div>}
                <div className="file-hint">Must be 10 digits</div>
              </div>
              <div className="field">
                <label>Bank Account Number</label>
                <input
                  className="input"
                  value={form.bankAccountNumber}
                  onChange={(e)=>setForm(f=>({...f, bankAccountNumber:e.target.value}))}
                />
              </div>
              <div className="field">
                <label>IFSC</label>
                <input
                  className="input"
                  value={form.ifsc}
                  onChange={(e)=>setForm(f=>({...f, ifsc:e.target.value}))}
                  placeholder="e.g., HDFC0001234"
                />
              </div>
            </div>

            <div className="form-grid two-col" style={{ marginTop: 16 }}>
              <div className="field">
                <label className="required-field">Aadhar Card <span className="file-hint">(PDF only)</span></label>
                <input 
                  type="file" 
                  accept=".pdf" 
                  className={`file-input ${errors.aadhar ? 'file-input-error' : ''}`}
                  onChange={(e) => handleFileChange('aadhar', e.target.files?.[0] || null)} 
                  required
                />
                {errors.aadhar && <div className="error-message">{errors.aadhar}</div>}
                <div className="file-hint">Upload Aadhar card in PDF format</div>
              </div>

              <div className="field">
                <label className="required-field">Passport-size Photo <span className="file-hint">(Image only)</span></label>
                <input 
                  type="file" 
                  accept="image/jpeg,image/png,image/jpg" 
                  className={`file-input ${errors.photo ? 'file-input-error' : ''}`}
                  onChange={(e) => handleFileChange('photo', e.target.files?.[0] || null)} 
                  required
                />
                {errors.photo && <div className="error-message">{errors.photo}</div>}
                <div className="file-hint">Max size: 5MB, JPG/PNG only</div>
              </div>

              <div className="field">
                <label className="required-field">Passbook Photo <span className="file-hint">(PDF only)</span></label>
                <input 
                  type="file" 
                  accept=".pdf" 
                  className={`file-input ${errors.passbook ? 'file-input-error' : ''}`}
                  onChange={(e) => handleFileChange('passbook', e.target.files?.[0] || null)} 
                  required
                />
                {errors.passbook && <div className="error-message">{errors.passbook}</div>}
                <div className="file-hint">Upload bank passbook or statement in PDF format</div>
              </div>

              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <label className="required-field">10th Marks Card <span className="file-hint">(PDF only)</span></label>
                <input 
                  type="file" 
                  accept=".pdf" 
                  className={`file-input ${errors.tenth ? 'file-input-error' : ''}`}
                  onChange={(e) => handleFileChange('tenth', e.target.files?.[0] || null)} 
                  required
                />
                {errors.tenth && <div className="error-message">{errors.tenth}</div>}
              </div>

              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <label className="required-field">12th Marks Card <span className="file-hint">(PDF only)</span></label>
                <input 
                  type="file" 
                  accept=".pdf" 
                  className={`file-input ${errors.twelfth ? 'file-input-error' : ''}`}
                  onChange={(e) => handleFileChange('twelfth', e.target.files?.[0] || null)} 
                  required
                />
                {errors.twelfth && <div className="error-message">{errors.twelfth}</div>}
              </div>

              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <label>Diploma Certificate <span className="file-hint">(PDF only, if applicable)</span></label>
                <input 
                  type="file" 
                  accept=".pdf" 
                  className={`file-input ${errors.diploma ? 'file-input-error' : ''}`}
                  onChange={(e) => handleFileChange('diploma', e.target.files?.[0] || null)} 
                />
                {errors.diploma && <div className="error-message">{errors.diploma}</div>}
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>Close</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Uploading...' : 'Submit Documents'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
