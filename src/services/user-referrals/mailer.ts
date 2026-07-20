// Prepcore — User Referral System
import nodemailer from "nodemailer";

const DEFAULT_ADMIN_EMAIL = "ozebochigozirimcharles2023@gmail.com";

export async function sendReferralCashClaimEmail(input: {
  name: string;
  email: string;
  rewardBatch: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
}) {
  const adminEmail = process.env.GMAIL_USER ?? DEFAULT_ADMIN_EMAIL;
  const password =
    process.env.GMAIL_APP_PASSWORD ?? process.env.GMAIL_SMTP_APP_PASSWORD;
  if (!password) {
    throw new Error("Missing GMAIL_APP_PASSWORD or GMAIL_SMTP_APP_PASSWORD.");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: adminEmail, pass: password },
  });

  await transporter.sendMail({
    from: `Prepcore <${adminEmail}>`,
    to: adminEmail,
    subject: "Prepcore — Referral Cash Claim Request",
    text: [
      `Name: ${input.name}`,
      `Email: ${input.email}`,
      `Reward batch: ${input.rewardBatch}`,
      `Bank: ${input.bankName}`,
      `Account number: ${input.accountNumber}`,
      `Account name: ${input.accountName}`,
      `Requested at: ${new Date().toISOString()}`,
    ].join("\n"),
  });
}
