import type { User } from "@/types";
import type { UpdateProfilePayload } from "@/types/auth";

export type CheckoutDeliveryMode = "profile" | "custom";

export type CheckoutDeliveryFormState = {
  email: string;
  phone_number: string;
  home_address: string;
  city: string;
  region: string;
  country: string;
  postal_code: string;
};

export const emptyCheckoutDeliveryForm: CheckoutDeliveryFormState = {
  email: "",
  phone_number: "",
  home_address: "",
  city: "",
  region: "",
  country: "",
  postal_code: "",
};

export const CHECKOUT_DELIVERY_SCHEDULE_NOTE =
  "Estimated delivery: 3–7 business days after your order is confirmed.";

export function isCheckoutDeliveryFormEmpty(
  form: CheckoutDeliveryFormState,
): boolean {
  return (
    !form.email.trim() &&
    !form.phone_number.trim() &&
    !form.home_address.trim() &&
    !form.city.trim() &&
    !form.region.trim() &&
    !form.country.trim() &&
    !form.postal_code.trim()
  );
}

export function checkoutDeliveryToProfilePayload(
  form: CheckoutDeliveryFormState,
): UpdateProfilePayload {
  return {
    phone_number: form.phone_number.trim(),
    home_address: form.home_address.trim(),
    city: form.city.trim(),
    region: form.region.trim(),
    country: form.country.trim(),
    postal_code: form.postal_code.trim(),
  };
}

export function deliveryFormFromUser(user: User): CheckoutDeliveryFormState {
  return {
    email: user.email.trim(),
    phone_number: (user.phone_number ?? "").trim(),
    home_address: (user.home_address ?? "").trim(),
    city: (user.city ?? "").trim(),
    region: (user.region ?? "").trim(),
    country: (user.country ?? "").trim(),
    postal_code: (user.postal_code ?? "").trim(),
  };
}

export function hasProfileDeliveryData(user: User): boolean {
  return Boolean(
    user.phone_number ||
      user.home_address ||
      user.city ||
      user.region ||
      user.country ||
      user.postal_code,
  );
}

/** True when the saved profile has every field required for checkout. */
export function isProfileDeliveryComplete(user: User): boolean {
  return validateCheckoutDeliveryForm(deliveryFormFromUser(user)) === null;
}

export function validateCheckoutDeliveryForm(
  form: CheckoutDeliveryFormState,
): string | null {
  const email = form.email.trim();
  const phone_number = form.phone_number.trim();
  const home_address = form.home_address.trim();
  const city = form.city.trim();
  const region = form.region.trim();
  const country = form.country.trim();
  const postal_code = form.postal_code.trim();

  if (!email) {
    return "Please enter your email.";
  }
  if (!phone_number) {
    return "Please enter your phone number.";
  }
  if (!home_address) {
    return "Please enter your home address.";
  }
  if (!city) {
    return "Please enter your city.";
  }
  if (!region) {
    return "Please enter your region or state.";
  }
  if (!country) {
    return "Please enter your country.";
  }
  if (!postal_code) {
    return "Please enter your postal code.";
  }

  return null;
}

export function formatCheckoutDeliverySummary(
  form: CheckoutDeliveryFormState,
): string {
  const lines = [
    form.home_address.trim(),
    [form.city.trim(), form.region.trim()].filter(Boolean).join(", "),
    [form.country.trim(), form.postal_code.trim()].filter(Boolean).join(" "),
  ].filter(Boolean);

  return lines.join("\n");
}
