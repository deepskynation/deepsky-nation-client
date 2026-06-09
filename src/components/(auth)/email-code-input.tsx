"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type EmailCodeInputProps = {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
};

const CODE_LENGTH = 6;

export function EmailCodeInput({
  value,
  onChange,
  onComplete,
  disabled = false,
}: EmailCodeInputProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: CODE_LENGTH }, (_, index) => value[index] ?? "");

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (value.length === CODE_LENGTH) {
      onComplete?.(value);
    }
  }, [value, onComplete]);

  const updateDigit = (index: number, digit: string) => {
    const sanitized = digit.replace(/\D/g, "").slice(-1);
    const next = digits.slice();
    next[index] = sanitized;
    onChange(next.join("").slice(0, CODE_LENGTH));

    if (sanitized && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, key: string) => {
    if (key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (text: string) => {
    const pasted = text.replace(/\D/g, "").slice(0, CODE_LENGTH);
    if (!pasted) {
      return;
    }
    onChange(pasted);
    const focusIndex = Math.min(pasted.length, CODE_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  return (
    <div className="flex items-center justify-center gap-2.5 sm:gap-3">
      {digits.map((digit, index) => (
        <div key={index} className="flex items-center gap-2.5 sm:gap-3">
          <input
            ref={(element) => {
              inputRefs.current[index] = element;
            }}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            maxLength={1}
            value={digit}
            disabled={disabled}
            aria-label={`Digit ${index + 1}`}
            onChange={(event) => updateDigit(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event.key)}
            onPaste={(event) => {
              event.preventDefault();
              handlePaste(event.clipboardData.getData("text"));
            }}
            className={cn(
              "size-12 rounded-2xl border bg-white text-center text-xl font-semibold text-black outline-none transition-colors sm:size-14 sm:text-2xl",
              digit || index === value.length
                ? "border-black"
                : "border-black/10",
              "focus:border-black disabled:opacity-60",
            )}
          />
          {index === 2 ? (
            <span className="text-xl text-black/25" aria-hidden>
              ·
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}
