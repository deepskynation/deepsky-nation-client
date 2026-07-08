/**
 * Component Visual email previews (Option A: inline HTML mocks).
 * Each file under previews/ contains full reference HTML with dummy data.
 * Production templates live in deepsky-nation-server/emails/ — update mocks when those change.
 */
import { loginCodeEmailPreview } from "@/mock/emails/previews/login-code";
import { newReleaseDigestEmailPreview } from "@/mock/emails/previews/new-release-digest";
import { orderApprovedEmailPreview } from "@/mock/emails/previews/order-approved";
import { orderCancelledEmailPreview } from "@/mock/emails/previews/order-cancelled";
import { orderReceiptEmailPreview } from "@/mock/emails/previews/order-receipt";
import { orderShippedEmailPreview } from "@/mock/emails/previews/order-shipped";
import { saleDigestEmailPreview } from "@/mock/emails/previews/sale-digest";
import { verificationEmailPreview } from "@/mock/emails/previews/verification";
import type { EmailPreview } from "@/mock/emails/types";

export type { EmailPreview } from "@/mock/emails/types";

export const mockEmailPreviews: EmailPreview[] = [
  loginCodeEmailPreview,
  verificationEmailPreview,
  orderReceiptEmailPreview,
  orderApprovedEmailPreview,
  orderShippedEmailPreview,
  orderCancelledEmailPreview,
  newReleaseDigestEmailPreview,
  saleDigestEmailPreview,
];
