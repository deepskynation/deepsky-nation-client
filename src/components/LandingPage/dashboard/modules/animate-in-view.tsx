"use client";

import type { ReactNode } from "react";
import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";

type AnimateInViewProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right";
};

export function AnimateInView({
  children,
  className,
  delay = 0,
  direction = "up",
}: AnimateInViewProps) {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={cn(
        "motion-safe:transition-all motion-safe:duration-700 motion-safe:ease-out",
        !inView && direction === "up" && "motion-safe:translate-y-6 motion-safe:opacity-0",
        !inView &&
          direction === "left" &&
          "motion-safe:-translate-x-6 motion-safe:opacity-0",
        !inView &&
          direction === "right" &&
          "motion-safe:translate-x-6 motion-safe:opacity-0",
        inView && "motion-safe:translate-x-0 motion-safe:translate-y-0 motion-safe:opacity-100",
        className,
      )}
      style={{ transitionDelay: inView ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}
