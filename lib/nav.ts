import {
  Zap,
  Compass,
  Users,
  Map,
  Calendar,
  MessageCircle,
  Clock,
  Activity,
  Mic,
  type LucideIcon,
} from "lucide-react"

export interface NavItem {
  label: string
  href: string
  Icon: LucideIcon
}

export const PULSE_ITEMS: NavItem[] = [
  { label: "Now", href: "/", Icon: Zap },
  { label: "Discover", href: "/discover", Icon: Compass },
  { label: "Schedule", href: "/schedule", Icon: Calendar },
  { label: "People", href: "/people", Icon: Users },
  { label: "Maps", href: "/maps", Icon: Map },
  { label: "Ask Clawbie", href: "/clawbie", Icon: MessageCircle },
]

export const LINE_ITEMS: NavItem[] = [
  { label: "Deadline Guardian", href: "/deadline", Icon: Clock },
  { label: "Bottleneck Radar", href: "/radar", Icon: Activity },
  { label: "Pitch Coach", href: "/pitch", Icon: Mic },
]
