import { db } from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

let otpStore = {};

//Student register, verify OTP , Login
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000);
    otpStore[email] = otp;

    // Insert student first
    db.query(
      "INSERT INTO students (name,email,password) VALUES (?,?,?)",
      [name, email, hashedPassword],
      (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: err.message });
        }

        // Send OTP email only after successful insert
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: "OTP Verification",
          text: `Your OTP is: ${otp}`,
        };

        transporter.sendMail(mailOptions, (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ message: err.message });
          }
          // Send response only once here
          res.json({ message: "OTP sent to email" });
        });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export const verifyOtp = (req, res) => {
  const { email, otp } = req.body;

  const storedOtp = otpStore[email];
  if (!storedOtp) {
    return res.status(400).json({ message: "OTP expired or invalid" });
  }

  if (storedOtp.toString() === otp.toString()) {
    db.query(
      "UPDATE students SET is_verified = 1 WHERE email = ?",
      [email],
      (err) => {
        if (err) return res.status(500).json({ message: err.message });
        delete otpStore[email];
        res.json({ message: "Email Verified successfully" });
      }
    );
  } else {
    res.status(400).json({ message: "Invalid OTP" });
  }
};

export const login = (req, res) => {
  const { email, password } = req.body;
  db.query(
    "SELECT * FROM students WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) return res.status(500).json({ message: err.message });
      if (!results.length)
        return res.status(400).json({ message: "Student not found" });

      const student = results[0];
      if (!student.is_verified)
        return res.status(400).json({ message: "Email not verified" });

      const validPass = await bcrypt.compare(password, student.password);
      if (!validPass)
        return res.status(400).json({ message: "Invalid password" });

      const token = jwt.sign(
        { id: student.id, email: student.email },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );
      res.json({ token });
    }
  );
};


