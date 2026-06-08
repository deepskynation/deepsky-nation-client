"use client";

import { useEffect, useState } from "react";
import { Loader2Icon } from "lucide-react";
import {
  adminAlertErrorClass,
  adminFieldClass,
  adminHintClass,
  adminLabelClass,
} from "@/components/admin/product/modules/admin-product-ui";
import { useToast } from "@/components/common/feedback/toast-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppDispatch, useAppSelector } from "@/hooks";
import {
  createAdminAccount,
  fetchAdminUsersList,
  resetCreateAdminAccount,
  selectCreateAdminAccountError,
  selectCreateAdminAccountStatus,
} from "@/store/slices/adminUserSlice";
import type { AdminUserRole } from "@/types/admin-user";

type CreateAdminAccountDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type FormState = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: AdminUserRole;
};

const EMPTY_FORM: FormState = {
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "admin",
};

function validateForm(form: FormState): string | null {
  const username = form.username.trim();
  const email = form.email.trim();

  if (username.length < 3) {
    return "Username must be at least 3 characters.";
  }
  if (!email) {
    return "Email is required.";
  }
  if (form.password.length < 8) {
    return "Password must be at least 8 characters.";
  }
  if (form.password !== form.confirmPassword) {
    return "Passwords do not match.";
  }
  return null;
}

export function CreateAdminAccountDialog({
  open,
  onOpenChange,
}: CreateAdminAccountDialogProps) {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const createStatus = useAppSelector(selectCreateAdminAccountStatus);
  const createError = useAppSelector(selectCreateAdminAccountError);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [validationError, setValidationError] = useState<string | null>(null);

  const isSubmitting = createStatus === "loading";

  useEffect(() => {
    if (!open) {
      setForm(EMPTY_FORM);
      setValidationError(null);
      dispatch(resetCreateAdminAccount());
    }
  }, [dispatch, open]);

  const handleClose = (nextOpen: boolean) => {
    if (isSubmitting) {
      return;
    }
    onOpenChange(nextOpen);
  };

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (validationError) {
      setValidationError(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const error = validateForm(form);
    if (error) {
      setValidationError(error);
      return;
    }

    setValidationError(null);

    const result = await dispatch(
      createAdminAccount({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      }),
    );

    if (createAdminAccount.fulfilled.match(result)) {
      toast.success(result.payload.message);
      void dispatch(fetchAdminUsersList({ page: 1 }));
      onOpenChange(false);
      return;
    }

    if (createAdminAccount.rejected.match(result)) {
      toast.error(
        typeof result.payload === "string"
          ? result.payload
          : "Failed to create account.",
      );
    }
  };

  const displayError = validationError ?? createError;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" showCloseButton={!isSubmitting}>
        <DialogHeader>
          <DialogTitle>Create Admin Account</DialogTitle>
          <DialogDescription>
            Add a new admin who can sign in to the admin dashboard. The account is
            email-verified immediately and can log in right away.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <label htmlFor="create-admin-username" className={adminLabelClass}>
              Username
            </label>
            <input
              id="create-admin-username"
              type="text"
              autoComplete="username"
              value={form.username}
              onChange={(event) => updateField("username", event.target.value)}
              className={adminFieldClass}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="create-admin-email" className={adminLabelClass}>
              Email
            </label>
            <input
              id="create-admin-email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              className={adminFieldClass}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="create-admin-role" className={adminLabelClass}>
              Role
            </label>
            <select
              id="create-admin-role"
              value={form.role}
              onChange={(event) =>
                updateField("role", event.target.value as AdminUserRole)
              }
              className={adminFieldClass}
              disabled={isSubmitting}
            >
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
            <p className={adminHintClass}>
              Choose Admin for dashboard access, or User for a regular customer account.
            </p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="create-admin-password" className={adminLabelClass}>
              Password
            </label>
            <input
              id="create-admin-password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={(event) => updateField("password", event.target.value)}
              className={adminFieldClass}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="create-admin-confirm-password" className={adminLabelClass}>
              Confirm password
            </label>
            <input
              id="create-admin-confirm-password"
              type="password"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={(event) => updateField("confirmPassword", event.target.value)}
              className={adminFieldClass}
              disabled={isSubmitting}
              required
            />
          </div>

          {displayError ? (
            <p className={adminAlertErrorClass} role="alert">
              {displayError}
            </p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2Icon className="size-4 animate-spin" aria-hidden />
                  Creating…
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
