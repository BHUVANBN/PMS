import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input, Button } from '../../components/ui';
import { authAPI } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  
  const [step, setStep] = useState('email'); // 'email', 'code', 'password'
  const [formData, setFormData] = useState({
    email: '',
    resetCode: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const validateEmail = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCode = () => {
    const newErrors = {};
    
    if (!formData.resetCode) {
      newErrors.resetCode = 'Reset code is required';
    } else if (formData.resetCode.length !== 6) {
      newErrors.resetCode = 'Reset code must be 6 digits';
    } else if (!/^\d{6}$/.test(formData.resetCode)) {
      newErrors.resetCode = 'Reset code must contain only numbers';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors = {};

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSendResetCode = async (e) => {
    e.preventDefault();
    
    if (!validateEmail()) {
      return;
    }

    try {
      setLoading(true);
      setErrors({});
      setMessage('');

      const response = await authAPI.forgotPassword({
        email: formData.email.toLowerCase().trim()
      });

      if (response.success) {
        setStep('code');
        setMessage('Reset code sent to your email. Please check your inbox.');
        setResendCooldown(60); // 60 seconds cooldown
      }
    } catch (error) {
      console.error('Send reset code error:', error);
      
      if (error.response?.status === 404) {
        setErrors({ 
          email: 'No account found with this email address' 
        });
      } else if (error.response?.data?.message) {
        setErrors({ 
          general: error.response.data.message 
        });
      } else {
        setErrors({ 
          general: 'Failed to send reset code. Please try again.' 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    
    if (!validateCode()) {
      return;
    }

    try {
      setLoading(true);
      setErrors({});
      setMessage('');

      const response = await authAPI.verifyResetCode({
        email: formData.email.toLowerCase().trim(),
        resetCode: formData.resetCode
      });

      if (response.success) {
        setStep('password');
        setMessage('Code verified! Please enter your new password.');
      }
    } catch (error) {
      console.error('Verify code error:', error);
      
      if (error.response?.status === 400) {
        setErrors({ 
          resetCode: 'Invalid or expired reset code' 
        });
      } else if (error.response?.data?.message) {
        setErrors({ 
          general: error.response.data.message 
        });
      } else {
        setErrors({ 
          general: 'Failed to verify code. Please try again.' 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!validatePassword()) {
      return;
    }

    try {
      setLoading(true);
      setErrors({});
      setMessage('');

      const response = await authAPI.resetPassword({
        email: formData.email.toLowerCase().trim(),
        resetCode: formData.resetCode,
        newPassword: formData.newPassword
      });

      if (response.success) {
        // Password reset successful - redirect to login with success message
        navigate('/auth/login', {
          state: {
            message: 'Password reset successful! Please sign in with your new password.',
            type: 'success'
          }
        });
      }
    } catch (error) {
      console.error('Reset password error:', error);
      
      if (error.response?.status === 400) {
        setErrors({ 
          general: 'Invalid or expired reset code. Please start over.' 
        });
      } else if (error.response?.data?.message) {
        setErrors({ 
          general: error.response.data.message 
        });
      } else {
        setErrors({ 
          general: 'Failed to reset password. Please try again.' 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;

    try {
      setLoading(true);
      setErrors({});

      const response = await authAPI.forgotPassword({
        email: formData.email.toLowerCase().trim()
      });

      if (response.success) {
        setMessage('Reset code resent to your email.');
        setResendCooldown(60);
      }
    } catch (error) {
      console.error('Resend code error:', error);
      setErrors({ 
        general: 'Failed to resend code. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-600">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2 2 2 0 00-2-2m-2-4H9a2 2 0 00-2 2v10a2 2 0 002 2h6a2 2 0 002-2M9 7h6m-6 4h6m-6 4h6" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {step === 'email' && 'Reset your password'}
            {step === 'code' && 'Enter reset code'}
            {step === 'password' && 'Create new password'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {step === 'email' && 'Enter your email to receive a reset code'}
            {step === 'code' && 'Check your email for the 6-digit code'}
            {step === 'password' && 'Enter your new password'}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center space-x-4">
          <div className={`flex items-center ${step === 'email' ? 'text-blue-600' : step === 'code' || step === 'password' ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === 'email' ? 'bg-blue-600 text-white' : step === 'code' || step === 'password' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              1
            </div>
            <span className="ml-2 text-sm font-medium">Email</span>
          </div>
          <div className={`w-8 h-0.5 ${step === 'code' || step === 'password' ? 'bg-green-600' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center ${step === 'code' ? 'text-blue-600' : step === 'password' ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === 'code' ? 'bg-blue-600 text-white' : step === 'password' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              2
            </div>
            <span className="ml-2 text-sm font-medium">Code</span>
          </div>
          <div className={`w-8 h-0.5 ${step === 'password' ? 'bg-green-600' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center ${step === 'password' ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === 'password' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              3
            </div>
            <span className="ml-2 text-sm font-medium">Reset</span>
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-green-700">{message}</p>
            </div>
          </div>
        )}

        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-700">{errors.general}</p>
            </div>
          </div>
        )}

        {/* Step 1: Email Form */}
        {step === 'email' && (
          <form className="mt-8 space-y-6" onSubmit={handleSendResetCode}>
            <div>
              <Input
                name="email"
                type="email"
                label="Email Address"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleInputChange}
                error={errors.email}
                required
                fullWidth
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                }
                iconPosition="left"
              />
            </div>

            <div>
              <Button
                type="submit"
                fullWidth
                size="lg"
                loading={loading}
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Reset Code'}
              </Button>
            </div>
          </form>
        )}

        {/* Step 2: Code Verification Form */}
        {step === 'code' && (
          <form className="mt-8 space-y-6" onSubmit={handleVerifyCode}>
            <div>
              <Input
                name="resetCode"
                type="text"
                label="Reset Code"
                placeholder="Enter 6-digit code"
                value={formData.resetCode}
                onChange={handleInputChange}
                error={errors.resetCode}
                required
                fullWidth
                maxLength={6}
                className="text-center text-2xl tracking-widest"
                helperText="Check your email for the 6-digit reset code"
              />
            </div>

            <div className="flex space-x-4">
              <Button
                type="submit"
                fullWidth
                size="lg"
                loading={loading}
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </Button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendCooldown > 0 || loading}
                className={`text-sm ${resendCooldown > 0 || loading ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-500'} transition-colors`}
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
              </button>
            </div>
          </form>
        )}

        {/* Step 3: New Password Form */}
        {step === 'password' && (
          <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
            <div className="space-y-4">
              <Input
                name="newPassword"
                type={showPassword ? 'text' : 'password'}
                label="New Password"
                placeholder="Enter new password"
                value={formData.newPassword}
                onChange={handleInputChange}
                error={errors.newPassword}
                required
                fullWidth
                icon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                }
                iconPosition="right"
                helperText="Must be at least 8 characters with uppercase, lowercase, and number"
              />

              <Input
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                label="Confirm New Password"
                placeholder="Confirm new password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                error={errors.confirmPassword}
                required
                fullWidth
                icon={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                }
                iconPosition="right"
              />
            </div>

            <div>
              <Button
                type="submit"
                fullWidth
                size="lg"
                loading={loading}
                disabled={loading}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </div>
          </form>
        )}

        {/* Back to Login */}
        <div className="text-center">
          <Link
            to="/auth/login"
            className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
          >
            ← Back to Sign In
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          <p>© 2024 Project Management System. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
