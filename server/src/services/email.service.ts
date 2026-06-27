import nodemailer from 'nodemailer';
import type { TransportOptions } from 'nodemailer';
import env from '../config/env.js';
import { logger } from '../utils/logger.js';

const createTransporter = () => {
  // In development/test, log emails instead of sending if SMTP not configured
  if (!env.SMTP_USER || !env.SMTP_PASS) {
    logger.warn('SMTP credentials not configured. Emails will be logged to console.');
    return null;
  }

  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  } as TransportOptions);
};

const transporter = createTransporter();

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

const sendMail = async ({ to, subject, html }: SendMailOptions): Promise<void> => {
  if (!transporter) {
    // Fallback: log the email content in dev
    logger.info(`📧 [EMAIL - ${subject}] To: ${to}`);
    logger.debug(`Email HTML body (truncated): ${html.substring(0, 200)}...`);
    return;
  }

  try {
    await transporter.sendMail({
      from: env.EMAIL_FROM,
      to,
      subject,
      html,
    });
    logger.info(`Email sent successfully to ${to}: ${subject}`);
  } catch (error) {
    logger.error(`Failed to send email to ${to}:`, error);
    throw error;
  }
};

// ─── Email Templates ────────────────────────────────────────

export const sendVerificationEmail = async (
  email: string,
  displayName: string,
  token: string,
): Promise<void> => {
  const verificationUrl = `${env.CLIENT_URL}/verify-email/${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Inter', -apple-system, sans-serif; background: #0f0f1a; color: #e2e2f0; margin: 0; padding: 0; }
        .container { max-width: 560px; margin: 40px auto; background: #1a1a2e; border-radius: 16px; overflow: hidden; border: 1px solid #2a2a3e; }
        .header { background: linear-gradient(135deg, #6366f1, #4f46e5); padding: 32px; text-align: center; }
        .header h1 { margin: 0; color: white; font-size: 24px; font-weight: 700; }
        .body { padding: 32px; }
        .body p { line-height: 1.7; margin: 0 0 16px; color: #b4b4cc; }
        .btn { display: inline-block; background: linear-gradient(135deg, #6366f1, #4f46e5); color: white !important; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 15px; margin: 16px 0; }
        .footer { padding: 24px 32px; text-align: center; color: #6b6b80; font-size: 13px; border-top: 1px solid #2a2a3e; }
        .code { background: #2a2a3e; padding: 4px 10px; border-radius: 6px; font-family: monospace; font-size: 13px; color: #a5b4fc; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✉️ Verify Your Email</h1>
        </div>
        <div class="body">
          <p>Hey <strong>${displayName}</strong>,</p>
          <p>Welcome to <strong>ChatSphere</strong>! Please verify your email address to get started.</p>
          <p style="text-align: center;">
            <a href="${verificationUrl}" class="btn">Verify Email Address</a>
          </p>
          <p>Or copy and paste this link into your browser:</p>
          <p class="code" style="word-break: break-all;">${verificationUrl}</p>
          <p>This link expires in <strong>24 hours</strong>.</p>
        </div>
        <div class="footer">
          <p>If you didn't create an account, you can safely ignore this email.</p>
          <p>© ${new Date().getFullYear()} ChatSphere</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendMail({
    to: email,
    subject: 'Verify your ChatSphere email',
    html,
  });
};

export const sendPasswordResetEmail = async (
  email: string,
  displayName: string,
  token: string,
): Promise<void> => {
  const resetUrl = `${env.CLIENT_URL}/reset-password/${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Inter', -apple-system, sans-serif; background: #0f0f1a; color: #e2e2f0; margin: 0; padding: 0; }
        .container { max-width: 560px; margin: 40px auto; background: #1a1a2e; border-radius: 16px; overflow: hidden; border: 1px solid #2a2a3e; }
        .header { background: linear-gradient(135deg, #f59e0b, #d97706); padding: 32px; text-align: center; }
        .header h1 { margin: 0; color: white; font-size: 24px; font-weight: 700; }
        .body { padding: 32px; }
        .body p { line-height: 1.7; margin: 0 0 16px; color: #b4b4cc; }
        .btn { display: inline-block; background: linear-gradient(135deg, #f59e0b, #d97706); color: white !important; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 15px; margin: 16px 0; }
        .footer { padding: 24px 32px; text-align: center; color: #6b6b80; font-size: 13px; border-top: 1px solid #2a2a3e; }
        .code { background: #2a2a3e; padding: 4px 10px; border-radius: 6px; font-family: monospace; font-size: 13px; color: #fbbf24; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔑 Password Reset</h1>
        </div>
        <div class="body">
          <p>Hey <strong>${displayName}</strong>,</p>
          <p>We received a request to reset your password. Click the button below to set a new password.</p>
          <p style="text-align: center;">
            <a href="${resetUrl}" class="btn">Reset Password</a>
          </p>
          <p>Or copy and paste this link into your browser:</p>
          <p class="code" style="word-break: break-all;">${resetUrl}</p>
          <p>This link expires in <strong>1 hour</strong>. If you didn't request a password reset, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>If you didn't request this, your account is still secure.</p>
          <p>© ${new Date().getFullYear()} ChatSphere</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendMail({
    to: email,
    subject: 'Reset your ChatSphere password',
    html,
  });
};
