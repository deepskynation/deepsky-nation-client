"use client";

import Link from "next/link";
import { CheckoutPaymentMethodSection } from "@/components/user/checkout/modules/checkout-payment-method";
import { FormField } from "@/components/common/forms/form-field";
import {
  CHECKOUT_DELIVERY_SCHEDULE_NOTE,
  type CheckoutDeliveryFormState,
} from "@/lib/checkout-delivery";
import type { CheckoutPaymentMethod } from "@/lib/checkout-payment";
import { glassHighlightFlatClassName } from "@/lib/glass-styles";
import { cn } from "@/lib/utils";

const checkoutDeliverySectionClassName =
  "space-y-4 rounded-xl bg-neutral-100 p-4 sm:p-5";

const checkoutDeliveryInputClassName =
  "h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm text-black outline-none transition-colors placeholder:text-black/35 focus:border-neutral-400 focus:ring-1 focus:ring-neutral-300/80";

const checkoutDeliveryTextareaClassName = cn(
  checkoutDeliveryInputClassName,
  "min-h-[88px] resize-y py-2.5",
);

type CheckoutDeliveryFormProps = {
  primaryForm: CheckoutDeliveryFormState;
  onPrimaryFieldChange: (field: keyof CheckoutDeliveryFormState, value: string) => void;
  alternateForm: CheckoutDeliveryFormState;
  onAlternateFieldChange: (field: keyof CheckoutDeliveryFormState, value: string) => void;
  onSubmit: () => void;
  usingAlternateAddress: boolean;
  onUsingAlternateAddressChange: (usingAlternate: boolean) => void;
  saveToProfile?: boolean;
  onSaveToProfileChange?: (checked: boolean) => void;
  savedProfileDeliveryAvailable?: boolean;
  usingSavedProfileDelivery: boolean;
  onUsingSavedProfileDeliveryChange: (useSaved: boolean) => void;
  paymentMethod: CheckoutPaymentMethod;
  paymentProofDataUrl: string | null;
  onPaymentMethodChange: (method: CheckoutPaymentMethod) => void;
  onPaymentProofChange: (dataUrl: string | null) => void;
  formError: string | null;
};

type DeliveryAddressFieldsProps = {
  idPrefix: string;
  form: CheckoutDeliveryFormState;
  onFieldChange: (field: keyof CheckoutDeliveryFormState, value: string) => void;
};

function DeliveryAddressFields({
  idPrefix,
  form,
  onFieldChange,
}: DeliveryAddressFieldsProps) {
  return (
    <>
      <FormField id={`${idPrefix}-email`} label="Email *">
        <input
          id={`${idPrefix}-email`}
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={(event) => onFieldChange("email", event.target.value)}
          placeholder="Enter email address"
          className={checkoutDeliveryInputClassName}
          required
        />
      </FormField>

      <FormField id={`${idPrefix}-phone`} label="Phone Number *">
        <input
          id={`${idPrefix}-phone`}
          type="tel"
          autoComplete="tel"
          value={form.phone_number}
          onChange={(event) => onFieldChange("phone_number", event.target.value)}
          placeholder="Enter phone number"
          className={checkoutDeliveryInputClassName}
          required
        />
      </FormField>

      <FormField id={`${idPrefix}-home-address`} label="Home Address *">
        <textarea
          id={`${idPrefix}-home-address`}
          rows={3}
          autoComplete="street-address"
          value={form.home_address}
          onChange={(event) => onFieldChange("home_address", event.target.value)}
          placeholder="Street, building, unit"
          className={checkoutDeliveryTextareaClassName}
          required
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id={`${idPrefix}-city`} label="City *">
          <input
            id={`${idPrefix}-city`}
            type="text"
            autoComplete="address-level2"
            value={form.city}
            onChange={(event) => onFieldChange("city", event.target.value)}
            placeholder="City"
            className={checkoutDeliveryInputClassName}
            required
          />
        </FormField>

        <FormField id={`${idPrefix}-region`} label="Region / State *">
          <input
            id={`${idPrefix}-region`}
            type="text"
            autoComplete="address-level1"
            value={form.region}
            onChange={(event) => onFieldChange("region", event.target.value)}
            placeholder="Region or state"
            className={checkoutDeliveryInputClassName}
            required
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id={`${idPrefix}-country`} label="Country *">
          <input
            id={`${idPrefix}-country`}
            type="text"
            autoComplete="country-name"
            value={form.country}
            onChange={(event) => onFieldChange("country", event.target.value)}
            placeholder="Country"
            className={checkoutDeliveryInputClassName}
            required
          />
        </FormField>

        <FormField id={`${idPrefix}-postal`} label="Postal Code *">
          <input
            id={`${idPrefix}-postal`}
            type="text"
            autoComplete="postal-code"
            value={form.postal_code}
            onChange={(event) => onFieldChange("postal_code", event.target.value)}
            placeholder="Postal Code"
            className={checkoutDeliveryInputClassName}
            required
          />
        </FormField>
      </div>
    </>
  );
}

