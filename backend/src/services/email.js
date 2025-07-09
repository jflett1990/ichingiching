const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = this.createTransporter();
    this.templates = this.loadTemplates();
  }

  createTransporter() {
    // Configure based on environment
    if (process.env.NODE_ENV === 'production') {
      // Production email service (e.g., SendGrid, AWS SES)
      return nodemailer.createTransporter({
        service: 'SendGrid',
        auth: {
          user: 'apikey',
          pass: process.env.SENDGRID_API_KEY
        }
      });
    } else {
      // Development - use Ethereal for testing
      return nodemailer.createTransporter({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
          user: process.env.ETHEREAL_USER || 'ethereal.user@example.com',
          pass: process.env.ETHEREAL_PASS || 'ethereal.pass'
        }
      });
    }
  }

  async sendEmail({ to, subject, template, data }) {
    try {
      const htmlContent = this.renderTemplate(template, data);
      const textContent = this.stripHtml(htmlContent);

      const mailOptions = {
        from: process.env.FROM_EMAIL || 'noreply@wisdom-oracle.app',
        to: to,
        subject: subject,
        html: htmlContent,
        text: textContent
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Email sent:', nodemailer.getTestMessageUrl(result));
      }

      return result;
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new Error('Failed to send email');
    }
  }

  renderTemplate(templateName, data) {
    const template = this.templates[templateName];
    if (!template) {
      throw new Error(`Email template '${templateName}' not found`);
    }

    let html = template;
    
    // Simple template variable replacement
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(regex, data[key]);
    });

    return html;
  }

  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  loadTemplates() {
    return {
      welcome: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Welcome to Wisdom Oracle</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🔮 Welcome to Wisdom Oracle</h1>
            <p>Your journey into ancient wisdom begins here</p>
          </div>
          <div class="content">
            <h2>Hello {{firstName}}!</h2>
            <p>Thank you for joining Wisdom Oracle, where ancient I Ching wisdom meets modern AI interpretation.</p>
            <p>To get started with your readings, please verify your email address:</p>
            <a href="{{verificationUrl}}" class="button">Verify Email Address</a>
            <p>Once verified, you'll have access to:</p>
            <ul>
              <li>✨ AI-powered I Ching interpretations</li>
              <li>📚 Complete reading history</li>
              <li>🎨 Beautiful themes and animations</li>
              <li>📱 Mobile-optimized experience</li>
            </ul>
            <p>If you have any questions, feel free to reach out to our support team.</p>
            <p>Wisdom awaits!</p>
          </div>
          <div class="footer">
            <p>© 2024 Wisdom Oracle. All rights reserved.</p>
          </div>
        </body>
        </html>
      `,

      'password-reset': `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Reset Your Password - Wisdom Oracle</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🔐 Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hello {{firstName}},</h2>
            <p>We received a request to reset your password for your Wisdom Oracle account.</p>
            <p>Click the button below to create a new password:</p>
            <a href="{{resetUrl}}" class="button">Reset Password</a>
            <div class="warning">
              <strong>Security Notice:</strong>
              <ul>
                <li>This link will expire in 1 hour</li>
                <li>If you didn't request this reset, please ignore this email</li>
                <li>Your password won't change until you create a new one</li>
              </ul>
            </div>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">{{resetUrl}}</p>
          </div>
          <div class="footer">
            <p>© 2024 Wisdom Oracle. All rights reserved.</p>
          </div>
        </body>
        </html>
      `,

      'subscription-welcome': `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Welcome to Premium - Wisdom Oracle</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #d4af37 0%, #8b4513 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .feature-list { list-style: none; padding: 0; }
            .feature-list li { padding: 8px 0; }
            .feature-list li:before { content: "✨"; margin-right: 10px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🌟 Welcome to Premium!</h1>
            <p>Your enhanced wisdom journey begins now</p>
          </div>
          <div class="content">
            <h2>Congratulations {{firstName}}!</h2>
            <p>Your premium subscription is now active. You now have access to:</p>
            <ul class="feature-list">
              <li>Unlimited AI interpretations</li>
              <li>Guided meditation features</li>
              <li>All premium themes</li>
              <li>Conversational AI follow-ups</li>
              <li>Pattern analysis insights</li>
              <li>Reading history export</li>
            </ul>
            <p>Start exploring your enhanced features in the app right away!</p>
            <p>Thank you for supporting Wisdom Oracle.</p>
          </div>
          <div class="footer">
            <p>© 2024 Wisdom Oracle. All rights reserved.</p>
          </div>
        </body>
        </html>
      `
    };
  }
}

module.exports = new EmailService();