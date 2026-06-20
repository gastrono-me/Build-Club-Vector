"use client"

import React from "react"
import { Linkedin, Github, Twitter, Instagram, ExternalLink } from "lucide-react"
import { Card } from "@/components/ui/Card"
import { Tag } from "@/components/ui/Tag"
import { Button } from "@/components/ui/Button"
import { Avatar } from "@/components/shell/Avatar"
import { matchScore } from "@/lib/match"
import type { Profile } from "@/types/index"
import {
  colors, fonts, fontSize, fontWeight, spacing,
} from "@/lib/design/tokens"

export interface NormalizedPerson {
  id: string
  name: string
  occupation: string
  tags: string[]
  industries: string[]
  looking: string[]
  bio: string
  tagline?: string
  links?: {
    linkedin?: string
    github?: string
    x?: string
    instagram?: string
  }
  handle?: string
  avatar?: string | null
  isReal: boolean
}

interface PersonCardProps {
  person: NormalizedPerson
  me: Profile | null
}

export function PersonCard({ person, me }: PersonCardProps) {
  const meForMatch = me
    ? { tags: me.skills, industries: me.industries, looking: me.looking }
    : null
  const personForMatch = {
    tags: person.tags,
    industries: person.industries,
    looking: person.looking,
  }
  const { shared } = matchScore(meForMatch, personForMatch)

  const socialLinks: { href: string; label: string; icon: React.ReactNode }[] = []

  if (person.links?.linkedin) {
    socialLinks.push({
      href: person.links.linkedin,
      label: "LinkedIn",
      icon: <Linkedin size={14} />,
    })
  }
  if (person.links?.github) {
    socialLinks.push({
      href: person.links.github,
      label: "GitHub",
      icon: <Github size={14} />,
    })
  }
  const xHref = person.links?.x
    ?? (person.handle ? `https://x.com/${person.handle.replace(/^@/, "")}` : undefined)
  if (xHref) {
    socialLinks.push({
      href: xHref,
      label: "X / Twitter",
      icon: <Twitter size={14} />,
    })
  }
  if (person.links?.instagram) {
    socialLinks.push({
      href: person.links.instagram,
      label: "Instagram",
      icon: <Instagram size={14} />,
    })
  }

  return (
    <Card spine={person.isReal ? "violet" : "none"}>
      {/* Top row: avatar + name + occupation */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: spacing[3], marginBottom: spacing[3] }}>
        <Avatar name={person.name} photo={person.avatar} size={44} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: fonts.body,
              fontWeight: fontWeight.bold,
              fontSize: fontSize.heading,
              color: colors.ink,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {person.name}
          </div>
          <div
            style={{
              fontFamily: fonts.body,
              fontSize: fontSize.meta,
              color: colors.muted,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              marginTop: 2,
            }}
          >
            {person.occupation}
          </div>
        </div>
      </div>

      {/* Skill tags */}
      {person.tags.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: spacing[1], marginBottom: spacing[2] }}>
          {person.tags.map(tag => (
            <Tag key={tag} tone="ink">{tag}</Tag>
          ))}
        </div>
      )}

      {/* Looking chips */}
      {person.looking.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: spacing[1], marginBottom: spacing[2] }}>
          {person.looking.map(l => (
            <Tag key={l} tone="go">{l}</Tag>
          ))}
        </div>
      )}

      {/* Shared overlap badge */}
      {shared.length > 0 && (
        <div style={{ marginBottom: spacing[2] }}>
          <Tag tone="violet">{shared.length} shared</Tag>
        </div>
      )}

      {/* Social links */}
      {socialLinks.length > 0 && (
        <div style={{ display: "flex", gap: spacing[2], marginBottom: spacing[3], flexWrap: "wrap" }}>
          {socialLinks.map(({ href, label, icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                color: colors.muted,
                textDecoration: "none",
                fontFamily: fonts.mono,
                fontSize: fontSize.label,
                padding: "4px 6px",
                borderRadius: 6,
                transition: "color 120ms ease",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = colors.violet }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = colors.muted }}
            >
              {icon}
              <ExternalLink size={10} />
            </a>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: "flex", gap: spacing[2] }}>
        <Button variant="accent" size="sm">Connect</Button>
        <Button variant="secondary" size="sm" disabled title="Coming soon">Message</Button>
      </div>
    </Card>
  )
}

export default PersonCard
