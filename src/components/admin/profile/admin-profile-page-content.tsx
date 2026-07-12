"use client";

import { Loader2Icon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/common/forms/form-field";
import { useToast } from "@/components/common/feedback/toast-provider";
import {
  alertErrorClassName,
  fieldClassName,
  hintClassName,
  sectionClassName,
  sectionTitleClassName,
} from "@/lib/panel-styles";
import { useAppDispatch, useAppSelector } from "@/hooks";
import {
  adminAccountFormFromUser,
  adminAccountFormToPayload,
  validateAdminAccountForm,
  type AdminAccountFormState,
} from "@/lib/admin-account-form";
import { parseShippingFee } from "@/types/settings";
import {
  clearAccountUpdateError,
  selectAccountUpdateError,
  selectAccountUpdateStatus,
  selectAuthInitialized,
  selectAuthUser,
  selectIsAuthenticated,
  updateAccount,
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

export function AdminProfilePageContent() {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const authReady = useAppSelector(selectAuthInitialized);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectAuthUser);
  const accountUpdateStatus = useAppSelector(selectAccountUpdateStatus);
  const accountUpdateError = useAppSelector(selectAccountUpdateError);
  const shopSettings = useAppSelector(selectShopSettings);
  const shopSettingsStatus = useAppSelector(selectShopSettingsStatus);
  const shopSettingsError = useAppSelector(selectShopSettingsError);
  const updateShopSettingsStatus = useAppSelector(selectUpdateShopSettingsStatus);
  const updateShopSettingsError = useAppSelector(selectUpdateShopSettingsError);

  const [form, setForm] = useState<AdminAccountFormState>({
    username: "",
    email: "",
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [accountLocalError, setAccountLocalError] = useState<string | null>(null);
  const [shippingFeeInput, setShippingFeeInput] = useState("50");
  const [settingsLocalError, setSettingsLocalError] = useState<string | null>(null);

  const originalAccount = useMemo(
    () => ({
      username: user?.name ?? "",
      email: user?.email ?? "",
    }),
    [user?.email, user?.name],
  );

  useEffect(() => {
    if (!user) {
      return;
    }
    setForm(adminAccountFormFromUser(user));
  }, [user]);

  useEffect(() => {
    if (!authReady || !isAuthenticated) {
      return;
    }
    void dispatch(fetchShopSettings());
  }, [authReady, dispatch, isAuthenticated]);

  useEffect(() => {
    if (!shopSettings) {
      return;
    }
    setShippingFeeInput(String(parseShippingFee(shopSettings.default_shipping_fee)));
  }, [shopSettings]);

  const isSavingAccount = accountUpdateStatus === "loading";
  const isSavingSettings = updateShopSettingsStatus === "loading";

  const updateField = (field: keyof AdminAccountFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setAccountLocalError(null);
    dispatch(clearAccountUpdateError());
  };

  const handleAccountSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setAccountLocalError(null);
    dispatch(clearAccountUpdateError());

    const validationError = validateAdminAccountForm(form, originalAccount);
    if (validationError) {
      setAccountLocalError(validationError);
      return;
    }

    const result = await dispatch(updateAccount(adminAccountFormToPayload(form)));
    if (updateAccount.fulfilled.match(result)) {
      toast.success("Account updated successfully.");
      setForm((current) => ({
        ...adminAccountFormFromUser(result.payload),
        current_password: "",
        new_password: "",
        confirm_password: "",
      }));
      return;
    }

    if (updateAccount.rejected.match(result)) {
      toast.error(
        typeof result.payload === "string"
          ? result.payload
          : "Failed to update account.",
      );
    }
  };

  const handleSettingsSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
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
      toast.success("Default shipping fee updated.");
      return;
    }

    if (updateShopSettings.rejected.match(result)) {
      toast.error(
        typeof result.payload === "string"
          ? result.payload
          : "Failed to update shipping fee.",
      );
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
          Manage your admin account and store settings.
        </p>
      </div>

      <form onSubmit={(event) => void handleAccountSubmit(event)} className="space-y-6">
        <div className={sectionClassName}>
          <h2 className={sectionTitleClassName}>Account</h2>
          <p className={hintClassName}>
            Update your username. Email cannot be changed here.
          </p>

          <div className="space-y-4">
            <FormField id="admin-profile-username" label="Username">
              <input
                id="admin-profile-username"
                type="text"
                autoComplete="username"
                value={form.username}
                onChange={(event) => updateField("username", event.target.value)}
                className={fieldClassName}
                disabled={isSavingAccount}
              />
            </FormField>

            <FormField id="admin-profile-email" label="Email">
              <input
                id="admin-profile-email"
                type="email"
                autoComplete="email"
                value={form.email}
                readOnly
                className={fieldClassName}
                disabled
              />
            </FormField>
          </div>
        </div>

        {accountLocalError ? (
          <p className={alertErrorClassName} role="alert">
            {accountLocalError}
          </p>
        ) : null}
        {accountUpdateError ? (
          <p className={alertErrorClassName} role="alert">
            {accountUpdateError}
          </p>
        ) : null}

        <Button type="submit" disabled={isSavingAccount}>
          {isSavingAccount ? (
            <>
              <Loader2Icon className="size-4 animate-spin" />
              Saving…
            </>
          ) : (
            "Save Account"
          )}
        </Button>
      </form>

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
    </div>
  );
}
