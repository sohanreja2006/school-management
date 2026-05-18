const nodemailer = require('nodemailer');

// Virtual Inbox for unlimited local testing
const virtualInbox = [];

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
  if (!emailUser || !emailPass) {
    console.log('No EMAIL_USER or EMAIL_PASS. OTP saved to Virtual Inbox only.');
    return { success: true, mode: 'virtual' };
  }

  // Create reusable transporter object using STARTTLS (port 587) to bypass cloud port 465 blocking
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports (uses STARTTLS)
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    tls: {
      rejectUnauthorized: false // Bypass cloud container SSL certificate authority lookup delays
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 15000,
  });

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
    const info = await Promise.race([
      transporter.sendMail({
        from: `"Academix" <${emailUser}>`, // sender address
        to: email, // list of receivers
        subject: emailData.subject, // Subject line
        html: htmlContent, // html body
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('SMTP connection timed out after 15 seconds. Render might be blocking outbound port 587.')), 15000))
    ]);

    console.log('Message sent: %s', info.messageId);
    return info;
  } catch (err) {
    console.error('[SMTP ERROR] Nodemailer failed to send email via Google SMTP:', err.message);
    throw new Error(`Nodemailer SMTP Error: ${err.message}. If using Gmail, ensure your 16-character App Password is correct and that Google hasn't blocked the server IP.`);
  }
};

exports.getVirtualInbox = () => virtualInbox;
