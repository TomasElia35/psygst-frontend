import React, { useState, useEffect } from 'react';

export default function MaintenanceMode() {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const i = setInterval(() => {
      setDots(p => (p.length >= 3 ? '' : p + '.'));
    }, 500);
    return () => clearInterval(i);
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.particleContainer}>
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            style={{
              ...styles.particle,
              width: Math.random() * 8 + 4,
              height: Math.random() * 8 + 4,
              left: Math.random() * 100 + 'vw',
              top: Math.random() * 100 + 'vh',
              animationDuration: Math.random() * 10 + 10 + 's',
              animationDelay: Math.random() * 5 + 's',
            }}
          />
        ))}
      </div>

      <div style={styles.glowTop} />
      <div style={styles.glowBottom} />

      <div style={styles.card}>
        <div style={styles.logoRow}>
          <span style={styles.logoText}>Psy</span>
          <span style={styles.logoDot}>·</span>
          <span style={styles.logoTextAlt}>Gst</span>
        </div>
        <p style={styles.logoSub}>Gestión Psicológica Integral</p>

        <div style={styles.iconWrap}>
          <HeartbeatIcon />
        </div>

        <div style={styles.badge}>
          <span style={styles.badgeDot} />
          <span>Migrando a PostgreSQL{dots}</span>
        </div>

        <h1 style={styles.title}>Sistema en Mantenimiento</h1>

        <p style={styles.desc}>
          Estamos realizando una actualización crítica migrando nuestra infraestructura a <strong>PostgreSQL en Supabase</strong> para ofrecerte un servicio más rápido y estable.
        </p>

        <div style={styles.divider} />

        <div style={styles.infoGrid}>
          <InfoBlock icon="🔒" label="Zero Data Loss" text="Tu información está completamente respaldada." />
          <InfoBlock icon="⚡" label="Supabase DB" text="Implementando infraestructura de alta disponibilidad." />
          <InfoBlock icon="📋" label="Reintentá luego" text="El acceso se restablecerá automáticamente al finalizar." />
        </div>

        <p style={styles.footer}>
          Gracias por tu paciencia. El equipo de Psy-Gst.
        </p>
      </div>

      <style>{keyframes}</style>
    </div>
  );
}

function InfoBlock({ icon, label, text }) {
  return (
    <div style={styles.infoBlock}>
      <span style={styles.infoIcon}>{icon}</span>
      <div>
        <p style={styles.infoLabel}>{label}</p>
        <p style={styles.infoText}>{text}</p>
      </div>
    </div>
  );
}

function HeartbeatIcon() {
  return (
    <svg
      viewBox="0 0 120 60"
      style={styles.heartbeatSvg}
      aria-label="Heartbeat animation"
    >
      <polyline
        points="0,30 20,30 30,10 40,50 52,20 62,40 70,30 90,30 95,22 100,38 105,30 120,30"
        fill="none"
        stroke="url(#hbGrad)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ animation: 'hbDraw 2.4s ease-in-out infinite' }}
      />
      <defs>
        <linearGradient id="hbGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ── Styles ─────────────────────────────────────────────────── */
const styles = {
  page: {
    minHeight: '100vh',
    width: '100vw',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0A0F1E',
    fontFamily: "'Inter', -apple-system, sans-serif",
    position: 'relative',
    overflow: 'hidden',
  },
  particleContainer: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
  },
  particle: {
    position: 'absolute',
    borderRadius: '50%',
    background: 'rgba(59,130,246,0.35)',
    animation: 'floatUp linear infinite',
  },
  glowTop: {
    position: 'absolute',
    top: '-20%',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '80vw',
    height: '60vw',
    background: 'radial-gradient(ellipse, rgba(59,130,246,0.12) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  glowBottom: {
    position: 'absolute',
    bottom: '-20%',
    right: '-10%',
    width: '60vw',
    height: '60vw',
    background: 'radial-gradient(ellipse, rgba(139,92,246,0.09) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  card: {
    position: 'relative',
    zIndex: 10,
    background: 'rgba(17,24,39,0.85)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(59,130,246,0.2)',
    borderRadius: 20,
    padding: '48px 40px',
    width: '100%',
    maxWidth: 520,
    boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(59,130,246,0.05)',
    textAlign: 'center',
    animation: 'cardIn 0.6s cubic-bezier(0.16,1,0.3,1)',
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    marginBottom: 4,
  },
  logoText: {
    fontSize: 22,
    fontWeight: 800,
    letterSpacing: -0.5,
    background: 'linear-gradient(135deg,#3B82F6,#8B5CF6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  logoDot: {
    fontSize: 22,
    fontWeight: 800,
    color: '#4B5563',
  },
  logoTextAlt: {
    fontSize: 22,
    fontWeight: 800,
    letterSpacing: -0.5,
    background: 'linear-gradient(135deg,#8B5CF6,#EC4899)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  logoSub: {
    fontSize: 11,
    color: '#4B5563',
    letterSpacing: '0.8px',
    textTransform: 'uppercase',
    marginBottom: 28,
  },
  iconWrap: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: 20,
  },
  heartbeatSvg: {
    width: 140,
    height: 70,
    filter: 'drop-shadow(0 0 8px rgba(59,130,246,0.4))',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    background: 'rgba(59,130,246,0.1)',
    border: '1px solid rgba(59,130,246,0.25)',
    borderRadius: 99,
    padding: '5px 14px',
    fontSize: 12,
    fontWeight: 600,
    color: '#60A5FA',
    letterSpacing: '0.3px',
    marginBottom: 20,
  },
  badgeDot: {
    display: 'inline-block',
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: '#3B82F6',
    animation: 'badgePulse 1.4s ease-in-out infinite',
    flexShrink: 0,
  },
  title: {
    fontSize: 26,
    fontWeight: 800,
    color: '#F9FAFB',
    letterSpacing: -0.5,
    margin: '0 0 14px',
    lineHeight: 1.2,
  },
  desc: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 1.7,
    margin: '0 auto 28px',
    maxWidth: 400,
  },
  divider: {
    height: 1,
    background: 'rgba(255,255,255,0.06)',
    margin: '0 0 24px',
  },
  infoGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    textAlign: 'left',
    marginBottom: 28,
  },
  infoBlock: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 10,
    padding: '12px 14px',
  },
  infoIcon: {
    fontSize: 18,
    flexShrink: 0,
    lineHeight: 1.4,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: '#D1D5DB',
    margin: '0 0 2px',
    letterSpacing: '0.2px',
  },
  infoText: {
    fontSize: 12,
    color: '#4B5563',
    margin: 0,
    lineHeight: 1.5,
  },
  footer: {
    fontSize: 12,
    color: '#374151',
    margin: 0,
  },
};

/* ── Keyframes ──────────────────────────────────────────────── */
const keyframes = `
@keyframes floatUp {
  0%   { opacity: 0; transform: translateY(0) scale(1); }
  20%  { opacity: 0.6; }
  80%  { opacity: 0.3; }
  100% { opacity: 0; transform: translateY(-60vh) scale(0.4); }
}
@keyframes badgePulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.4; transform: scale(0.8); }
}
@keyframes cardIn {
  from { opacity: 0; transform: translateY(20px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes hbDraw {
  0%   { stroke-dasharray: 260; stroke-dashoffset: 260; opacity: 0.6; }
  50%  { stroke-dasharray: 260; stroke-dashoffset: 0;   opacity: 1; }
  100% { stroke-dasharray: 260; stroke-dashoffset: -260; opacity: 0.6; }
}
`;
