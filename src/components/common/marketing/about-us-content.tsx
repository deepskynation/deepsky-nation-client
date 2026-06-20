import { aboutUsContent } from "@/mock/about-us";
import { glassCardClassName } from "@/lib/glass-styles";
import { cn } from "@/lib/utils";

export type AboutUsContentProps = {
  label?: string;
  title?: string;
  paragraphs?: string[];
  className?: string;
  /** Use `h1` on standalone pages; `h2` when embedded in the landing page. */
  headingLevel?: "h1" | "h2";
};

export function AboutUsContent({
  label = aboutUsContent.label,
  title = aboutUsContent.title,
  paragraphs = aboutUsContent.paragraphs,
  className,
  headingLevel = "h1",
}: AboutUsContentProps) {
  const Heading = headingLevel;

  return (
    <div className={className}>
      <header className="mb-8 space-y-1">
        <p className="text-[11px] uppercase tracking-[0.35em] text-black/45">
          {label}
        </p>
        <Heading className="font-serif text-2xl font-normal text-black sm:text-3xl">
          {title}
        </Heading>
      </header>

      <div className={cn(glassCardClassName, "space-y-5 p-6 sm:p-8")}>
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="text-base leading-relaxed text-black/65">
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
}
