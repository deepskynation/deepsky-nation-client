"use client";

import { Loader2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/common/forms/form-field";
import {
  alertErrorClassName,
  alertSuccessClassName,
  fieldClassName,
  hintClassName,
  labelClassName,
  sectionClassName,
  sectionTitleClassName,
  textareaClassName,
} from "@/lib/panel-styles";
import { useAppDispatch, useAppSelector } from "@/hooks";
import {
  emptyProfileForm,
  profileFormFromUser,
  profileFormToPayload,
  validateProfileForm,
  type ProfileFormState,
} from "@/lib/profile-form";
import { parseShippingFee } from "@/types/settings";
import {
  clearProfileUpdateError,
  selectAuthInitialized,
  selectAuthUser,
  selectIsAuthenticated,
  selectProfileUpdateError,
  selectProfileUpdateStatus,
  updateProfile,
} from "@/store/slices/authSlice";
import {
  fetchShopSettings,
  resetUpdateShopSettings,
  selectShopSettings,
  selectShopSettingsError,
  selectShopSettingsStatus,
  selectUpdateShopSettingsError,
  selectUpdateShopSettingsStatus,
  updateShopSettings,
} from "@/store/slices/settingsSlice";

type ProfilePageContentProps = {
  showStoreSettings?: boolean;
};

export function ProfilePageContent({
  showStoreSettings = false,
}: ProfilePageContentProps) {
  const dispatch = useAppDispatch();
  const authReady = useAppSelector(selectAuthInitialized);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectAuthUser);
  const profileUpdateStatus = useAppSelector(selectProfileUpdateStatus);
  const profileUpdateError = useAppSelector(selectProfileUpdateError);
  const shopSettings = useAppSelector(selectShopSettings);
  const shopSettingsStatus = useAppSelector(selectShopSettingsStatus);
  const shopSettingsError = useAppSelector(selectShopSettingsError);
  const updateShopSettingsStatus = useAppSelector(selectUpdateShopSettingsStatus);
  const updateShopSettingsError = useAppSelector(selectUpdateShopSettingsError);

  const [form, setForm] = useState<ProfileFormState>(emptyProfileForm);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileLocalError, setProfileLocalError] = useState<string | null>(null);
  const [shippingFeeInput, setShippingFeeInput] = useState("50");
  const [settingsSuccess, setSettingsSuccess] = useState<string | null>(null);
  const [settingsLocalError, setSettingsLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      return;
    }
    setForm(profileFormFromUser(user));
  }, [user]);

  useEffect(() => {
    if (!showStoreSettings || !authReady || !isAuthenticated) {
      return;
    }
    void dispatch(fetchShopSettings());
  }, [authReady, dispatch, isAuthenticated, showStoreSettings]);

  useEffect(() => {
    if (!shopSettings) {
      return;
    }
    setShippingFeeInput(String(parseShippingFee(shopSettings.default_shipping_fee)));
  }, [shopSettings]);

  const isSavingProfile = profileUpdateStatus === "loading";
  const isSavingSettings = updateShopSettingsStatus === "loading";

  const updateField = (field: keyof ProfileFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setProfileSuccess(null);
    setProfileLocalError(null);
    dispatch(clearProfileUpdateError());
  };

  const handleProfileSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setProfileSuccess(null);
    setProfileLocalError(null);
    dispatch(clearProfileUpdateError());

    const validationError = validateProfileForm(form);
    if (validationError) {
      setProfileLocalError(validationError);
      return;
    }

    const result = await dispatch(updateProfile(profileFormToPayload(form)));
    if (updateProfile.fulfilled.match(result)) {
      setProfileSuccess("Profile updated successfully.");
    }
  };

  const handleSettingsSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSettingsSuccess(null);
    setSettingsLocalError(null);
    dispatch(resetUpdateShopSettings());

    const parsedFee = Number(shippingFeeInput);
    if (!Number.isFinite(parsedFee) || parsedFee < 0) {
      setSettingsLocalError("Enter a valid shipping fee (0 or greater).");
      return;
    }

    const result = await dispatch(
      updateShopSettings({ default_shipping_fee: parsedFee }),
    );
    if (updateShopSettings.fulfilled.match(result)) {
      setSettingsSuccess("Default shipping fee updated.");
    }
  };

  if (!authReady) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
        <Loader2Icon className="size-5 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <p className={alertErrorClassName} role="alert">
        Sign in to manage your profile.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          Profile
        </h1>
        <p className={hintClassName}>
          Update your delivery details for faster checkout.
        </p>
      </div>

      <form onSubmit={(event) => void handleProfileSubmit(event)} className="space-y-6">
        <div className={sectionClassName}>
          <h2 className={sectionTitleClassName}>Account</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <span className={labelClassName}>Username</span>
              <p className="rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-700">
                {user.name}
              </p>
            </div>
            <div className="space-y-1.5">
              <span className={labelClassName}>Email</span>
              <p className="rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-700">
                {user.email}
              </p>
            </div>
          </div>
        </div>

        <div className={sectionClassName}>
          <h2 className={sectionTitleClassName}>Delivery Details</h2>
          <p className={hintClassName}>
            Used when you choose &quot;Use My Profile Information&quot; at checkout.
          </p>

          <div className="space-y-4">
            <FormField id="profile-phone" label="Phone Number *">
              <input
                id="profile-phone"
                type="tel"
                value={form.phone_number}
                onChange={(event) => updateField("phone_number", event.target.value)}
                className={fieldClassName}
                disabled={isSavingProfile}
              />
            </FormField>

            <FormField id="profile-home-address" label="Home Address *">
              <textarea
                id="profile-home-address"
                rows={3}
                value={form.home_address}
                onChange={(event) => updateField("home_address", event.target.value)}
                className={textareaClassName}
                disabled={isSavingProfile}
              />
            </FormField>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField id="profile-city" label="City *">
                <input
                  id="profile-city"
                  type="text"
                  value={form.city}
                  onChange={(event) => updateField("city", event.target.value)}
                  className={fieldClassName}
                  disabled={isSavingProfile}
                />
              </FormField>
              <FormField id="profile-region" label="Region / State *">
                <input
                  id="profile-region"
                  type="text"
                  value={form.region}
                  onChange={(event) => updateField("region", event.target.value)}
                  className={fieldClassName}
                  disabled={isSavingProfile}
                />
              </FormField>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField id="profile-country" label="Country *">
                <input
                  id="profile-country"
                  type="text"
                  value={form.country}
                  onChange={(event) => updateField("country", event.target.value)}
                  className={fieldClassName}
                  disabled={isSavingProfile}
                />
              </FormField>
              <FormField id="profile-postal-code" label="Postal Code *">
                <input
                  id="profile-postal-code"
                  type="text"
                  value={form.postal_code}
                  onChange={(event) => updateField("postal_code", event.target.value)}
                  className={fieldClassName}
                  disabled={isSavingProfile}
                />
              </FormField>
            </div>
          </div>
        </div>

        {profileLocalError ? (
          <p className={alertErrorClassName} role="alert">
            {profileLocalError}
          </p>
        ) : null}
        {profileUpdateError ? (
          <p className={alertErrorClassName} role="alert">
            {profileUpdateError}
          </p>
        ) : null}
        {profileSuccess ? (
          <p className={alertSuccessClassName} role="status">
            {profileSuccess}
          </p>
        ) : null}

        <Button type="submit" disabled={isSavingProfile}>
          {isSavingProfile ? (
            <>
              <Loader2Icon className="size-4 animate-spin" />
              Saving…
            </>
          ) : (
            "Save Profile"
          )}
        </Button>
      </form>

      {showStoreSettings ? (
        <form
          onSubmit={(event) => void handleSettingsSubmit(event)}
          className="space-y-6"
        >
          <div className={sectionClassName}>
            <h2 className={sectionTitleClassName}>Store Settings</h2>
            <p className={hintClassName}>
              Default flat shipping fee applied to every checkout order.
            </p>

            {shopSettingsStatus === "loading" && !shopSettings ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2Icon className="size-4 animate-spin" />
                Loading shop settings…
              </div>
            ) : (
              <FormField id="default-shipping-fee" label="Default Shipping Fee (PHP) *">
                <input
                  id="default-shipping-fee"
                  type="number"
                  min={0}
                  step="0.01"
                  value={shippingFeeInput}
                  onChange={(event) => {
                    setShippingFeeInput(event.target.value);
                    setSettingsSuccess(null);
                    setSettingsLocalError(null);
                    dispatch(resetUpdateShopSettings());
                  }}
                  className={fieldClassName}
                  disabled={isSavingSettings || shopSettingsStatus === "loading"}
                />
              </FormField>
            )}
          </div>

          {shopSettingsError ? (
            <p className={alertErrorClassName} role="alert">
              {shopSettingsError}
            </p>
          ) : null}
          {settingsLocalError ? (
            <p className={alertErrorClassName} role="alert">
              {settingsLocalError}
            </p>
          ) : null}
          {updateShopSettingsError ? (
            <p className={alertErrorClassName} role="alert">
              {updateShopSettingsError}
            </p>
          ) : null}
          {settingsSuccess ? (
            <p className={alertSuccessClassName} role="status">
              {settingsSuccess}
            </p>
          ) : null}

          <Button
            type="submit"
            disabled={isSavingSettings || shopSettingsStatus === "loading"}
          >
            {isSavingSettings ? (
              <>
                <Loader2Icon className="size-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Save Shipping Fee"
            )}
          </Button>
        </form>
      ) : null}
    </div>
  );
}
