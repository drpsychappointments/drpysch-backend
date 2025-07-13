// controllers/auth/user.auth.js
import User from "../../models/User.model.js";
import jwt from "jsonwebtoken";
import sendEmail from "../../utils/emailSender.js";

export const requestOTP = async (req, res) => {
  const { name, email, phone, description, gender, language } = req.body;

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({ email, phone, otpCode, otpExpires });
  } else {
    user.otpCode = otpCode;
    user.otpExpires = otpExpires;
    await user.save();
  }

  // 2. HTML Styled Email Content
  const htmlContent = `
  <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd;">
    <h2 style="color: #4CAF50;">Welcome to DrPsych!</h2>
    <p>Hello </p>
    <p>Thank you for registering with us. We’re excited to have you onboard.</p>
    <p>This is your OTP <strong>${otpCode}</stong></p>
    <p><b>Here's what you can do next:</b></p>
    <ul>
      <li>Book appointments with top therapists</li>
      <li>Get personalized mental health guidance</li>
    </ul>
    <br/>
    <a href="http://localhost:5173/home" style="background: #4CAF50; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Visit DrPsych</a>
    <p style="margin-top: 40px; font-size: 12px; color: #888;">This is an automated email, please do not reply.</p>
  </div>
`;

  await sendEmail({
    to: email,
    subject: "Welcome To Dr.Psych",
    html : htmlContent
  });
  // TODO: Send OTP via email/SMS
  res.json({ message: "OTP sent", otp: otpCode }); // remove `otp` in prod
};

export const verifyOTP = async (req, res) => {
  const { email, otpCode } = req.body;
  console.log(email, otpCode);
  const user = await User.findOne({ email });
  console.log(
    user?.otpCode,
    otpCode,
    !user || user.otpCode !== otpCode || user.otpExpires < new Date()
  );
  if (!user || user.otpCode !== otpCode || user.otpExpires < new Date()) {
    return res.status(401).json({ message: "OTP invalid or expired" });
  }

  user.otpCode = null;
  user.otpExpires = null;
  user.role = "user";
  await user.save();

  const token = jwt.sign(
    { id: user._id, role: "user" },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );

  res.json({ token, user });
};

export const verifyUserToken = async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token missing" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-otpCode -otpExpires");

    if (!user || user.role !== "user") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.json({ valid: true, user });
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
