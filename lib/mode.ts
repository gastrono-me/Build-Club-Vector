/** Pulse vs Line is derived from the route. Line = build-focus pages. */
export function deriveMode(pathname: string): "pulse" | "line" {
  return pathname === "/deadline" || pathname === "/radar" || pathname === "/pitch"
    ? "line"
    : "pulse"
}
