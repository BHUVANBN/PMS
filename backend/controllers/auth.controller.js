import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User, USER_ROLES } from '../models/index.js';
import { sendMail } from '../utils/mailer.js';

const isProduction = process.env.NODE_ENV === 'production';

// ─── JWT signing ─────────────────────────────────────────────────────────────
const signToken = (user) =>
  jwt.sign(
    { id: user._id.toString(), role: user.role, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

const FRONTEND_BASE_URL = process.env.FRONTEND_URL || 'http://localhost:5174';

// ─── Cookie helper ────────────────────────────────────────────────────────────
const setCookieToken = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProduction,          // HTTPS-only in production
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 24 * 60 * 60 * 1000,  // 1 day
  });
};

// ─── Password strength validation ────────────────────────────────────────────
const validatePasswordStrength = (password) => {
  if (!password || password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
  return null; // valid
};

// ─── Login ────────────────────────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    // Allow login with either username or email
    const user = await User.findOne({
      $or: [{ username }, { email: username.toLowerCase() }],
      isActive: true,
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    let firstLogin = false;
    if (!user.isVerifiedByHR) {
      user.isVerifiedByHR = true;
      firstLogin = true;
    }

    // Update last login timestamp
    user.lastLogin = new Date();
    await user.save();

    const token = signToken(user);
    setCookieToken(res, token);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      role: user.role,
      firstLogin,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// ─── Logout ───────────────────────────────────────────────────────────────────
export const logout = async (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
    });
    return res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error during logout' });
  }
};

// ─── Register ─────────────────────────────────────────────────────────────────
export const register = async (req, res) => {
  try {
    const { username, email, password, role, firstName, lastName } = req.body;

    if (!username || !email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'username, email, password, firstName, and lastName are required',
      });
    }

    // Validate password strength
    const pwError = validatePasswordStrength(password);
    if (pwError) {
      return res.status(400).json({ success: false, message: pwError });
    }

    const allowedRoles = Object.values(USER_ROLES);
    const selectedRole = role && allowedRoles.includes(role) ? role : USER_ROLES.EMPLOYEE;

    const existing = await User.findOne({ $or: [{ username }, { email: email.toLowerCase() }] });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Username or email already exists' });
    }

    const salt = await bcrypt.genSalt(12);
    const hashed = await bcrypt.hash(password, salt);

    const user = await User.create({
      username,
      email: email.toLowerCase(),
      password: hashed,
      role: selectedRole,
      firstName,
      lastName,
    });

    const token = signToken(user);
    setCookieToken(res, token);

    return res.status(201).json({
      success: true,
      message: 'Registered successfully',
      token,
      role: user.role,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

// ─── Verify Token ─────────────────────────────────────────────────────────────
export const verifyToken = async (req, res) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password -resetPasswordToken -resetPasswordExpires -twoFactorSecret');

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid token or inactive user' });
    }

    return res.status(200).json({
      success: true,
      message: 'Token valid',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.profilePicture,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired' });
    }
    return res.status(500).json({ success: false, message: 'Server error during token verification' });
  }
};

// ─── Refresh Token ────────────────────────────────────────────────────────────
export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid token or inactive user' });
    }

    const newToken = signToken(user);
    setCookieToken(res, newToken);

    return res.status(200).json({
      success: true,
      message: 'Token refreshed',
      token: newToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
    return res.status(500).json({ success: false, message: 'Server error during token refresh' });
  }
};

// ─── Forgot Password ──────────────────────────────────────────────────────────
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const normalizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail, isActive: true });

    // Always return same response to prevent user enumeration
    if (!user) {
      return res.status(200).json({ success: true, message: 'If that account exists, a reset email has been sent' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const resetUrl = `${FRONTEND_BASE_URL}/reset-password?token=${resetToken}`;
    const subject = 'Password Reset Instructions — PMS';
    const html = `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Password Reset Request</h2>
          <p>You requested a password reset for your PMS account.</p>
          <p>Click the button below to reset your password. This link expires in <strong>1 hour</strong>.</p>
          <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#1976d2;color:#fff;text-decoration:none;border-radius:6px;margin:16px 0;">
            Reset Password
          </a>
          <p style="color:#666;font-size:0.85em;">If you did not request this, you can safely ignore this email. Your password will remain unchanged.</p>
          <p style="color:#666;font-size:0.85em;">If the button doesn't work, copy this link: ${resetUrl}</p>
        </body>
      </html>
    `;
    const text = `You requested a password reset. Use this link to reset: ${resetUrl}\n\nThis link expires in 1 hour. If you did not request this, ignore this email.`;

    await sendMail({ to: user.email, subject, html, text });

    return res.status(200).json({ success: true, message: 'If that account exists, a reset email has been sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── Reset Password ───────────────────────────────────────────────────────────
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ success: false, message: 'Token and password are required' });
    }

    // Validate new password strength
    const pwError = validatePasswordStrength(password);
    if (pwError) {
      return res.status(400).json({ success: false, message: pwError });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
      isActive: true,
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json({ success: true, message: 'Password reset successful. You can now log in.' });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
