// controllers/paymentController.js
import { razorpayInstance } from "../utils/razorpay.js";
import Payment from "../models/Payment.model.js";


// POST /api/payment/create-order
export const recordPayment = async (req, res) => {
  const { amount, userId } = req.body;

  const options = {
    amount: amount * 100,
    currency: "INR",
    receipt: `rcpt_${Date.now()}`,
  };

  const order = await razorpayInstance.orders.create(options);

  // Save payment record as "pending"
  await Payment.create({
    userId,
    amount,
    paymentStatus: "pending",
    transactionId: order.id,
  });

  res.json(order);
};

// export const recordPayment = async (req, res) => {
//   try {
//     const instance = new Razorpay({
//       key_id: process.env.RAZORPAY_KEY_ID,
//       key_secret: process.env.RAZORPAY_SECRET,
//     });

//     const options = {
//       amount: 50000, // amount in smallest currency unit
//       currency: "INR",
//       receipt: "receipt_order_74394",
//     };

//     const order = await instance.orders.create(options);

//     if (!order) return res.status(500).send("Some error occured");

//     res.json(order);
//   } catch (error) {
//     res.status(500).send(error);
//   }

//   try {
//     const payment = new Payment(req.body);
//     await payment.save();
//     res.status(201).json(payment);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// };

export const getAllPayments = async (_, res) =>
  res.json(await Payment.find().populate("userId sessionId"));
