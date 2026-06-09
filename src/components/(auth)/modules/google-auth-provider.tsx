"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() ?? "";

export function GoogleAuthProvider({ children }: { children: React.ReactNode }) {
  if (!googleClientId) {
    return children;
  }

  return <GoogleOAuthProvider clientId={googleClientId}>{children}</GoogleOAuthProvider>;
}

export function isGoogleSignInEnabled(): boolean {
  return Boolean(googleClientId);
}
