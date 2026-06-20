export default function Home() {
  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "var(--color-surface)",
        color: "var(--color-ink)",
        fontFamily: "var(--font-body)",
      }}
    >
      <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
        Vector — scaffolding
      </h1>
      <p style={{ color: "var(--color-muted)" }}>
        Vector · AABW · Ho Chi Minh City
      </p>
    </main>
  );
}
