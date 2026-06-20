import React from "react";
import { colors, radii, shadows, spacing } from "@/lib/design/tokens";

/** Signature accent: a 4px spine down the card's left edge, colored by meaning. */
export type CardSpine = "violet" | "live" | "go" | "ink" | "none";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Left spine tone. Encodes type/state (violet=structure, live=now, go=confirmed). */
  spine?: CardSpine;
  /** Inner padding; defaults to 16px. */
  padding?: number;
}

const spineColor: Record<Exclude<CardSpine, "none">, string> = {
  violet: colors.violet,
  live: colors.live,
  go: colors.go,
  ink: colors.ink,
};

export function Card({
  spine = "none",
  padding = spacing[4],
  children,
  style,
  ...rest
}: CardProps) {
  const hasSpine = spine !== "none";
  return (
    <div
      {...rest}
      style={{
        position: "relative",
        background: colors.panel,
        border: `1px solid ${spine === "live" ? colors.live : colors.line}`,
        borderRadius: radii.xl,
        padding,
        paddingLeft: hasSpine ? padding + 8 : padding,
        boxShadow: shadows.card,
        overflow: "hidden",
        ...style,
      }}
    >
      {hasSpine && (
        <span
          aria-hidden
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 4,
            background: spineColor[spine],
          }}
        />
      )}
      {children}
    </div>
  );
}

export default Card;
