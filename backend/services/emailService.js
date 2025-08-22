// Email service
//
// Environment variables (set in your .env):
// - SMTP_HOST (e.g., smtp.gmail.com)
// - SMTP_PORT (e.g., 587 or 465)
// - SMTP_SECURE ('true' for port 465, otherwise 'false' or omit)
// - SMTP_USER (SMTP username) or EMAIL_USER (fallback)
// - SMTP_PASS (SMTP password/app password) or EMAIL_PASS (fallback)
// - SMTP_FROM (optional friendly from email) or EMAIL_FROM (fallback)
// - SMTP_TLS_REJECT_UNAUTHORIZED ('false' to allow self-signed certs)
//
// Common failure points:
// - Missing SMTP_USER/SMTP_PASS (or EMAIL_USER/EMAIL_PASS) -> transporter cannot authenticate
// - Wrong SMTP_HOST/SMTP_PORT/SMTP_SECURE combination -> connection errors
// - Provider blocking less-secure apps -> use app password or provider-specific config
const nodemailer = require('nodemailer');

const getSmtpConfig = () => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465;
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const from = process.env.SMTP_FROM || process.env.EMAIL_FROM || user;
  const tls = process.env.SMTP_TLS_REJECT_UNAUTHORIZED === 'false' ? { rejectUnauthorized: false } : undefined;

  return { host, port, secure, auth: { user, pass }, from, tls };
};

// Create transporter
const createTransporter = () => {
  const cfg = getSmtpConfig();
  return nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: cfg.auth,
    tls: cfg.tls
  });
};

// Email templates
const emailTemplates = {
  welcomeOwner: (data) => ({
    subject: 'Welcome to JBS Platform - Your Business Account is Ready!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">Welcome to JBS Platform!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Your business account has been successfully created.</p>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${data.ownerName},</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Welcome to JBS Platform! Your business account for <strong>${data.businessName}</strong> has been successfully created.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
            <h3 style="color: #333; margin-top: 0;">Your Login Credentials:</h3>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Password:</strong> ${data.password}</p>
            <p style="color: #e74c3c; font-size: 14px;">
              <strong>Important:</strong> Please change your password after your first login for security.
            </p>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">What's Next?</h3>
            <ul style="color: #666; line-height: 1.6;">
              <li>Complete your business profile</li>
              <li>Add your products and services</li>
              <li>Post job opportunities for students</li>
              <li>Connect with talented students</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/owner-dashboard" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
              Access Your Dashboard
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            If you have any questions or need assistance, please don't hesitate to contact our support team.
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            Best regards,<br>
            The JBS Team
          </p>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">© 2024 JBS Platform. All rights reserved.</p>
        </div>
      </div>
    `
  }),
  
  passwordReset: (data) => ({
    subject: 'Password Reset Request - JBS Platform',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">Password Reset Request</h1>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello,</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            We received a request to reset your password for your JBS Platform account.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.resetUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
              Reset Your Password
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            This link will expire in 1 hour for security reasons.
          </p>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            If you didn't request this password reset, please ignore this email or contact our support team.
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            Best regards,<br>
            The JBS Team
          </p>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">© 2024 JBS Platform. All rights reserved.</p>
        </div>
      </div>
    `
  }),
  
  businessVerification: (data) => ({
    subject: 'Business Verification Update - JBS Platform',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">Business Verification Update</h1>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${data.ownerName},</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Your business verification status has been updated for <strong>${data.businessName}</strong>.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${data.status === 'verified' ? '#27ae60' : '#e74c3c'};">
            <h3 style="color: #333; margin-top: 0;">Status: ${data.status.toUpperCase()}</h3>
            ${data.notes ? `<p style="color: #666; margin: 10px 0;">${data.notes}</p>` : ''}
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/owner-dashboard" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
              View Dashboard
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            Best regards,<br>
            The JBS Team
          </p>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">© 2024 JBS Platform. All rights reserved.</p>
        </div>
      </div>
    `
  }),
  
  welcomeStudent: (data) => ({
    subject: 'Welcome to JBS Platform - Student Registration Successful!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">Welcome to JBS Platform!</h1>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${data.studentName},</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Welcome to JBS Platform! Your student account has been successfully created.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e40af; margin-top: 0;">Your Profile Details:</h3>
            <p style="color: #666; margin: 5px 0;"><strong>Name:</strong> ${data.studentName}</p>
            <p style="color: #666; margin: 5px 0;"><strong>Education:</strong> ${data.education}</p>
            <p style="color: #666; margin: 5px 0;"><strong>Institution:</strong> ${data.institution}</p>
            <p style="color: #666; margin: 5px 0;"><strong>Skills:</strong> ${data.skills}</p>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            You can now:
          </p>
          <ul style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            <li>Browse and apply for jobs</li>
            <li>Find internship opportunities</li>
            <li>Update your profile and skills</li>
            <li>Track your applications</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/student-dashboard" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
              Access Your Dashboard
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            If you have any questions, please contact our support team.
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            Best regards,<br>
            The JBS Team
          </p>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">© 2024 JBS Platform. All rights reserved.</p>
        </div>
      </div>
    `
  })
};

