// to send email to all the student students
import { db } from "../db.js";
import { createTransporter, loadTemplate } from "../helper/mailer.js";
import { sendSuccess, sendError } from "../helper/response-helper.js";

export const sendStatusEmails = (req, res) => {
  const transporter = createTransporter();

  db.query(
    "SELECT id, name, email, status FROM students WHERE status != last_notified_status",
    async (err, results) => {
      if (err) return sendError(res, err.message);
      if (!results.length)
        return sendSuccess(res, "No status changes to notify.");

      const emailPromises = results.map((student) => {
        // Define dynamic text based on status
        const heading =
          student.status === "accepted"
            ? "Congratulations!"
            : student.status === "rejected"
            ? "Application Update"
            : "Status Changed";
        const message =
          student.status === "accepted"
            ? "You have been accepted! Welcome aboard."
            : student.status === "rejected"
            ? "Unfortunately, your application was not successful this time."
            : `Your application status is now: ${student.status}`;
        const accentColor =
          student.status === "accepted"
            ? "#16a34a"
            : student.status === "rejected"
            ? "#dc2626"
            : "#4b0082";

        // Load HTML email from the mail/templates folder
        const html = loadTemplate("status-template.html", {
          name: student.name,
          heading,
          message,
          accentColor,
        });

        return new Promise((resolve, reject) => {
          transporter.sendMail(
            {
              from: process.env.EMAIL_USER,
              to: student.email,
              subject: `Application Status Update - ${student.status}`,
              html,
            },
            (error) => {
              if (error) return reject(error);

              // Update last_notified_status
              db.query(
                "UPDATE students SET last_notified_status = ? WHERE id = ?",
                [student.status, student.id],
                (err) => {
                  if (err)
                    console.error(
                      `⚠️ Failed to update student ${student.id}`,
                      err
                    );
                  resolve();
                }
              );
            }
          );
        });
      });

      try {
        await Promise.all(emailPromises);
        sendSuccess(res, "Status emails sent successfully!");
      } catch (error) {
        console.error(error);
        sendError(res, "Failed to send some emails");
      }
    }
  );
};
