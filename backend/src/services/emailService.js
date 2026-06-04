// src/services/emailService.js
const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <style>
    body { font-family: 'Arial', sans-serif; background: #08090D; margin: 0; padding: 0; }
    .wrapper { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background: #12141E; border: 1px solid #1F2235; border-radius: 16px; padding: 40px; }
    .logo { font-size: 24px; font-weight: 900; color: #D4A843; margin-bottom: 32px; }
    .logo span { color: #fff; }
    h1 { color: #E8EAF0; font-size: 24px; margin: 0 0 16px; }
    p { color: #7A7F96; font-size: 15px; line-height: 1.7; margin: 0 0 16px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #D4A843, #A07820); color: #08090D;
           padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 700;
           font-size: 15px; margin: 20px 0; }
    .footer { color: #3A3F5C; font-size: 12px; margin-top: 32px; text-align: center; }
    .divider { border: none; border-top: 1px solid #1F2235; margin: 24px 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="logo">Task<span>Hive</span></div>
      ${content}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} TaskHive. All rights reserved.</p>
      <p>If you didn't create an account, you can safely ignore this email.</p>
    </div>
  </div>
</body>
</html>`;

const send = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'TaskHive <noreply@taskhive.com>',
      to,
      subject,
      html,
    });
    logger.info(`Email sent to ${to}: ${subject}`);
  } catch (err) {
    logger.error(`Email failed to ${to}: ${err.message}`);
    // Don't throw — email failure shouldn't break the request
  }
};

const sendVerificationEmail = async (email, name, token) => {
  const url = `${process.env.CLIENT_URL}/verify-email/${token}`;
  await send({
    to: email,
    subject: 'Verify Your TaskHive Account',
    html: baseTemplate(`
      <h1>Welcome, ${name}! 🐝</h1>
      <p>You're one step away from unlocking your earning potential. Please verify your email address to activate your account.</p>
      <a href="${url}" class="btn">Verify My Email</a>
      <hr class="divider"/>
      <p>This link expires in 24 hours. If you didn't create a TaskHive account, ignore this email.</p>
    `),
  });
};

const sendPasswordResetEmail = async (email, name, token) => {
  const url = `${process.env.CLIENT_URL}/reset-password/${token}`;
  await send({
    to: email,
    subject: 'Reset Your TaskHive Password',
    html: baseTemplate(`
      <h1>Password Reset Request</h1>
      <p>Hi ${name}, we received a request to reset your password. Click the button below to choose a new one.</p>
      <a href="${url}" class="btn">Reset Password</a>
      <hr class="divider"/>
      <p>This link expires in 1 hour. If you didn't request this, your account is safe — just ignore this email.</p>
    `),
  });
};

const sendPaymentConfirmationEmail = async (email, name, { packageName, amount, categoryName }) => {
  await send({
    to: email,
    subject: `Payment Confirmed — ${categoryName} Access Unlocked`,
    html: baseTemplate(`
      <h1>Payment Confirmed ✦</h1>
      <p>Hi ${name}, your payment was successful! Your access has been unlocked.</p>
      <table style="width:100%;border-collapse:collapse;margin:20px 0">
        <tr><td style="color:#7A7F96;padding:8px 0">Package</td><td style="color:#E8EAF0;text-align:right">${packageName}</td></tr>
        <tr><td style="color:#7A7F96;padding:8px 0">Category</td><td style="color:#E8EAF0;text-align:right">${categoryName}</td></tr>
        <tr><td style="color:#7A7F96;padding:8px 0">Amount Paid</td><td style="color:#D4A843;font-weight:700;text-align:right">$${amount}</td></tr>
      </table>
      <a href="${process.env.CLIENT_URL}/dashboard" class="btn">Go to My Dashboard →</a>
    `),
  });
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendPaymentConfirmationEmail,
};
