import Razorpay from 'razorpay';
import crypto from 'crypto';

const getInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new Error('Razorpay keys are not configured in environment variables');
  }

  return new Razorpay({ key_id, key_secret });
};

const createOrder = async ({ amount, currency = 'INR', receipt }) => {
  const instance = getInstance();
  const options = {
    amount, // amount in paise
    currency,
    receipt,
    payment_capture: 1,
  };

  const order = await instance.orders.create(options);
  return order;
};

const verifySignature = ({ order_id, payment_id, signature }) => {
  const secret = process.env.RAZORPAY_KEY_SECRET || '';
  const shasum = crypto.createHmac('sha256', secret).update(`${order_id}|${payment_id}`).digest('hex');
  return shasum === signature;
};

export default {
  createOrder,
  verifySignature,
};
