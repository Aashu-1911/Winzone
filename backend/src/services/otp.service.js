/**
 * OTP Service
 * Generates and verifies 6-digit OTP codes
 * OTP expires in 10 minutes
 */

// Generate a random 6-digit OTP
export const generateOTP = () => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  return otp;
};

// Get OTP expiry time (10 minutes from now)
export const getOTPExpiry = () => {
  return new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
};

// Verify if OTP matches and is not expired
export const verifyOTP = (storedOTP, storedExpiry, providedOTP) => {
  if (!storedOTP || !storedExpiry || !providedOTP) {
    return { valid: false, message: 'OTP data missing' };
  }

  // Check if OTP has expired
  if (new Date() > new Date(storedExpiry)) {
    return { valid: false, message: 'OTP has expired' };
  }

  // Check if OTP matches
  if (storedOTP !== providedOTP.trim()) {
    return { valid: false, message: 'Invalid OTP' };
  }

  return { valid: true, message: 'OTP verified successfully' };
};

export default {
  generateOTP,
  getOTPExpiry,
  verifyOTP,
};
