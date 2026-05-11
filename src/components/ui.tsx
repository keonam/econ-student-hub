import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes
} from "react";
import { cn } from "@/lib/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
};

const buttonVariants = {
  primary: "bg-ink text-white hover:bg-black",
  secondary: "border border-line bg-white text-ink hover:bg-teal-50",
  ghost: "text-zinc-700 hover:bg-zinc-100",
  danger: "border border-coral-100 bg-coral-50 text-coral-600 hover:bg-coral-100"
};

const buttonSizes = {
  sm: "h-8 px-2.5 text-xs",
  md: "h-10 px-3 text-sm"
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
      {...props}
    />
  );
}

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  variant?: ButtonProps["variant"];
};

export function IconButton({
  label,
  variant = "secondary",
  className,
  ...props
}: IconButtonProps) {
  return (
    <Button
      aria-label={label}
      title={label}
      variant={variant}
      size="sm"
      className={cn("h-8 w-8 px-0", className)}
      {...props}
    />
  );
}

type FieldProps = {
  label: string;
  children: ReactNode;
  className?: string;
};

export function Field({ label, children, className }: FieldProps) {
  return (
    <label className={cn("grid gap-1.5 text-sm font-semibold text-zinc-700", className)}>
      <span>{label}</span>
      {children}
    </label>
  );
}

export function TextInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-ink shadow-sm transition placeholder:text-zinc-400 focus:border-teal-600",
        className
      )}
      {...props}
    />
  );
}

export function TextArea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full resize-y rounded-md border border-line bg-white px-3 py-2 text-sm text-ink shadow-sm transition placeholder:text-zinc-400 focus:border-teal-600",
        className
      )}
      {...props}
    />
  );
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-ink shadow-sm transition focus:border-teal-600",
        className
      )}
      {...props}
    />
  );
}

type BadgeProps = {
  children: ReactNode;
  tone?: "teal" | "gold" | "coral" | "neutral";
};

const badgeTones = {
  teal: "bg-teal-50 text-teal-700 ring-teal-100",
  gold: "bg-gold-50 text-gold-600 ring-gold-100",
  coral: "bg-coral-50 text-coral-600 ring-coral-100",
  neutral: "bg-zinc-100 text-zinc-700 ring-zinc-200"
};

export function Badge({ children, tone = "neutral" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center rounded-md px-2 py-1 text-xs font-semibold ring-1",
        badgeTones[tone]
      )}
    >
      {children}
    </span>
  );
}

type PanelProps = {
  children: ReactNode;
  className?: string;
};

export function Panel({ children, className }: PanelProps) {
  return (
    <section className={cn("rounded-lg border border-line bg-white p-4 shadow-sm", className)}>
      {children}
    </section>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-line bg-white/70 px-4 py-8 text-center text-sm text-zinc-500">
      {children}
    </div>
  );
}

export function SectionHeader({
  title,
  description
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="grid gap-1">
      <h2 className="text-xl font-bold text-ink md:text-2xl">{title}</h2>
      {description ? <p className="text-sm leading-6 text-zinc-600">{description}</p> : null}
    </div>
  );
}
