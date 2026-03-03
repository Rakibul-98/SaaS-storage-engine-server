import nodemailer from "nodemailer";
import config from "../config";

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: config.email_user,
        pass: config.email_pass,
      },
      connectionTimeout: 30000,
      greetingTimeout: 30000,
      socketTimeout: 30000,
    });

    await transporter.sendMail({
      from: `"SaaS Storage" <${config.email_user}>`,
      to,
      subject,
      html,
    });
    console.log("Email sent successfully to:", to);
  } catch (error) {
    console.error("Email sending failed:", error);
  }
};
