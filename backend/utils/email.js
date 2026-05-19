const nodemailer = require('nodemailer');

// Virtual Inbox for unlimited local testing
const virtualInbox = [];

// Reusable Nodemailer transporter
let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for port 465, false for other ports (uses STARTTLS)
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    tls: {
      rejectUnauthorized: false // Bypass cloud container SSL certificate authority lookup delays
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });

  return transporter;
}

exports.sendOTP = async (email, otp, institutionName) => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  
  const emailData = {
    to: email,
    otp,
    institutionName,
    sentAt: new Date().toISOString(),
    subject: 'Verify Your Institution - Academix'
  };

  // Always save to virtual inbox for debugging/testing
  virtualInbox.unshift(emailData);
  if (virtualInbox.length > 50) virtualInbox.pop(); // Keep last 50

  console.log(`[VIRTUAL INBOX] OTP for ${email}: ${otp}`);

  // If no email credentials, we just use the virtual inbox (unlimited mode)
  const mailTransporter = getTransporter();
  if (!mailTransporter) {
    console.log('No EMAIL_USER or EMAIL_PASS configured. OTP saved to Virtual Inbox only.');
    return { success: true, mode: 'virtual', devOtp: otp };
  }

  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #e2e8f0; border-radius: 24px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 40px;">
        <h1 style="color: #7c3aed; font-size: 28px; font-weight: 900; margin: 0;">Verify Your Email</h1>
        <p style="color: #64748b; font-size: 16px; margin-top: 8px;">Academix School Management Platform</p>
      </div>
      
      <div style="background-color: #f8fafc; border-radius: 16px; padding: 32px; text-align: center; margin-bottom: 32px;">
        <p style="color: #64748b; font-size: 14px; text-transform: uppercase; font-weight: 800; letter-spacing: 0.1em; margin-bottom: 12px;">Your Verification Code</p>
        <h2 style="color: #7c3aed; font-size: 48px; font-weight: 900; margin: 0; letter-spacing: 8px;">${otp}</h2>
      </div>
      
      <p>You requested to register <strong>${institutionName}</strong>. Use the code above to verify your email. Code expires in 10 minutes.</p>
    </div>
  `;

  try {
    console.log(`Attempting to send OTP email to ${email} via Nodemailer Gmail SMTP...`);
    const info = await mailTransporter.sendMail({
      from: `"Academix" <${emailUser}>`, // sender address
      to: email, // list of receivers
      subject: emailData.subject, // Subject line
      html: htmlContent, // html body
    });

    console.log('Message sent via Nodemailer: %s', info.messageId);
    return { success: true, mode: 'nodemailer', info };
  } catch (err) {
    console.warn('[SMTP ERROR] Nodemailer failed to send email via Google SMTP. Falling back to Virtual Inbox. Error:', err.message);
    console.log(`\n========================================================\n[VIRTUAL INBOX FALLBACK] OTP Code: ${otp}\n========================================================\n`);
    // Return virtual fallback so user is NEVER blocked from testing!
    return { success: true, mode: 'virtual_fallback', devOtp: otp };
  }
};

exports.getVirtualInbox = () => virtualInbox;

