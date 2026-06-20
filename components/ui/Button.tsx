"use client";

import React from "react";
import { colors, radii, fonts, fontWeight, motion, shadows } from "@/lib/design/tokens";

export type ButtonVariant =
  | "primary" // ink fill — default high-emphasis action
  | "accent" // violet fill — brand / structural action
  | "secondary" // paper outline — low-emphasis
  | "ghost" // text only
  | "danger"; // live coral — cancel / remove

export type ButtonSize = "sm" | "md";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Optional leading icon (e.g. a lucide node). */
  icon?: React.ReactNode;
  /** Stretch to fill the container width. */
  full?: boolean;
}

const sizeMap: Record<ButtonSize, { padding: string; fontSize: number }> = {
  sm: { padding: "8px 12px", fontSize: 13 },
  md: { padding: "11px 16px", fontSize: 14.5 },
};

function variantStyle(variant: ButtonVariant): React.CSSProperties {
  switch (variant) {
    case "accent":
      return { background: colors.violet, color: colors.onDark, border: "1px solid transparent" };
    case "secondary":
      return { background: colors.panel, color: colors.ink, border: `1px solid ${colors.line}` };
    case "ghost":
      return { background: "transparent", color: colors.ink, border: "1px solid transparent" };
    case "danger":
      return { background: colors.panel, color: colors.live, border: `1px solid ${colors.line}` };
    case "primary":
    default:
      return { background: colors.ink, color: colors.onDark, border: "1px solid transparent" };
  }
}

export function Button({
  variant = "primary",
  size = "md",
  icon,
  full = false,
  children,
  style,
  disabled,
  ...rest
}: ButtonProps) {
  const s = sizeMap[size];
  return (
    <button
      {...rest}
      disabled={disabled}
      data-variant={variant}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
        width: full ? "100%" : undefined,
        padding: s.padding,
        fontFamily: fonts.body,
        fontSize: s.fontSize,
        fontWeight: fontWeight.semibold,
        lineHeight: 1,
        borderRadius: radii.md,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        whiteSpace: "nowrap",
        userSelect: "none",
        transition: `filter ${motion.fast} ${motion.ease}, box-shadow ${motion.fast} ${motion.ease}, transform ${motion.fast} ${motion.ease}`,
        boxShadow: variant === "ghost" ? "none" : shadows.card,
        ...variantStyle(variant),
        ...style,
      }}
      onMouseDown={(e) => {
        if (!disabled) e.currentTarget.style.transform = "translateY(1px)";
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = "";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "";
        if (!disabled) e.currentTarget.style.filter = "";
      }}
      onMouseEnter={(e) => {
        if (!disabled && variant !== "ghost") e.currentTarget.style.filter = "brightness(1.06)";
        if (!disabled && variant === "ghost")
          e.currentTarget.style.background = colors.violetSoft;
      }}
    >
      {icon}
      {children}
    </button>
  );
}

export default Button;
