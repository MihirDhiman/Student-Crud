import { db } from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createTransporter } from "../helper/mailer.js";

export const updateStudentStatus = (req, res) => {
  const { id, action } = req.body;
  if (!["accepted", "rejected"].includes(action))
    return res.status(400).json({ message: "Invalid action" });

  db.query(
    "UPDATE students SET status = ? WHERE id = ?",
    [action, id],
    (err) => {
      if (err) return res.status(500).json({ message: err.message });
      res.json({ message: `Student ${action}` });
    }
  );
};

export const getAllStudents = (req, res) => {
  db.query("SELECT id, name, email, status FROM students", (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(results);
  });
};

// College register login

export const collegeRegister = async (req, res) => {
  const { name, email, password } = req.body;

  db.query(
    "SELECT * FROM college_authority WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) return res.status(500).json({ message: err.message });
      if (results.length)
        return res.status(400).json({ message: "Email already exists" });

      const hashedPassword = await bcrypt.hash(password, 10);

      db.query(
        "INSERT INTO college_authority (name,email,password) VALUES (?,?,?)",
        [name, email, hashedPassword],
        (err) => {
          if (err) return res.status(500).json({ message: err.message });
          res.json({ message: "College authority registered successfully" });
        }
      );
    }
  );
};

export const collegeLogin = (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM college_authority WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) return res.status(500).json({ message: err.message });
      if (!results.length)
        return res.status(400).json({ message: "College authority not found" });

      const college = results[0];
      const validPass = await bcrypt.compare(password, college.password);
      if (!validPass)
        return res.status(400).json({ message: "Invalid password" });

      const token = jwt.sign(
        { id: college.id, email: college.email, role: "college" },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );
      res.json({ token });
    }
  );
};

// mail results

export const sendStatusEmails = (req, res) => {
  const transporter = createTransporter();

  // Get all students with their status
  db.query(
    "SELECT id, name, email, status FROM students WHERE mail_sent = 0",
    async (err, results) => {
      if (err) return res.status(500).json({ message: err.message });
      if (!results.length)
        return res
          .status(200)
          .json({ message: " All students have already been notified." });

      const emailPromises = results.map((student) => {
        const subject = "Your College Application Update";

        // Dynamic colors, icons, and messages
        let iconUrl = "";
        let heading = "";
        let message = "";
        let accentColor = "";

        if (student.status === "accepted") {
          iconUrl = "https://cdn-icons-png.flaticon.com/512/845/845646.png";
          heading = "Congratulations!";
          message =
            "We are delighted to inform you that your application has been accepted. Welcome aboard to the next exciting chapter of your academic journey.";
          accentColor = "#4b0082";
        } else if (student.status === "rejected") {
          iconUrl = "https://cdn-icons-png.flaticon.com/512/463/463612.png";
          heading = "Thank you for applying";
          message =
            "After careful consideration, we regret to inform you that your application was not successful this time. We encourage you to apply again in the future.";
          accentColor = "#a61e4d";
        } else {
          iconUrl = "https://cdn-icons-png.flaticon.com/512/565/565655.png";
          heading = "Your Application is Under Review";
          message =
            "Our admissions team is still evaluating your application. You’ll be notified once a final decision has been made.";
          accentColor = "#6f42c1";
        }

        const htmlTemplate = `
      <div style="background-color:#f4f4f8; padding:40px; font-family:'Segoe UI',Roboto,Arial,sans-serif; color:#2d2d2d;">
        <div style="max-width:640px; margin:auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <div style="background:linear-gradient(90deg, #4b0082, #6f42c1); padding:25px; text-align:center;">
            <img src="https://upload.wikimedia.org/wikipedia/commons/0/0c/Accenture.svg" alt="College Logo" width="140" style="filter:brightness(0) invert(1);"/>
            <h2 style="color:#ffffff; font-weight:600; margin-top:10px; letter-spacing:0.5px;">College Admission Portal</h2>
          </div>

          <!-- Body -->
          <div style="padding:35px 30px; text-align:center;">
            <img src="${iconUrl}" alt="Status Icon" width="80" height="80" style="margin-bottom:20px;"/>
            <h1 style="color:${accentColor}; font-size:24px; font-weight:700; margin-bottom:15px;">${heading}</h1>
            <p style="font-size:16px; line-height:1.7; color:#333333; margin-bottom:25px;">
              Hello <strong>${student.name}</strong>,<br/>
              ${message}
            </p>

            <a href="https://yourcollegewebsite.com" 
              style="background:${accentColor}; color:#fff; text-decoration:none; padding:12px 28px; border-radius:6px; font-size:15px; font-weight:500; display:inline-block; margin-top:10px;">
              Visit Portal
            </a>
          </div>

          <!-- Divider -->
          <div style="height:1px; background:#e2e2e2; margin:0 40px;"></div>

          <!-- Footer -->
          <div style="text-align:center; padding:20px 0; font-size:13px; color:#777;">
            <p>© ${new Date().getFullYear()} College Admission Office. All rights reserved.</p>
            <p style="margin-top:5px;">This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </div>
      `;

        const mailOptions = {
          from: `"College Admission Office" <${process.env.EMAIL_USER}>`,
          to: student.email,
          subject,
          html: htmlTemplate,
        };

        // Send email and mark as sent
        return new Promise((resolve, reject) => {
          transporter.sendMail(mailOptions, (error) => {
            if (error) {
              console.error(
                `❌ Failed to send email to ${student.email}:`,
                error
              );
              return reject(error);
            }
            db.query("UPDATE students SET mail_sent = 1 WHERE id = ?", [
              student.id,
            ]);
            console.log(`✅ Email sent to ${student.email}`);
            resolve();
          });
        });
      });

      try {
        await Promise.all(emailPromises);
        res.json({
          message: "✅ Status emails sent successfully to remaining students.",
        });
      } catch (error) {
        console.error(error);
        res
          .status(500)
          .json({
            message: "Failed to send some emails",
            error: error.message,
          });
      }
    }
  );
};
