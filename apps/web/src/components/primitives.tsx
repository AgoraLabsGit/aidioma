import Link from "next/link";
import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactNode,
} from "react";

function classes(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "quiet" | "danger";
};

export function Button({
  className,
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={classes("button", `button-${variant}`, className)}
      type={type}
      {...props}
    />
  );
}

export function ButtonLink({
  children,
  className,
  href,
  variant = "primary",
}: {
  children: ReactNode;
  className?: string;
  href: string;
  variant?: "primary" | "quiet";
}) {
  return (
    <Link
      className={classes("button", `button-${variant}`, className)}
      href={href}
    >
      {children}
    </Link>
  );
}

export function IconButton({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={classes("icon-button", className)}
      type="button"
      {...props}
    />
  );
}

export function Card({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={classes("card", className)} {...props} />;
}

export function Badge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <span className={classes("badge", className)}>{children}</span>;
}

export function Progress({
  label,
  max = 100,
  value,
}: {
  label: string;
  max?: number;
  value: number;
}) {
  return (
    <progress aria-label={label} className="progress" max={max} value={value}>
      {value} of {max}
    </progress>
  );
}

export function SectionHeading({
  action,
  children,
}: {
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="section-heading">
      <h2>{children}</h2>
      {action}
    </div>
  );
}

export function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <Card className="stat-tile">
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </Card>
  );
}

export function EmptyState({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      <p>{children}</p>
    </div>
  );
}

export function SegmentedControl({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <fieldset className="segmented-control">
      <legend className="visually-hidden">{label}</legend>
      {children}
    </fieldset>
  );
}

export function FormField({
  children,
  description,
  descriptionId,
  label,
}: {
  children: ReactNode;
  description: string;
  descriptionId?: string;
  label: string;
}) {
  return (
    <div className="form-field">
      <div className="form-copy">
        <span className="form-label">{label}</span>
        <span className="form-description" id={descriptionId}>
          {description}
        </span>
      </div>
      {children}
    </div>
  );
}

export function ScreenContainer({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={classes("screen-container", className)}>{children}</div>
  );
}
