"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { IconButton } from "./primitives";

export function PrototypeContextHeader({
  backHref,
  backLabel,
  onBack,
  title,
  trailing,
}: {
  backHref?: string;
  backLabel?: string;
  onBack?: () => void;
  title: string;
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
          <h1>{title}</h1>
        </div>
      </div>
      <div className="context-badges">
        {trailing ?? <span className="prototype-tag">Fixture prototype</span>}
      </div>
    </header>
  );
}
