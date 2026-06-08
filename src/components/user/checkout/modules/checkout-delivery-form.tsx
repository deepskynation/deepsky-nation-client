"use client";

import { CheckoutPaymentMethodSection } from "@/components/user/checkout/modules/checkout-payment-method";
import { FormField } from "@/components/common/forms/form-field";
import type { CheckoutDeliveryFormState } from "@/lib/checkout-delivery";
import type { CheckoutPaymentMethod } from "@/lib/checkout-payment";
import {
  glassHighlightFlatClassName,
  glassInputFlatClassName,
} from "@/lib/glass-styles";
import { cn } from "@/lib/utils";

type CheckoutDeliveryFormProps = {
  form: CheckoutDeliveryFormState;
  onFieldChange: (field: keyof CheckoutDeliveryFormState, value: string) => void;
  onSubmit: () => void;
  showProfileCheckbox?: boolean;
  useProfileInfo: boolean;
  onUseProfileInfoChange: (checked: boolean) => void;
  paymentMethod: CheckoutPaymentMethod;
  paymentProofDataUrl: string | null;
  onPaymentMethodChange: (method: CheckoutPaymentMethod) => void;
  onPaymentProofChange: (dataUrl: string | null) => void;
  formError: string | null;
};

export function CheckoutDeliveryForm({
  form,
  onFieldChange,
  onSubmit,
  showProfileCheckbox = false,
  useProfileInfo,
  onUseProfileInfoChange,
  paymentMethod,
  paymentProofDataUrl,
  onPaymentMethodChange,
  onPaymentProofChange,
  formError,
}: CheckoutDeliveryFormProps) {
  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      {showProfileCheckbox ? (
        <label
          htmlFor="checkout-use-profile"
          className={cn(
            glassHighlightFlatClassName,
            "flex cursor-pointer items-start gap-3 p-4 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-black/20",
            useProfileInfo && "ring-1 ring-neutral-300/80",
          )}
        >
          <input
            id="checkout-use-profile"
            type="checkbox"
            checked={useProfileInfo}
            onChange={(event) => onUseProfileInfoChange(event.target.checked)}
            className="mt-0.5 size-4 shrink-0 rounded border-black/25 accent-black"
          />
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium text-black">
              Use My Profile Information
            </span>
            <span className="block text-xs text-black/55">
              Fill delivery fields from your saved profile. You can still edit
              anything before checkout.
            </span>
          </span>
        </label>
      ) : null}

      <FormField id="checkout-email" label="Email *">
        <input
          id="checkout-email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={(event) => onFieldChange("email", event.target.value)}
          placeholder="Enter email address"
          className={glassInputFlatClassName}
          required
        />
      </FormField>

      <FormField id="checkout-phone" label="Phone Number *">
        <input
          id="checkout-phone"
          type="tel"
          autoComplete="tel"
          value={form.phone_number}
          onChange={(event) => onFieldChange("phone_number", event.target.value)}
          placeholder="Enter phone number"
          className={glassInputFlatClassName}
          required
        />
      </FormField>

      <FormField id="checkout-home-address" label="Home Address *">
        <textarea
          id="checkout-home-address"
          rows={3}
          autoComplete="street-address"
          value={form.home_address}
          onChange={(event) => onFieldChange("home_address", event.target.value)}
          placeholder="Street, building, unit"
          className={cn(glassInputFlatClassName, "min-h-[88px] resize-y py-2.5")}
          required
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="checkout-city" label="City *">
          <input
            id="checkout-city"
            type="text"
            autoComplete="address-level2"
            value={form.city}
            onChange={(event) => onFieldChange("city", event.target.value)}
            placeholder="City"
            className={glassInputFlatClassName}
            required
          />
        </FormField>

        <FormField id="checkout-region" label="Region / State *">
          <input
            id="checkout-region"
            type="text"
            autoComplete="address-level1"
            value={form.region}
            onChange={(event) => onFieldChange("region", event.target.value)}
            placeholder="Region or state"
            className={glassInputFlatClassName}
            required
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="checkout-country" label="Country *">
          <input
            id="checkout-country"
            type="text"
            autoComplete="country-name"
            value={form.country}
            onChange={(event) => onFieldChange("country", event.target.value)}
            placeholder="Country"
            className={glassInputFlatClassName}
            required
          />
        </FormField>

        <FormField id="checkout-postal" label="Postal Code *">
          <input
            id="checkout-postal"
            type="text"
            autoComplete="postal-code"
            value={form.postal_code}
            onChange={(event) => onFieldChange("postal_code", event.target.value)}
            placeholder="Postal Code"
            className={glassInputFlatClassName}
            required
          />
        </FormField>
      </div>

      <CheckoutPaymentMethodSection
        method={paymentMethod}
        proofPreview={paymentProofDataUrl}
        onMethodChange={onPaymentMethodChange}
        onProofChange={onPaymentProofChange}
      />

      {formError ? (
        <p className="text-sm text-red-600" role="alert">
          {formError}
        </p>
      ) : null}
    </form>
  );
}
