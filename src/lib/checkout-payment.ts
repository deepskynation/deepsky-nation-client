export type CheckoutPaymentMethod = "cod" | "non-cod";

/** Hardcoded copy for prepaid / non-COD checkout (UI only for now). */
export const NON_COD_PAYMENT_INSTRUCTIONS = {
  title: "Pay Before We Process Your Order",
  intro:
    "Choose a transfer option below, pay the order total, then upload your payment receipt to continue.",
  steps: [
    "Send the full order total (subtotal + shipping) using GCash or bank transfer.",
    "Use your order email as the payment reference or note, if possible.",
    "Take a clear screenshot or photo of the successful transfer.",
    "Upload the receipt image on this page, then tap Complete Checkout.",
  ],
  accounts: [
    { label: "Account Name", value: "Joshua Gerald S. Bien" },
    { label: "GCash", value: "09458421466" },
  ],
  note: "We will verify your payment before confirming the order. Keep your receipt until your order is delivered.",
};
