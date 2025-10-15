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
    fullName: '',
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
    setForm((f) => ({ ...f, [key]: file }));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (!form.aadhar && !form.photo && !form.tenth && !form.twelfth && !form.diploma && !form.passbook) {
      setError('Please select at least one document to upload');
      return;
    }
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      const fd = new FormData();
      if (form.aadhar) fd.append('aadhar', form.aadhar);
      if (form.photo) fd.append('photo', form.photo);
      if (form.tenth) fd.append('tenth', form.tenth);
      if (form.twelfth) fd.append('twelfth', form.twelfth);
      if (form.diploma) fd.append('diploma', form.diploma);
      if (form.passbook) fd.append('passbook', form.passbook);
      // Basic details
      if (form.mobile) fd.append('mobile', form.mobile);
      if (form.address) fd.append('address', form.address);
      if (form.dateOfBirth) fd.append('dateOfBirth', form.dateOfBirth);
      if (form.pan) fd.append('pan', form.pan);
      if (form.emergencyContactName) fd.append('emergencyContactName', form.emergencyContactName);
      if (form.emergencyContactPhone) fd.append('emergencyContactPhone', form.emergencyContactPhone);
      if (form.bankAccountNumber) fd.append('bankAccountNumber', form.bankAccountNumber);
      if (form.ifsc) fd.append('ifsc', form.ifsc);

      let res;
      if (isAuthenticated) {
        res = await employeeAPI.uploadOnboardingDocuments(fd);
      } else {
        // For public submission include fullName and email
        if (form.fullName) fd.append('fullName', form.fullName);
        if (form.email) fd.append('email', form.email);
        res = await publicAPI.submitOnboarding(fd);
      }
      setOnboarding(res.onboarding);
      setStatus(res.onboarding?.status || status);
      setSuccess('Documents uploaded successfully');
      navigate('/onboarding-success', { replace: true });
    } catch (e) {
      setError(e.message || 'Failed to upload documents');
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
                    <label>Full Name</label>
                    <input
                      className="input"
                      value={form.fullName}
                      onChange={(e)=>setForm(f=>({...f, fullName:e.target.value}))}
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="field">
                    <label>Email</label>
                    <input
                      type="email"
                      className="input"
                      value={form.email}
                      onChange={(e)=>setForm(f=>({...f, email:e.target.value}))}
                      placeholder="you@example.com"
                    />
                  </div>
                </>
              )}
              <div className="field">
                <label>Mobile Number</label>
                <input
                  className="input"
                  value={form.mobile}
                  onChange={(e)=>setForm(f=>({...f, mobile:e.target.value}))}
                  placeholder="Optional"
                />
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
                <label>Emergency Contact Name</label>
                <input
                  className="input"
                  value={form.emergencyContactName}
                  onChange={(e)=>setForm(f=>({...f, emergencyContactName:e.target.value}))}
                />
              </div>
              <div className="field">
                <label>Emergency Contact Phone</label>
                <input
                  className="input"
                  value={form.emergencyContactPhone}
                  onChange={(e)=>setForm(f=>({...f, emergencyContactPhone:e.target.value}))}
                  placeholder="10-digit"
                />
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
                <label>Aadhar Card</label>
                <input type="file" accept="image/*,.pdf" className="file-input"
                  onChange={(e)=>handleFileChange('aadhar', e.target.files?.[0] || null)} />
              </div>
              <div className="field">
                <label>Passport-size Photo</label>
                <input type="file" accept="image/*,.jpeg,.png,.jpg" className="file-input"
                  onChange={(e)=>handleFileChange('photo', e.target.files?.[0] || null)} />
              </div>
              <div className="field">
                <label>Passbook Photo</label>
                <input type="file" accept="image/*,.jpeg,.png,.jpg,.pdf" className="file-input"
                  onChange={(e)=>handleFileChange('passbook', e.target.files?.[0] || null)} />
              </div>
              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <label>10th Marks Card</label>
                <input type="file" accept="image/*,.pdf" className="file-input"
                  onChange={(e)=>handleFileChange('tenth', e.target.files?.[0] || null)} />
              </div>
              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <label>12th Marks Card</label>
                <input type="file" accept="image/*,.pdf" className="file-input"
                  onChange={(e)=>handleFileChange('twelfth', e.target.files?.[0] || null)} />
              </div>
              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <label>Diploma Certificate (if applicable)</label>
                <input type="file" accept="image/*,.pdf" className="file-input"
                  onChange={(e)=>handleFileChange('diploma', e.target.files?.[0] || null)} />
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
