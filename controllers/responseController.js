import { db } from "../db.js";
import { createTransporter } from "../helper/mailer.js";

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
    <div style="background-color:#f6f7fb; padding:40px 0; font-family:'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#222;">
        <div style="max-width:640px; margin:auto; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 8px 20px rgba(0,0,0,0.08);">

        <!-- Header -->
        <div style="background:linear-gradient(135deg, ${accentColor}, #8e44ad); padding:28px; text-align:center;">
            <img src="https://upload.wikimedia.org/wikipedia/commons/0/0c/Accenture.svg" alt="College Logo" width="120" style="filter:brightness(0) invert(1);"/>
            <h2 style="color:#fff; font-size:22px; font-weight:600; margin-top:10px; letter-spacing:0.5px;">
            College Admission Portal
            </h2>
        </div>

        <!-- Body -->
        <div style="padding:40px 35px; text-align:center;">
            <img src="${iconUrl}" alt="Status Icon" width="90" height="90" style="margin-bottom:25px;"/>

            <h1 style="color:${accentColor}; font-size:26px; font-weight:700; margin-bottom:15px;">
            ${heading}
            </h1>

            <p style="font-size:16px; line-height:1.7; color:#555; margin-bottom:28px;">
            Hello <strong>${student.name}</strong>,<br/>
            ${message}
            </p>

            <a href="https://yourcollegewebsite.com"
            style="background:${accentColor}; color:#fff; text-decoration:none; padding:14px 36px; border-radius:8px;
                    font-size:16px; font-weight:600; display:inline-block; transition:0.3s all ease;">
            Visit Portal
            </a>
        </div>

        <!-- Divider -->
        <div style="height:1px; background:#ececec; margin:0 40px;"></div>

        <!-- Footer -->
        <div style="text-align:center; padding:25px 0 30px 0; font-size:13px; color:#777;">
            <p>© ${new Date().getFullYear()} <strong>College Admission Office</strong>. All rights reserved.</p>
            <p style="margin-top:6px;">This is an automated message — please do not reply.</p>
            <div style="margin-top:10px;">
            <a href="https://yourcollegewebsite.com" style="color:${accentColor}; text-decoration:none; font-weight:500;">
                Visit Our Website
            </a>
            </div>
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
                ` Failed to send email to ${student.email}:`,
                error
              );
              return reject(error);
            }
            db.query("UPDATE students SET mail_sent = 1 WHERE id = ?", [
              student.id,
            ]);
            console.log(`Email sent to ${student.email}`);
            resolve();
          });
        });
      });

      try {
        await Promise.all(emailPromises);
        res.json({
          message: "Status emails sent successfully to remaining students.",
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({
          message: "Failed to send some emails",
          error: error.message,
        });
      }
    }
  );
};
