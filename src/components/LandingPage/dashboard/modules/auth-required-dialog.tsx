"use client";

import Link from "next/link";
import { LucideShoppingCart } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type AuthRequiredDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AuthRequiredDialog({
  open,
  onOpenChange,
}: AuthRequiredDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="gap-0 overflow-hidden border-black/10 bg-white p-0 shadow-[0_24px_80px_rgba(0,0,0,0.14)] ring-black/8 sm:max-w-[420px]"
      >
        <div className="relative border-b border-black/8 bg-gradient-to-b from-neutral-50 to-white px-6 pt-8 pb-7 text-center">
          <div
            className="pointer-events-none absolute -top-10 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full bg-black/[0.03] blur-2xl"
            aria-hidden
          />

          <div className="relative mx-auto mb-5 flex size-14 items-center justify-center rounded-full border border-black/10 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
            <LucideShoppingCart className="size-5 text-black" strokeWidth={1.75} />
          </div>

          <DialogHeader className="relative items-center gap-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-black/40">
              DeepSky
            </p>
            <DialogTitle className="font-serif text-[1.65rem] leading-tight font-medium text-black">
              Sign In To Order
            </DialogTitle>
            <DialogDescription className="max-w-[19rem] text-center text-sm leading-relaxed text-black/55">
              Log in or create an account to add items to your cart and
              checkout.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-3 px-6 py-6">
          <Link
            href="/login"
            className="flex h-11 w-full cursor-pointer items-center justify-center rounded-md bg-black text-sm font-medium text-white transition-colors hover:bg-black/90"
          >
            Sign in
          </Link>

          <DialogClose
            render={
              <button
                type="button"
                className="w-full cursor-pointer py-1 text-center text-xs text-black/50 transition-colors hover:text-black"
              />
            }
          >
            Continue browsing
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
