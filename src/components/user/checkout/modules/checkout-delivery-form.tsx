"use client";

import Link from "next/link";
import { CheckoutPaymentMethodSection } from "@/components/user/checkout/modules/checkout-payment-method";
import { FormField } from "@/components/common/forms/form-field";
import type { CheckoutDeliveryFormState, CheckoutDeliveryMode } from "@/lib/checkout-delivery";
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
  showDeliveryModeChoice?: boolean;
  deliveryMode: CheckoutDeliveryMode;
  onDeliveryModeChange: (mode: CheckoutDeliveryMode) => void;
  profileAddressAvailable?: boolean;
  paymentMethod: CheckoutPaymentMethod;
  paymentProofDataUrl: string | null;
  onPaymentMethodChange: (method: CheckoutPaymentMethod) => void;
  onPaymentProofChange: (dataUrl: string | null) => void;
  formError: string | null;
};

const readOnlyFieldClassName =
  "read-only:cursor-default read-only:bg-black/[0.03] read-only:text-black/70";

export function CheckoutDeliveryForm({
  form,
  onFieldChange,
  onSubmit,
  showDeliveryModeChoice = false,
  deliveryMode,
  onDeliveryModeChange,
  profileAddressAvailable = false,
  paymentMethod,
  paymentProofDataUrl,
  onPaymentMethodChange,
  onPaymentProofChange,
  formError,
}: CheckoutDeliveryFormProps) {
  const useProfileAddress = deliveryMode === "profile" && profileAddressAvailable;
  const fieldsReadOnly = useProfileAddress;

  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      {showDeliveryModeChoice ? (
        <fieldset className="space-y-3">
          <legend className="mb-1 text-sm font-medium text-black">
            Delivery address
          </legend>

          <label
            className={cn(
              glassHighlightFlatClassName,
              "flex cursor-pointer items-start gap-3 p-4 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-black/20",
              useProfileAddress && "ring-1 ring-neutral-300/80",
              !profileAddressAvailable && "cursor-not-allowed opacity-60",
            )}
          >
            <input
              type="radio"
              name="checkout-delivery-mode"
              checked={deliveryMode === "profile"}
              disabled={!profileAddressAvailable}
              onChange={() => onDeliveryModeChange("profile")}
              className="mt-0.5 size-4 shrink-0 accent-black"
            />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-black">
                Saved profile address
              </span>
              <span className="block text-xs text-black/55">
                {profileAddressAvailable
                  ? "Use the delivery details from your account."
                  : "Complete your profile to use a saved address."}
              </span>
            </span>
          </label>

          <label
            className={cn(
              glassHighlightFlatClassName,
              "flex cursor-pointer items-start gap-3 p-4 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-black/20",
              deliveryMode === "custom" && "ring-1 ring-neutral-300/80",
            )}
          >
            <input
              type="radio"
              name="checkout-delivery-mode"
              checked={deliveryMode === "custom"}
              onChange={() => onDeliveryModeChange("custom")}
              className="mt-0.5 size-4 shrink-0 accent-black"
            />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-black">
                Different delivery address
              </span>
              <span className="block text-xs text-black/55">
                Enter a one-time shipping address for this order.
              </span>
            </span>
          </label>
        </fieldset>
      ) : null}

      {useProfileAddress ? (
        <p className="text-xs text-black/45">
          Filled from your profile.{" "}
          <Link href="/user/profile" className="underline hover:text-black">
            Update profile
          </Link>{" "}
          or choose a different delivery address to edit here.
        </p>
      ) : null}

      <FormField id="checkout-email" label="Email *">
        <input
          id="checkout-email"
          type="email"
          autoComplete="email"
          value={form.email}
          readOnly={fieldsReadOnly}
          onChange={(event) => onFieldChange("email", event.target.value)}
          placeholder="Enter email address"
          className={cn(glassInputFlatClassName, readOnlyFieldClassName)}
          required
        />
      </FormField>

      <FormField id="checkout-phone" label="Phone Number *">
        <input
          id="checkout-phone"
          type="tel"
          autoComplete="tel"
          value={form.phone_number}
          readOnly={fieldsReadOnly}
          onChange={(event) => onFieldChange("phone_number", event.target.value)}
          placeholder="Enter phone number"
          className={cn(glassInputFlatClassName, readOnlyFieldClassName)}
          required
        />
      </FormField>

      <FormField id="checkout-home-address" label="Home Address *">
        <textarea
          id="checkout-home-address"
          rows={3}
          autoComplete="street-address"
          value={form.home_address}
          readOnly={fieldsReadOnly}
          onChange={(event) => onFieldChange("home_address", event.target.value)}
          placeholder="Street, building, unit"
          className={cn(
            glassInputFlatClassName,
            readOnlyFieldClassName,
            "min-h-[88px] resize-y py-2.5",
            fieldsReadOnly && "resize-none",
          )}
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
            readOnly={fieldsReadOnly}
            onChange={(event) => onFieldChange("city", event.target.value)}
            placeholder="City"
            className={cn(glassInputFlatClassName, readOnlyFieldClassName)}
            required
          />
        </FormField>

        <FormField id="checkout-region" label="Region / State *">
          <input
            id="checkout-region"
            type="text"
            autoComplete="address-level1"
            value={form.region}
            readOnly={fieldsReadOnly}
            onChange={(event) => onFieldChange("region", event.target.value)}
            placeholder="Region or state"
            className={cn(glassInputFlatClassName, readOnlyFieldClassName)}
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
            readOnly={fieldsReadOnly}
            onChange={(event) => onFieldChange("country", event.target.value)}
            placeholder="Country"
            className={cn(glassInputFlatClassName, readOnlyFieldClassName)}
            required
          />
        </FormField>

        <FormField id="checkout-postal" label="Postal Code *">
          <input
            id="checkout-postal"
            type="text"
            autoComplete="postal-code"
            value={form.postal_code}
            readOnly={fieldsReadOnly}
            onChange={(event) => onFieldChange("postal_code", event.target.value)}
            placeholder="Postal Code"
            className={cn(glassInputFlatClassName, readOnlyFieldClassName)}
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
