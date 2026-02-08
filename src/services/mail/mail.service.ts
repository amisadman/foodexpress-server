import path from "path";
import { transporter } from "./transporter";
import { env } from "../../config/env";

export const sendEmail = async (name: string, email: string, token: string) => {
  const verifyUrl = `${env.appUrl}/verify-email?token=${token}`;

  const info = await transporter.sendMail({
    from: `"Food Express Auth" <auth@foodexpress.io>`,
    to: email,
    subject: "Verify your email for Food Express",
    text: `Hello ${name}, verify your email for Food Express.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">


        <h2 style="color: #111;">Welcome to Food Express</h2>
                <div style="text-align: center; margin-bottom: 20px;">
          <img
  src="cid:foodexpress-logo"
  alt="Food Express Logo"
  width="220"
  style="max-width: 220px; width: 100%; height: auto;"
/>

        </div>

        <p>Hello ${name},</p>

        <p>
          Thanks for joining <strong>Food Express</strong> — Fast, Reliable, and Delicious Food Delivered to Your Doorstep.
        </p>


        <p>Please verify your email address by clicking the button below:</p>

        <a
          href="${verifyUrl}"
          style="
            display: inline-block;
            padding: 12px 20px;
            background-color: #111;
            color: #fff;
            text-decoration: none;
            border-radius: 6px;
            margin: 16px 0;
          "
        >
          Verify Email
        </a>

        <p>If the button is not working: ${verifyUrl}</p>

        <p style="font-size: 14px; color: #555;">
          If you didn’t create an account, you can safely ignore this email.
        </p>

        <hr style="margin: 30px 0;" />

        <p style="font-size: 12px; color: #999;">
          This link will expire in 15 minutes for security reasons.
        </p>
      </div>
    `,
    attachments: [
      {
        filename: "foodExpress.png",
        path: path.join(process.cwd(), "/resources/foodExpress.png"),
        cid: "foodexpress-logo",
      },
    ],
  });

  console.log(`Email sent to: ${email}`);

  return info;
};
