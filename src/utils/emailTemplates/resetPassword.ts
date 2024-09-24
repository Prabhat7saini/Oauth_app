export const createForgotPasswordEmailBody = ({
  resetLink,
}: {
  resetLink: string;
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
        a {
          color: #007bff;
          text-decoration: none;
        }
        .button {
          display: inline-block;
          padding: 10px 20px;
          font-size: 16px;
          color: #ffffff;
          background-color: #007bff;
          border-radius: 5px;
          text-align: center;
          text-decoration: none;
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
        <h1>Reset Your Password</h1>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <p><a href="${resetLink}" class="button">Reset Password</a></p>
        <p>If you did not request a password reset, please ignore this email.</p>
        <div class="footer">
          <p>If you have any questions, feel free to reach out to our support team at support@example.com.</p>
          <p>&copy; 2024 E-Commerce_microServices. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
