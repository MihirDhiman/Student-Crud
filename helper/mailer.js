import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create email transporter

export const createTransporter = () =>
  nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  

//Load HTML email template and replace {{placeholders}}
export const loadTemplate = (filename, replacements = {}) => {
  const filePath = path.join(process.cwd(), "mail", filename);
  let template = fs.readFileSync(filePath, "utf8");

  for (const [key, value] of Object.entries(replacements)) {
    const regex = new RegExp(`{{${key}}}`, "g");
    template = template.replace(regex, value);
  }

  return template;
};
