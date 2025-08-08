import nodemailer from "nodemailer";

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number.parseInt(process.env.SMTP_PORT || "587"),
    secure: false, 
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Email templates
export const emailTemplates = {
  farmerApprovalPending: (farmerName: string) => ({
    subject: "Kisan-mart - Registration Under Review",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0A490A;">Welcome to Kisan-mart!</h2>
        <p>Dear ${farmerName},</p>
        <p>Thank you for registering as a farmer on Kisan-mart. Your application is currently under review by our admin team.</p>
        <p>We will notify you once your account has been approved. This process typically takes 1-2 business days.</p>
        <p>What happens next:</p>
        <ul>
          <li>Our team will review your farmer registration</li>
          <li>You'll receive an email notification once approved</li>
          <li>After approval, you can start adding and selling your products</li>
        </ul>
        <p>If you have any questions, please don't hesitate to contact our support team.</p>
        <p>Best regards,<br>The Kisan-mart Team</p>
        <hr style="margin: 20px 0;">
        <p style="font-size: 12px; color: #666;">This is an automated message. Please do not reply to this email.</p>
      </div>
    `,
  }),

  farmerApprovalSuccess: (farmerName: string) => ({
    subject: "Kisan-mart - Account Approved! Start Selling Today",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0A490A;">Congratulations! Your Account is Approved</h2>
        <p>Dear ${farmerName},</p>
        <p>Great news! Your farmer account on Kisan-mart has been approved by our admin team.</p>
        <p>You can now:</p>
        <ul>
          <li>Add your farm products to the marketplace</li>
          <li>Set your own prices and manage inventory</li>
          <li>Receive and manage orders from customers</li>
          <li>Use our farmer tools to optimize your sales</li>
        </ul>
        <p>To get started:</p>
        <ol>
          <li>Log in to your farmer dashboard</li>
          <li>Add your first product</li>
          <li>Start receiving orders from customers</li>
        </ol>
        <p>We're excited to have you as part of the Kisan-mart community!</p>
        <p>Best regards,<br>The Kisan-mart Team</p>
        <hr style="margin: 20px 0;">
        <p style="font-size: 12px; color: #666;">This is an automated message. Please do not reply to this email.</p>
      </div>
    `,
  }),

  farmerApprovalRejected: (farmerName: string, reason: string) => ({
    subject: "Kisan-mart - Registration Update",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0A490A;">Registration Update</h2>
        <p>Dear ${farmerName},</p>
        <p>Thank you for your interest in joining Kisan-mart as a farmer.</p>
        <p>After reviewing your application, we are unable to approve your farmer account at this time.</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p>If you believe this is an error or would like to reapply, please contact our support team for assistance.</p>
        <p>Thank you for your understanding.</p>
        <p>Best regards,<br>The Kisan-mart Team</p>
        <hr style="margin: 20px 0;">
        <p style="font-size: 12px; color: #666;">This is an automated message. Please do not reply to this email.</p>
      </div>
    `,
  }),
};

// Send email function
export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Kisan-mart" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error: any) {
    console.error("Error sending email:", error);
    return { success: false, error: error.message };
  }
};
