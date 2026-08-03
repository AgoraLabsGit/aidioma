"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { IconButton } from "./primitives";

export function PrototypeContextHeader({
  backHref,
  backLabel,
  onBack,
  title,
  titleStyle = "context",
  trailing,
}: {
  backHref?: string;
  backLabel?: string;
  onBack?: () => void;
  title: string;
  titleStyle?: "context" | "screen";
  trailing?: React.ReactNode;
}) {
  return (
    <header className="top-context-bar prototype-context-bar">
      <div className="prototype-context-start">
        {backHref ? (
          <Link aria-label={backLabel ?? "Back"} className="icon-button" href={backHref}>
            <ArrowLeft aria-hidden="true" />
          </Link>
        ) : onBack ? (
          <IconButton aria-label={backLabel ?? "Back"} onClick={onBack}>
            <ArrowLeft aria-hidden="true" />
          </IconButton>
        ) : null}
        <div className="context-title">
          <h1 className={titleStyle === "screen" ? "is-screen-title" : undefined}>{title}</h1>
        </div>
      </div>
      {trailing ? <div className="context-badges">{trailing}</div> : null}
    </header>
  );
}
