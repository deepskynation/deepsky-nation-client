import { LOGO_URL, ORDERS_LINK } from "@/mock/emails/constants";
import type { EmailPreview } from "@/mock/emails/types";

export const orderApprovedEmailPreview: EmailPreview = {
  id: "order-approved",
  label: "Order Approved",
  subject: "Your Deepsky Nation order #DSN-10042 was approved",
  html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Order approved — #DSN-10042</title>
</head>
<body style="margin:0;padding:0;background-color:#f9fafb;font-family:Calibre,system-ui,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f9fafb;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:480px;background:rgba(255,255,255,0.92);border:1px solid rgba(0,0,0,0.1);border-radius:12px;">
          <tr>
            <td style="padding:32px 28px;text-align:center;">
              <img src="${LOGO_URL}" alt="Deepsky" width="140" height="28" style="display:block;margin:0 auto 16px;height:28px;width:auto;max-width:140px;border:0;" />
              <h1 style="margin:0 0 12px;font-size:24px;font-weight:600;color:#000;">
                Order approved
              </h1>
              <p style="margin:0;font-size:14px;line-height:1.6;color:rgba(0,0,0,0.6);">
                Hi Alex, order <strong>#DSN-10042</strong> was approved on Jul 8, 2026 at 10:00 AM. We will prepare your items for delivery.
              </p>
              <p style="margin:16px 0 0;font-size:13px;line-height:1.55;color:rgba(0,0,0,0.55);">
                Estimated delivery: 3–7 business days after your order is approved.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 28px;text-align:center;">
              <a href="${ORDERS_LINK}"
                 style="display:inline-block;padding:12px 24px;background:#000;color:#fff;text-decoration:none;border-radius:6px;font-size:14px;font-weight:500;">
                View my orders
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
};
