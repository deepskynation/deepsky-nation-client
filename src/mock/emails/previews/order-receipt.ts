import { LOGO_URL, ORDERS_LINK } from "@/mock/emails/constants";
import type { EmailPreview } from "@/mock/emails/types";

type OrderLineItem = {
  name: string;
  variant: string;
  quantity: number;
  unitPrice: string;
  lineTotal: string;
};

/** Add or remove entries here — line-item HTML updates automatically. */
const ORDER_LINE_ITEMS: OrderLineItem[] = [
  {
    name: "Deep Sky Logo Tee",
    variant: "M · Black",
    quantity: 2,
    unitPrice: "PHP 1,299.00",
    lineTotal: "PHP 2,598.00",
  },
  {
    name: "Orion Cap",
    variant: "One Size · Sand",
    quantity: 1,
    unitPrice: "PHP 899.00",
    lineTotal: "PHP 899.00",
  },
];

function renderOrderLineItem(item: OrderLineItem): string {
  return `<tr><td style="padding:8px 0;border-bottom:1px solid rgba(0,0,0,0.06);"><div style="font-size:13px;color:#000;">${item.name} (${item.variant})</div><div style="font-size:12px;color:rgba(0,0,0,0.5);">Qty ${item.quantity} × ${item.unitPrice}</div></td><td style="padding:8px 0;border-bottom:1px solid rgba(0,0,0,0.06);text-align:right;font-size:13px;color:#000;white-space:nowrap;">${item.lineTotal}</td></tr>`;
}

const ORDER_LINE_ITEMS_HTML = `<table role="presentation" width="100%" cellspacing="0" cellpadding="0">${ORDER_LINE_ITEMS.map(renderOrderLineItem).join("")}</table>`;

export const orderReceiptEmailPreview: EmailPreview = {
  id: "order-receipt",
  label: "Order Receipt",
  subject: "Your Deepsky Nation order #DSN-10042",
  html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Order receipt — #DSN-10042</title>
</head>
<body style="margin:0;padding:0;background-color:#f9fafb;font-family:Calibre,system-ui,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f9fafb;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background:rgba(255,255,255,0.92);border:1px solid rgba(0,0,0,0.1);border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,0.05);">
          <tr>
            <td style="padding:32px 28px 20px;text-align:center;">
              <img src="${LOGO_URL}" alt="Deepsky" width="140" height="28" style="display:block;margin:0 auto 16px;height:28px;width:auto;max-width:140px;border:0;" />
              <h1 style="margin:0 0 8px;font-size:24px;font-weight:600;color:#000;">
                Order details
              </h1>
              <p style="margin:0;font-size:14px;line-height:1.6;color:rgba(0,0,0,0.6);">
                Hi Alex, here are the details for <strong>#DSN-10042</strong>.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 16px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:13px;color:rgba(0,0,0,0.65);">
                <tr>
                  <td style="padding:4px 0;">Placed</td>
                  <td style="padding:4px 0;text-align:right;color:#000;">Jul 7, 2026 at 02:30 PM</td>
                </tr>
                <tr>
                  <td style="padding:4px 0;">Status</td>
                  <td style="padding:4px 0;text-align:right;color:#000;">Pending</td>
                </tr>
                <tr>
                  <td style="padding:4px 0;">Payment</td>
                  <td style="padding:4px 0;text-align:right;color:#000;">Cash on delivery (COD)</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 12px;">
              <p style="margin:0 0 8px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:rgba(0,0,0,0.45);">
                Items
              </p>
              ${ORDER_LINE_ITEMS_HTML}
            </td>
          </tr>
          <tr>
            <td style="padding:4px 28px 16px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:13px;">
                <tr>
                  <td style="padding:4px 0;color:rgba(0,0,0,0.55);">Subtotal</td>
                  <td style="padding:4px 0;text-align:right;">PHP 3,497.00</td>
                </tr>
                <tr>
                  <td style="padding:4px 0;color:rgba(0,0,0,0.55);">Shipping</td>
                  <td style="padding:4px 0;text-align:right;">PHP 50.00</td>
                </tr>
                <tr>
                  <td style="padding:8px 0 4px;font-weight:600;color:#000;">Total</td>
                  <td style="padding:8px 0 4px;text-align:right;font-weight:600;color:#000;">PHP 3,547.00</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 20px;border-top:1px solid rgba(0,0,0,0.08);">
              <p style="margin:0 0 8px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:rgba(0,0,0,0.45);">
                Delivery
              </p>
              <p style="margin:0 0 6px;font-size:13px;line-height:1.55;color:rgba(0,0,0,0.7);white-space:pre-line;">123 Galaxy Lane
Makati City, Metro Manila
Philippines 1200</p>
              <p style="margin:0;font-size:13px;color:rgba(0,0,0,0.55);">
                +63 912 345 6789 · alex@example.com
              </p>
              <p style="margin:12px 0 0;font-size:13px;line-height:1.55;color:rgba(0,0,0,0.55);">
                Estimated delivery: 3–7 business days after your order is confirmed.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 28px;text-align:center;">
              <a href="${ORDERS_LINK}"
                 style="display:inline-block;max-width:280px;box-sizing:border-box;padding:12px 24px;background:#000;color:#fff;text-decoration:none;border-radius:6px;font-size:14px;font-weight:500;">
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
