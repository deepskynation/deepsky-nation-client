/** Reference mock — inline HTML. Sync with deepsky-nation-server/emails/sale-digest.html */
import { LOGO_URL, SHOP_LINK, UNSUBSCRIBE_LINK } from "@/mock/emails/constants";
import type { EmailPreview } from "@/mock/emails/types";

const PRODUCT_CARDS_HTML = `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:16px;border-bottom:1px solid rgba(0,0,0,0.06);"><tr><td width="120" valign="top" style="padding:0 16px 16px 0;"><a href="#product-tee" style="text-decoration:none;"><img src="/product-3.jpg" alt="Deep Sky Logo Tee" width="120" height="150" style="display:block;width:120px;height:150px;object-fit:cover;border-radius:8px;border:0;" /></a></td><td valign="top" style="padding:0 0 16px;"><span style="display:inline-block;margin-bottom:8px;padding:2px 8px;background:#dc2626;color:#fff;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;border-radius:4px;">SALE</span><div style="font-size:12px;font-weight:500;text-transform:uppercase;letter-spacing:0.04em;color:#000;line-height:1.4;max-height:34px;overflow:hidden;">Deep Sky Logo Tee</div><div style="margin-top:8px;"><div style="font-size:12px;color:rgba(0,0,0,0.5);text-decoration:line-through;">PHP 1,299.00</div><div style="margin-top:2px;font-size:13px;font-weight:600;color:#000;">PHP 899.00</div></div><a href="#product-tee" style="display:inline-block;margin-top:8px;font-size:12px;font-weight:500;color:#000;text-decoration:underline;">View product</a></td></tr></table><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:16px;border-bottom:1px solid rgba(0,0,0,0.06);"><tr><td width="120" valign="top" style="padding:0 16px 16px 0;"><a href="#product-cap" style="text-decoration:none;"><img src="/product-7.jpg" alt="Orion Cap" width="120" height="150" style="display:block;width:120px;height:150px;object-fit:cover;border-radius:8px;border:0;" /></a></td><td valign="top" style="padding:0 0 16px;"><span style="display:inline-block;margin-bottom:8px;padding:2px 8px;background:#dc2626;color:#fff;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;border-radius:4px;">SALE</span><div style="font-size:12px;font-weight:500;text-transform:uppercase;letter-spacing:0.04em;color:#000;line-height:1.4;max-height:34px;overflow:hidden;">Orion Cap</div><div style="margin-top:8px;"><div style="font-size:12px;color:rgba(0,0,0,0.5);text-decoration:line-through;">PHP 1,199.00</div><div style="margin-top:2px;font-size:13px;font-weight:600;color:#000;">PHP 799.00</div></div><a href="#product-cap" style="display:inline-block;margin-top:8px;font-size:12px;font-weight:500;color:#000;text-decoration:underline;">View product</a></td></tr></table><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:16px;border-bottom:1px solid rgba(0,0,0,0.06);"><tr><td width="120" valign="top" style="padding:0 16px 16px 0;"><a href="#product-print" style="text-decoration:none;"><img src="/product-1.jpg" alt="Stellar Map Print" width="120" height="150" style="display:block;width:120px;height:150px;object-fit:cover;border-radius:8px;border:0;" /></a></td><td valign="top" style="padding:0 0 16px;"><span style="display:inline-block;margin-bottom:8px;padding:2px 8px;background:#dc2626;color:#fff;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;border-radius:4px;">SALE</span><div style="font-size:12px;font-weight:500;text-transform:uppercase;letter-spacing:0.04em;color:#000;line-height:1.4;max-height:34px;overflow:hidden;">Stellar Map Print</div><div style="margin-top:8px;"><div style="font-size:12px;color:rgba(0,0,0,0.5);text-decoration:line-through;">PHP 1,899.00</div><div style="margin-top:2px;font-size:13px;font-weight:600;color:#000;">PHP 1,499.00</div></div><a href="#product-print" style="display:inline-block;margin-top:8px;font-size:12px;font-weight:500;color:#000;text-decoration:underline;">View product</a></td></tr></table>`;

export const saleDigestEmailPreview: EmailPreview = {
  id: "sale-digest",
  label: "Sale Digest",
  subject: "Sale alert — Deepsky Nation",
  html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Sale alert — Deepsky Nation</title>
</head>
<body style="margin:0;padding:0;background-color:#f9fafb;font-family:Calibre,system-ui,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    Limited-time prices on select items
  </div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f9fafb;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background:rgba(255,255,255,0.92);border:1px solid rgba(0,0,0,0.1);border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,0.05);">
          <tr>
            <td style="padding:32px 28px 20px;text-align:center;">
              <img src="${LOGO_URL}" alt="Deepsky" width="140" height="28" style="display:block;margin:0 auto 16px;height:28px;width:auto;max-width:140px;border:0;" />
              <p style="margin:0;font-size:14px;line-height:1.6;color:rgba(0,0,0,0.6);">
                3 item(s) are on sale right now.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 12px;">
              ${PRODUCT_CARDS_HTML}
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 24px;text-align:center;">
              <a href="${SHOP_LINK}"
                 style="display:inline-block;max-width:280px;box-sizing:border-box;padding:12px 24px;background:#000;color:#fff;text-decoration:none;border-radius:6px;font-size:14px;font-weight:500;">
                Shop the sale
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 28px;text-align:center;border-top:1px solid rgba(0,0,0,0.08);">
              <p style="margin:20px 0 8px;font-size:12px;line-height:1.6;color:rgba(0,0,0,0.4);">
                You&apos;re receiving this because you subscribed at Deepsky Nation.
              </p>
              <p style="margin:0;font-size:12px;line-height:1.6;">
                <a href="${UNSUBSCRIBE_LINK}" style="color:rgba(0,0,0,0.55);text-decoration:underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
};
