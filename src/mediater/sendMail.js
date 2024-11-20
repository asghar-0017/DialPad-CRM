const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");
const imageUrl='https://s.rozee.pk/company_logos/00/cpl_34362578003607.png'

const sendVerificationEmail = async (
  email,
  verificationToken,
  name,
  agentId,
  password
) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
      },
    });
    // const verificationUrl = `https://dialpad-crm-production.up.railway.app/verify-email?email=${encodeURIComponent(email)}&verificationToken=${verificationToken}`;
    // const verificationUrl = `https://backend-crm-theta.vercel.app//verify-email?email=${encodeURIComponent(email)}&verificationToken=${verificationToken}`;
    const verificationUrl = `http://localhost:4000/verify-email?agentId=${encodeURIComponent(agentId)}&verificationToken=${verificationToken}`;

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Email Verification",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
            }
            .container {
              width: 100%;
              max-width: 600px;
              margin: auto;
              background: #ffffff;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
            }
            .header img {
              max-width: 150px;
            }
            .content {
              text-align: center;
              margin-bottom: 20px;
            }
            .content h3 {
              color: #333;
            }
            .content p {
              color: #666;
            }
            .btn {
              display: inline-block;
              padding: 10px 20px;
              font-size: 16px;
              color: #ffffff; /* White text color */
              background-color: #007bff; /* Blue button background */
              text-decoration: none;
              border-radius: 5px;
              margin-top: 10px;
            }
            .footer {
              text-align: center;
              color: #999;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="cid:logo" alt="Company Logo">
            </div>
            <div class="content">
              <h3>Hello ${name},</h3>
              <p>Click the button below to verify your email address and activate your account.</p>
              <p><strong>Your temporary password is: ${password}</strong></p>
              <a href="${verificationUrl}" class="btn" style="display: inline-block; padding: 10px 20px; font-size: 16px; color: #000000; background-color: #007bff; text-decoration: none; border-radius: 5px; margin-top: 10px;">Verify Your Email</a>
            </div>
            <div class="footer">
              <p>If you did not create an account, no further action is required.</p>
              <p>© ${new Date().getFullYear()} SoftMark Solutions. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      attachments: [
        {
          filename: "logo.png",
          path: `${imageUrl}`,
          cid: "logo",
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent successfully to ${email}.`);
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
};

module.exports = sendVerificationEmail;
