export default function HomePage() {
  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: "3rem", lineHeight: 1.6 }}>
      <h1>__PROJECT_NAME__</h1>
      <p>Projet généré avec Maedow Arch.</p>
      <ol>
        <li>
          <code>npm run generate:domain &lt;nom&gt;</code> crée un domaine métier dans <code>src/core/</code>
        </li>
        <li>
          <code>npm run generate:feature &lt;nom&gt;</code> crée une feature dans <code>src/features/</code>
        </li>
        <li>
          <code>npm run lint</code> vérifie les frontières architecturales
        </li>
      </ol>
    </main>
  );
}
