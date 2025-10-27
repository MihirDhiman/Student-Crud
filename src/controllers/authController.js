import { db } from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createTransporter, loadTemplate } from "../helper/mailer.js";
import { sendSuccess, sendError } from "../helper/response-helper.js";

const transporter = createTransporter();

let otpStore = {};

//Student register, verify OTP , Login
// export const register = async (req, res) => {
//   try {
//     const { name, email, password } = req.body;
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const otp = Math.floor(100000 + Math.random() * 900000);
//     otpStore[email] = otp;

//     // Insert student first
//     db.query(
//       "INSERT INTO students (name,email,password) VALUES (?,?,?)",
//       [name, email, hashedPassword],
//       (err) => {
//         if (err) {
//           console.error(err);
//           return res.status(500).json({ message: err.message });
//         }

//         // Send OTP email only after successful insert
//         const mailOptions = {
//           from: process.env.EMAIL_USER,
//           to: email,
//           subject: "OTP Verification",
//           text: `Your OTP is: ${otp}`,
//         };

//         transporter.sendMail(mailOptions, (err) => {
//           if (err) {
//             console.error(err);
//             return res.status(500).json({ message: err.message });
//           }
//           // Send response only once here
//           res.json({ message: "OTP sent to email" });
//         });
//       }
//     );
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: error.message });
//   }
// };

// export const verifyOtp = (req, res) => {
//   const { email, otp } = req.body;

//   const storedOtp = otpStore[email];
//   if (!storedOtp) {
//     return res.status(400).json({ message: "OTP expired or invalid" });
//   }

//   if (storedOtp.toString() === otp.toString()) {
//     db.query(
//       "UPDATE students SET is_verified = 1 WHERE email = ?",
//       [email],
//       (err) => {
//         if (err) return res.status(500).json({ message: err.message });
//         delete otpStore[email];
//         res.json({ message: "Email Verified successfully" });
//       }
//     );
//   } else {
//     res.status(400).json({ message: "Invalid OTP" });
//   }
// };

// export const login = (req, res) => {
//   const { email, password } = req.body;
//   db.query(
//     "SELECT * FROM students WHERE email = ?",
//     [email],
//     async (err, results) => {
//       if (err) return res.status(500).json({ message: err.message });
//       if (!results.length)
//         return res.status(400).json({ message: "Student not found" });

//       const student = results[0];
//       if (!student.is_verified)
//         return res.status(400).json({ message: "Email not verified" });

//       const validPass = await bcrypt.compare(password, student.password);
//       if (!validPass)
//         return res.status(400).json({ message: "Invalid password" });

//       const token = jwt.sign(
//         { id: student.id, email: student.email },
//         process.env.JWT_SECRET,
//         { expiresIn: "1d" }
//       );
//       res.json({ token });
//     }
//   );
// };

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000);
    otpStore[email] = otp;

    db.query(
      "INSERT INTO students (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword],
      (err) => {
        if (err) return sendError(res, err.message);

        const html = loadTemplate("otp-template.html", { name, otp });

        transporter.sendMail(
          {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "OTP Verification",
            html,
          },
          (err) => {
            if (err) return sendError(res, "Failed to send OTP email.");
            sendSuccess(res, "OTP sent successfully!");
          }
        );
      }
    );
  } catch (error) {
    sendError(res, error.message);
  }
};

export const verifyOtp = (req, res) => {
  const { email, otp } = req.body;
  const storedOtp = otpStore[email];

  if (!storedOtp) return sendError(res, "OTP expired or invalid", 400);
  if (storedOtp.toString() !== otp.toString())
    return sendError(res, "Invalid OTP", 400);
  db.query(
    "UPDATE students SET is_verified = 1 WHERE email = ?",
    [email],
    (err) => {
      if (err) return sendError(res, err.message);
      delete otpStore[email];

      const html = loadTemplate("register-template.html", {
        name: email.split("@")[0],
      });

      transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Registration Successful 🎓",
        html,
      });
      sendSuccess(res, "Email verified successfully!");
    }
  );
};

export const login = (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM students WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) return sendError(res, err.message);
      if (!results.length) return sendError(res, "Student not found", 400);

      const student = results[0];
      if (!student.is_verified)
        return sendError(res, "Email not verified", 400);

      const validPass = await bcrypt.compare(password, student.password);
      if (!validPass) return sendError(res, "Invalid password", 400);

      const token = jwt.sign(
        { id: student.id, email: student.email },
        process.env.JWT_SECRET,
        {
          expiresIn: "1d",
        }
      );
      sendSuccess(res, "Login successful!", { token });
    }
  );
};