export function CheckoutDeliveryForm({
  primaryForm,
  onPrimaryFieldChange,
  alternateForm,
  onAlternateFieldChange,
  onSubmit,
  usingAlternateAddress,
  onUsingAlternateAddressChange,
  saveToProfile = false,
  onSaveToProfileChange,
  savedProfileDeliveryAvailable = false,
  usingSavedProfileDelivery,
  onUsingSavedProfileDeliveryChange,
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
      <p className="text-xs text-black/50">{CHECKOUT_DELIVERY_SCHEDULE_NOTE}</p>

      <section className={checkoutDeliverySectionClassName}>
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-black">Delivery details</h3>
          <p className="text-xs text-black/55">
            Enter your delivery information.{" "}
            <Link href="/profile" className="underline hover:text-black">
              Manage profile
            </Link>
          </p>
        </div>

        {savedProfileDeliveryAvailable ? (
          <fieldset className="space-y-3">
            <legend className="sr-only">How to fill delivery details</legend>

            <label
              className={cn(
                glassHighlightFlatClassName,
                "flex cursor-pointer items-start gap-3 p-4 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-black/20",
                !usingSavedProfileDelivery && "ring-1 ring-neutral-300/80",
              )}
            >
              <input
                type="radio"
                name="checkout-primary-delivery"
                checked={!usingSavedProfileDelivery}
                onChange={() => onUsingSavedProfileDeliveryChange(false)}
                className="mt-0.5 size-4 shrink-0 accent-black"
              />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-black">
                  Enter delivery details manually
                </span>
                <span className="block text-xs text-black/55">
                  Fill in your delivery information below.
                </span>
              </span>
            </label>

            <label
              className={cn(
                glassHighlightFlatClassName,
                "flex cursor-pointer items-start gap-3 p-4 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-black/20",
                usingSavedProfileDelivery && "ring-1 ring-neutral-300/80",
              )}
            >
              <input
                type="radio"
                name="checkout-primary-delivery"
                checked={usingSavedProfileDelivery}
                onChange={() => onUsingSavedProfileDeliveryChange(true)}
                className="mt-0.5 size-4 shrink-0 accent-black"
              />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-black">
                  Use your saved profile delivery details
                </span>
                <span className="block text-xs text-black/55">
                  Fill the form below from your saved profile.
                </span>
              </span>
            </label>
          </fieldset>
        ) : null}

        <DeliveryAddressFields
          idPrefix="checkout-primary"
          form={primaryForm}
          onFieldChange={onPrimaryFieldChange}
        />

        {onSaveToProfileChange ? (
          <label className="flex cursor-pointer items-start gap-3 text-sm text-black">
            <input
              type="checkbox"
              checked={saveToProfile}
              onChange={(event) => onSaveToProfileChange(event.target.checked)}
              className="mt-0.5 size-4 shrink-0 accent-black"
            />
            <span className="text-black/70">
              Save this address to my profile for future orders
            </span>
          </label>
        ) : null}
      </section>

      <label
        className={cn(
          glassHighlightFlatClassName,
          "flex cursor-pointer items-start gap-3 p-4 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-black/20",
          usingAlternateAddress && "ring-1 ring-neutral-300/80",
        )}
      >
        <input
          type="radio"
          name="checkout-alternate-delivery"
          checked={usingAlternateAddress}
          onChange={() => onUsingAlternateAddressChange(true)}
          className="mt-0.5 size-4 shrink-0 accent-black"
        />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-black">
            Ship to a different address
          </span>
          <span className="block text-xs text-black/55">
            Use a one-time address for this order.
          </span>
        </span>
      </label>

      {usingAlternateAddress ? (
        <section className={checkoutDeliverySectionClassName}>
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-black">One-time shipping address</h3>
            <p className="text-xs text-black/55">
              This address is used for this order only.
            </p>
          </div>

          <DeliveryAddressFields
            idPrefix="checkout-alternate"
            form={alternateForm}
            onFieldChange={onAlternateFieldChange}
          />

          <button
            type="button"
            onClick={() => onUsingAlternateAddressChange(false)}
            className="text-sm text-black/55 underline-offset-2 hover:text-black hover:underline"
          >
            Use primary delivery address instead
          </button>
        </section>
      ) : null}

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
