"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

type LandingProductSearchProps = {
  className?: string;
};

export function LandingProductSearch({ className }: LandingProductSearchProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = query.trim();
    const params = trimmed ? `?q=${encodeURIComponent(trimmed)}` : "";
    router.push(`/products${params}`);
    setOpen(false);
    setQuery("");
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search products"
        className={cn(
          "inline-flex size-10 items-center justify-center text-black transition-opacity hover:opacity-70",
          className,
        )}
      >
        <Search className="size-6" strokeWidth={1.75} />
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex items-center", className)}
    >
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-black/40"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          autoFocus
          placeholder="Search products..."
          aria-label="Search products"
          className="h-10 w-40 border border-black/15 bg-white/70 pr-3 pl-9 text-sm text-black outline-none placeholder:text-black/35 focus:border-black/30 sm:w-52"
        />
      </div>
    </form>
  );
}