// Send email function
const sendEmail = async (to, template, data) => {
  try {
    const cfg = getSmtpConfig();
    if (!cfg.auth.user || !cfg.auth.pass) {
      console.error('Email sending error: Missing SMTP credentials (SMTP_USER/SMTP_PASS or EMAIL_USER/EMAIL_PASS).');
      return { success: false, error: 'Missing SMTP credentials' };
    }

    const transporter = createTransporter();
    const templateFn = emailTemplates[template];
    if (typeof templateFn !== 'function') {
      console.error(`Email sending error: Unknown template '${template}'.`);
      return { success: false, error: `Unknown template '${template}'` };
    }
    const emailContent = templateFn(data);
    
    const mailOptions = {
      from: cfg.from,
      to,
      subject: emailContent.subject,
      html: emailContent.html
    };
    
    // Optionally verify config; don't fail the whole request if SMTP is unreachable
    try {
      await transporter.verify();
    } catch (verifyError) {
      console.warn('SMTP verify warning:', verifyError.message);
    }

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};

// Send welcome email to new owner
const sendWelcomeEmail = async (ownerData) => {
  const data = {
    ownerName: ownerData.profile.firstName + ' ' + ownerData.profile.lastName,
    businessName: ownerData.business.businessName,
    email: ownerData.email,
    password: ownerData.password
  };
  
  return await sendEmail(ownerData.email, 'welcomeOwner', data);
};

// Send password reset email
const sendPasswordResetEmail = async (userEmail, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  const data = {
    resetUrl: resetUrl
  };
  
  return await sendEmail(userEmail, 'passwordReset', data);
};

// Send business verification update
const sendBusinessVerificationEmail = async (ownerData, status, notes = '') => {
  const data = {
    ownerName: ownerData.profile.firstName + ' ' + ownerData.profile.lastName,
    businessName: ownerData.business.businessName,
    status: status,
    notes: notes
  };
  
  return await sendEmail(ownerData.email, 'businessVerification', data);
};

// Send student welcome email
const sendStudentWelcomeEmail = async (studentData) => {
  const data = {
    studentName: studentData.profile.firstName + ' ' + studentData.profile.lastName,
    education: studentData.student.education,
    institution: studentData.student.institution,
    skills: studentData.student.skills.join(', '),
    email: studentData.email
  };
  
  return await sendEmail(studentData.email, 'welcomeStudent', data);
};

module.exports = {
  createTransporter,
  sendEmail,
  sendWelcomeEmail,
  sendStudentWelcomeEmail,
  sendPasswordResetEmail,
  sendBusinessVerificationEmail,
  emailTemplates
};
