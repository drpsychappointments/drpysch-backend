// utils/razorpay.js
import Razorpay from "razorpay";
import dotenv from "dotenv";
dotenv.config(); // Safe to call here again if not already  

export const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});
