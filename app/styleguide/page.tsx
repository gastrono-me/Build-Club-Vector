"use client";

import React, { useState } from "react";
import {
  Plus,
  Check,
  Search,
  Clock,
  MapPin,
  Send,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Avatar } from "@/components/shell/Avatar";
import { colors, fonts, fontSize, fontWeight, spacing, letterSpacing } from "@/lib/design/tokens";

/**
 * Temporary design-system styleguide. Renders every primitive in its variants.
 * Deleted in a later phase.
 */
export default function StyleguidePage() {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState<Record<string, boolean>>({ RAG: true });

  const toggle = (k: string) => setFilters((f) => ({ ...f, [k]: !f[k] }));

  return (
    <main
      style={{
        maxWidth: 560,
        margin: "0 auto",
        padding: spacing[6],
        display: "flex",
        flexDirection: "column",
        gap: spacing[10],
      }}
    >
      {/* Masthead — sets the instrument register */}
      <header>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: spacing[3],
            marginBottom: spacing[3],
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: colors.ink,
              color: colors.onDark,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: fonts.display,
              fontWeight: fontWeight.bold,
            }}
          >
            V
          </div>
          <div>
            <div
              style={{
                fontFamily: fonts.display,
                fontWeight: fontWeight.bold,
                fontSize: 18,
                lineHeight: 1,
              }}
            >
              Vector
            </div>
            <div
              style={{
                fontFamily: fonts.mono,
                fontSize: 10,
                color: colors.muted,
                marginTop: 3,
                letterSpacing: letterSpacing.label,
                textTransform: "uppercase",
              }}
            >
              AABW · Ho Chi Minh City · Design System
            </div>
          </div>
        </div>
        <p style={{ color: colors.muted, fontSize: fontSize.body }}>
          Field instrument on warm paper. Every primitive, every variant.
        </p>
      </header>

      {/* Type scale */}
      <section>
        <SectionTitle
          kicker="Typography"
          title="Type scale"
          note="Space Grotesk display, Inter body, JetBrains Mono for data."
        />
        <div style={{ display: "flex", flexDirection: "column", gap: spacing[3] }}>
          <div style={{ fontFamily: fonts.display, fontSize: fontSize.display, fontWeight: 700, letterSpacing: letterSpacing.display, lineHeight: 1.05 }}>
            Happening now
          </div>
          <div style={{ fontFamily: fonts.display, fontSize: fontSize.title, fontWeight: 700 }}>
            Up next at the venue
          </div>
          <div style={{ fontFamily: fonts.display, fontSize: fontSize.heading, fontWeight: 600 }}>
            Vector Search & RAG in an Hour
          </div>
          <div style={{ fontFamily: fonts.body, fontSize: fontSize.body, color: colors.ink }}>
            Body copy in Inter. Stand up retrieval over your own docs and ship before lunch.
          </div>
          <div style={{ fontFamily: fonts.mono, fontSize: fontSize.label, color: colors.muted, letterSpacing: letterSpacing.label, textTransform: "uppercase" }}>
            13:30–15:00 · GEM Center · District 1
          </div>
        </div>
      </section>

      {/* Color */}
      <section>
        <SectionTitle kicker="Palette" title="Color tokens" note="One accent per surface. Color carries meaning." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))", gap: spacing[3] }}>
          {(
            [
              ["ink", colors.ink],
              ["surface", colors.surface],
              ["violet", colors.violet],
              ["live", colors.live],
              ["go", colors.go],
              ["muted", colors.muted],
            ] as const
          ).map(([label, hex]) => (
            <div key={label}>
              <div
                style={{
                  height: 52,
                  borderRadius: 12,
                  background: hex,
                  border: `1px solid ${colors.line}`,
                }}
              />
              <div style={{ fontFamily: fonts.mono, fontSize: 11, marginTop: 6, color: colors.ink }}>{label}</div>
              <div style={{ fontFamily: fonts.mono, fontSize: 10, color: colors.mutedSoft }}>{hex}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Buttons */}
      <section>
        <SectionTitle kicker="Action" title="Buttons" note="Five variants, two sizes." />
        <div style={{ display: "flex", flexWrap: "wrap", gap: spacing[2], marginBottom: spacing[3] }}>
          <Button variant="primary">Add to schedule</Button>
          <Button variant="accent">Connect</Button>
          <Button variant="secondary">Message</Button>
          <Button variant="ghost">Skip</Button>
          <Button variant="danger">Cancel</Button>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: spacing[2], marginBottom: spacing[3] }}>
          <Button variant="primary" size="sm" icon={<Plus size={15} />}>
            Add
          </Button>
          <Button variant="accent" size="sm" icon={<Send size={14} />}>
            Send
          </Button>
          <Button variant="primary" disabled>
            Disabled
          </Button>
        </div>
        <Button variant="primary" full icon={<Check size={16} />}>
          Confirm catchup
        </Button>
      </section>

      {/* Tags */}
      <section>
        <SectionTitle kicker="Metadata" title="Tags" note="Mono pills. Toggle for filters." />
        <div style={{ display: "flex", flexWrap: "wrap", gap: spacing[2], marginBottom: spacing[3] }}>
          <Tag tone="ink">Backend</Tag>
          <Tag tone="violet">RAG</Tag>
          <Tag tone="live">Live</Tag>
          <Tag tone="go">Confirmed</Tag>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: spacing[2] }}>
          {["RAG", "Agents", "Data", "Product"].map((t) => (
            <Tag key={t} active={!!filters[t]} onClick={() => toggle(t)}>
              {t}
            </Tag>
          ))}
        </div>
      </section>

      {/* Cards — the signature spine */}
      <section>
        <SectionTitle kicker="Surface" title="Cards" note="Left spine colored by type. The signature move." />
        <div style={{ display: "flex", flexDirection: "column", gap: spacing[3] }}>
          <Card spine="violet">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
              <div style={{ minWidth: 0 }}>
                <span style={{ fontFamily: fonts.mono, fontSize: 10, color: colors.violet, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  Workshop
                </span>
                <div style={{ fontFamily: fonts.display, fontWeight: 600, fontSize: 16, marginTop: 4 }}>
                  Vector Search & RAG in an Hour
                </div>
                <div style={{ fontSize: 12.5, color: colors.muted, marginTop: 2 }}>PineCone</div>
              </div>
              <Button variant="secondary" size="sm" icon={<Plus size={15} />} aria-label="Add" />
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 12, alignItems: "center" }}>
              <span style={{ fontFamily: fonts.mono, fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}>
                <Clock size={13} color={colors.mutedSoft} /> 13:30–15:00
              </span>
              <span style={{ fontSize: 12.5, display: "flex", alignItems: "center", gap: 5 }}>
                <MapPin size={13} color={colors.mutedSoft} /> GEM Center
              </span>
              <Tag tone="violet">RAG</Tag>
            </div>
          </Card>

          <Card spine="live">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span className="vector-pulse-dot" />
              <span style={{ fontFamily: fonts.mono, fontSize: 10, color: colors.live, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Live now
              </span>
              <span style={{ fontFamily: fonts.mono, fontSize: 10, color: colors.live, display: "flex", alignItems: "center", gap: 3 }}>
                <AlertTriangle size={11} /> clashes
              </span>
            </div>
            <div style={{ fontFamily: fonts.display, fontWeight: 600, fontSize: 16 }}>Opening Keynote</div>
          </Card>

          <Card spine="go">
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <Avatar name="Daniel Okoro" size={40} />
              <div>
                <span style={{ fontFamily: fonts.mono, fontSize: 10, color: colors.go, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  1:1 Catchup
                </span>
                <div style={{ fontFamily: fonts.display, fontWeight: 600, fontSize: 16, marginTop: 2 }}>Daniel Okoro</div>
              </div>
            </div>
          </Card>

          <Card>
            <div style={{ fontSize: 14, color: colors.muted }}>Plain card, no spine — neutral container.</div>
          </Card>
        </div>
      </section>

      {/* Inputs */}
      <section>
        <SectionTitle kicker="Entry" title="Inputs" note="Quiet by default, violet on focus." />
        <div style={{ display: "flex", flexDirection: "column", gap: spacing[4] }}>
          <Input placeholder="Search people, sessions, venues…" icon={<Search size={16} />} />
          <Input label="Display name" placeholder="Your name" defaultValue="Jeremy Yee" />
          <Input label="Disabled" placeholder="Read only" disabled />
        </div>
      </section>

      {/* Avatars */}
      <section>
        <SectionTitle kicker="Identity" title="Avatars" note="Squircles. Deterministic fill per name." />
        <div style={{ display: "flex", alignItems: "flex-end", gap: spacing[3] }}>
          <Avatar name="Ada Lovelace" size={28} />
          <Avatar name="Brian Kernighan" size={38} />
          <Avatar name="Grace Hopper" size={48} />
          <Avatar name="Donald Knuth" size={64} />
        </div>
      </section>

      {/* Modal */}
      <section>
        <SectionTitle kicker="Overlay" title="Modal" note="Backdrop, escape to close, scroll lock." />
        <Button variant="accent" onClick={() => setOpen(true)}>
          Open modal
        </Button>
        <Modal open={open} onClose={() => setOpen(false)} title="Schedule a catchup">
          <div style={{ display: "flex", flexDirection: "column", gap: spacing[4] }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <Avatar name="Daniel Okoro" size={44} />
              <div>
                <div style={{ fontFamily: fonts.display, fontWeight: 600, fontSize: 16 }}>Daniel Okoro</div>
                <div style={{ fontSize: 12.5, color: colors.muted }}>ML Engineer · VectorWorks</div>
              </div>
            </div>
            <Input label="When" placeholder="Pick a 15-min slot" />
            <div style={{ display: "flex", gap: spacing[2] }}>
              <Button variant="secondary" full onClick={() => setOpen(false)}>
                Back
              </Button>
              <Button variant="primary" full onClick={() => setOpen(false)}>
                Confirm
              </Button>
            </div>
          </div>
        </Modal>
      </section>

      <style>{`
        .vector-pulse-dot {
          width: 8px; height: 8px; border-radius: 999px;
          background: ${colors.live}; display: inline-block; flex-shrink: 0;
          animation: vector-pulse 1.6s infinite;
        }
      `}</style>
    </main>
  );
}
