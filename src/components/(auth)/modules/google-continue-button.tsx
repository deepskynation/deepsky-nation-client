"use client";

import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";

type GoogleContinueButtonProps = {
  onSuccess: (credential: string) => void;
  onError?: () => void;
  disabled?: boolean;
  label?: string;
};

export function GoogleContinueButton({
  onSuccess,
  onError,
  disabled = false,
  label = "Continue with shop",
}: GoogleContinueButtonProps) {
  return (
    <div className="relative w-full">
      <div
        className="pointer-events-none flex h-14 w-full items-center justify-center rounded-full bg-black text-base font-semibold text-white shadow-sm"
        aria-hidden
      >
        <span>{label}</span>
      </div>

      <div
        className={`absolute inset-0 overflow-hidden rounded-full opacity-[0.01] ${
          disabled ? "pointer-events-none" : ""
        }`}
      >
        <GoogleLogin
          onSuccess={(response: CredentialResponse) => {
            if (response.credential) {
              onSuccess(response.credential);
            }
          }}
          onError={onError}
          auto_select={false}
          theme="outline"
          size="large"
          text="continue_with"
          shape="pill"
          width="420"
        />
      </div>
    </div>
  );
}
