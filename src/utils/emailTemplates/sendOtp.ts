export const createVerificationEmailBody = ({
  otp,
}: {
  otp: string;
}): string => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: Arial, sans-serif;
          color: #333;
          line-height: 1.6;
          margin: 0;
          padding: 0;
        }
        .container {
          width: 80%;
          margin: auto;
          padding: 20px;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        h1 {
          color: #007bff;
        }
        p {
          font-size: 16px;
          margin: 10px 0;
        }
        .otp {
          font-size: 24px;
          color: #2a9d8f;
          font-weight: bold;
          margin: 20px 0;
        }
        .footer {
          margin-top: 20px;
          font-size: 14px;
          color: #777;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Verify Your Account!</h1>
        <p>To complete your registration, please verify your account using the OTP below:</p>
        <div class="otp">${otp}</div>
        <p>This OTP is valid for 10 minutes. If you did not request this, please ignore this email.</p>
        <div class="footer">
          <p>If you have any questions, feel free to reach out to our support team at support@example.com.</p>
          <p>&copy; 2024 E-Commerce_microServices. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
