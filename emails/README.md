# Transactional email templates

These files are the **inbox email** (HTML + plain text). They are loaded by the FastAPI backend at send time.

## Verification (sign up)

| Piece | Role |
|-------|------|
| `verification.html` / `verification-plain.txt` | Short message + button/link → `FRONTEND_URL/verify-email?token=...` |
| `src/components/(auth)/VerifyEmail.tsx` | Full UI **after** the user clicks the link (loading, success, errors, resend) |

**Placeholders:** `{{VERIFY_LINK}}` (HTML button only), `{{EXPIRE_HOURS}}`

## Order receipt (checkout)

Sent automatically after a successful `POST /api/user/orders`.

| Piece | Role |
|-------|------|
| `order-receipt.html` / `order-receipt-plain.txt` | Order confirmation with line items, totals, delivery, link to `/user/orders` |

**Placeholders:** `{{CUSTOMER_NAME}}`, `{{ORDER_NUMBER}}`, `{{ORDER_DATE}}`, `{{ORDER_STATUS}}`, `{{PAYMENT_METHOD}}`, `{{LINE_ITEMS_HTML}}`, `{{LINE_ITEMS_PLAIN}}`, `{{SUBTOTAL}}`, `{{SHIPPING_FEE}}`, `{{TOTAL}}`, `{{DELIVERY_ADDRESS}}`, `{{DELIVERY_PHONE}}`, `{{DELIVERY_EMAIL}}`, `{{ORDERS_LINK}}`

You cannot send React pages as email — mail clients do not run your app. Keep templates simple; use the site for rich UX.

## Order cancelled

Sent when a user cancels a **pending** order (`POST /api/user/orders/{id}/cancel`).

| Piece | Role |
|-------|------|
| `order-cancelled.html` / `order-cancelled-plain.txt` | Cancellation notice |

**Placeholders:** `{{CUSTOMER_NAME}}`, `{{ORDER_NUMBER}}`, `{{CANCELLED_AT}}`, `{{ORDERS_LINK}}`

After editing templates, restart uvicorn. With `EMAIL_DELIVERY=console`, receipt and cancellation emails print in the terminal.
