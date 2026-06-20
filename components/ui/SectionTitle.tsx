import React from "react";
import {
  colors,
  fonts,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  spacing,
} from "@/lib/design/tokens";

export interface SectionTitleProps {
  /** Mono eyebrow above the title. Carries the violet tick. */
  kicker?: string;
  title: string;
  /** Supporting line below the title. */
  note?: string;
}

export function SectionTitle({ kicker, title, note }: SectionTitleProps) {
  return (
    <div style={{ marginBottom: spacing[4] }}>
      {kicker && (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            fontFamily: fonts.mono,
            fontSize: fontSize.label,
            fontWeight: fontWeight.medium,
            color: colors.violet,
            letterSpacing: letterSpacing.label,
            textTransform: "uppercase",
            marginBottom: spacing[2],
          }}
        >
          {/* Signature tick: a short violet bar standing in for "vector". */}
          <span
            aria-hidden
            style={{
              width: 14,
              height: 2,
              background: colors.violet,
              borderRadius: 2,
              display: "inline-block",
            }}
          />
          {kicker}
        </div>
      )}
      <h2
        style={{
          fontFamily: fonts.display,
          fontWeight: fontWeight.bold,
          fontSize: fontSize.title,
          lineHeight: lineHeight.tight,
          letterSpacing: letterSpacing.display,
          margin: 0,
          color: colors.ink,
        }}
      >
        {title}
      </h2>
      {note && (
        <p
          style={{
            fontFamily: fonts.body,
            color: colors.muted,
            margin: `${spacing[2]}px 0 0`,
            fontSize: fontSize.body,
          }}
        >
          {note}
        </p>
      )}
    </div>
  );
}

export default SectionTitle;
