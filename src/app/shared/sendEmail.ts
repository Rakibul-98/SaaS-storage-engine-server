import { Resend } from "resend";
import config from "../config";

const resend = new Resend(config.resend_api_key);

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const data = await resend.emails.send({
      from: config.resend_from_email,
      to: [to],
      subject,
      html,
    });

    return { success: true, data };
  } catch (error) {
    console.error("❌ Resend error:", error);
    throw error;
  }
};
