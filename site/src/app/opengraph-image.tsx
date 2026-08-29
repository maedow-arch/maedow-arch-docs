import { ImageResponse } from 'next/og';

export const alt = 'Maedow Arch, standard modulaire et découplé';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: '#0b0a10',
          color: '#ffffff',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Les 4 couches, de la plus large à la plus étroite. */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 48 }}>
          <div style={{ width: 220, height: 14, borderRadius: 7, background: '#8b5cf6' }} />
          <div style={{ width: 165, height: 14, borderRadius: 7, background: '#8b5cf6', opacity: 0.7 }} />
          <div style={{ width: 110, height: 14, borderRadius: 7, background: '#8b5cf6', opacity: 0.45 }} />
          <div style={{ width: 55, height: 14, borderRadius: 7, background: '#8b5cf6', opacity: 0.25 }} />
        </div>

        <div style={{ fontSize: 68, fontWeight: 800, letterSpacing: -2, lineHeight: 1.1 }}>
          Maedow Arch
        </div>
        <div style={{ fontSize: 32, color: '#a8a2b8', marginTop: 20, maxWidth: 900, lineHeight: 1.4 }}>
          Une architecture qui tient dans le temps. Domaine métier isolé,
          infrastructure interchangeable, frontières vérifiées par le linter.
        </div>
        <div style={{ fontSize: 26, color: '#8b5cf6', marginTop: 44, fontFamily: 'monospace' }}>
          npx create-maedow-arch-app
        </div>
      </div>
    ),
    size
  );
}
