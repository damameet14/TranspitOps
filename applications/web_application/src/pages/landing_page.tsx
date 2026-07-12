import { Link } from 'react-router-dom';
import PageTransition from '../components/motion/PageTransition';
import ScrollProgress from '../components/motion/ScrollProgress';
import TextReveal from '../components/motion/TextReveal';
import RouteLineAnimation from '../components/motion/RouteLineAnimation';
import MagneticElement from '../components/motion/MagneticElement';
import ClickBurst from '../components/motion/ClickBurst';
import ThreeDCarousel from '../components/motion/ThreeDCarousel';
import HorizontalStory from '../components/motion/HorizontalStory';
import VerticalColumnStory from '../components/motion/VerticalColumnStory';
import ImmersiveZoom from '../components/motion/ImmersiveZoom';
import PageTurnSequence from '../components/motion/PageTurnSequence';
import TransitNetworkCanvas from '../components/webgl/TransitNetworkCanvas';
import LottieIllustration from '../components/motion/LottieIllustration';
import TextScramble from '../components/motion/TextScramble';
import PixelHover from '../components/motion/PixelHover';
import { useEffect } from 'react';
import { initSmoothScroll, destroySmoothScroll } from '../animation/scrollManager';

export default function LandingPage() {
  useEffect(() => {
    initSmoothScroll();
    return () => {
      destroySmoothScroll();
    };
  }, []);

  return (
    <PageTransition>
      <ScrollProgress />
      
      {/* 1. HERO SECTION */}
      <header
        style={{
          borderBottom: '1px solid var(--border)',
          minHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 'var(--space-8) var(--space-6)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <span style={{ fontSize: 'var(--font-size-h3)', fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.05em' }}>
            TransitOps
          </span>
          <Link to="/login" style={{ color: 'var(--text-primary)', fontSize: 'var(--font-size-small)', fontWeight: 500 }}>
            Sign In →
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-12)', alignItems: 'center', margin: 'var(--space-10) 0' }}>
          <div>
            <span style={{ fontSize: 'var(--font-size-caption)', color: 'var(--accent)', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.06em' }}>
              Next-Gen Fleet Control
            </span>
            <TextReveal
              tag="h1"
              pattern="line"
              text={"One system.\nEvery asset.\nClear operations."}
              className="hero-headline"
              style={{ fontSize: '42px', fontWeight: 600, margin: 'var(--space-4) 0', lineHeight: 1.15 }}
            />
            <p className="text-secondary" style={{ fontSize: 'var(--font-size-body)', marginBottom: 'var(--space-6)', maxWidth: '420px', lineHeight: 1.6 }}>
              A high-precision operating system tracking logistics flow, maintenance logs, and personnel handovers.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <MagneticElement>
                <ClickBurst>
                  <Link to="/login" className="button button-primary" style={{ padding: 'var(--space-3) var(--space-6)' }}>
                    Launch Dashboard
                  </Link>
                </ClickBurst>
              </MagneticElement>
              <Link to="/login" className="button button-secondary" style={{ padding: 'var(--space-3) var(--space-6)' }}>
                System Status
              </Link>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <RouteLineAnimation />
            <div style={{ marginTop: 'var(--space-6)', fontSize: 'var(--font-size-caption)', color: 'var(--text-muted)' }}>
              <TextScramble text="Route synchronization: ACTIVE" />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <span style={{ fontSize: 'var(--font-size-caption)', color: 'var(--text-secondary)' }}>
            Scroll to discover the system ↓
          </span>
        </div>
      </header>

      {/* 2. PINNED LIFECYCLE STORYTELLING */}
      <section style={{ borderBottom: '1px solid var(--border)', padding: 'var(--space-12) 0' }}>
        <PageTurnSequence />
      </section>

      {/* 3. PLATFORM CAPABILITIES (HORIZONTAL SCROLL) */}
      <section style={{ borderBottom: '1px solid var(--border)' }}>
        <HorizontalStory />
      </section>

      {/* 4. OPERATIONAL DETAILS CAROUSEL */}
      <section style={{ borderBottom: '1px solid var(--border)', padding: 'var(--space-12) var(--space-6)', background: 'var(--background-page)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', marginBottom: 'var(--space-10)' }}>
          <span className="status-badge status-badge-available" style={{ marginBottom: 'var(--space-2)' }}>System Modules</span>
          <h2 style={{ fontSize: 'var(--font-size-h1)', fontWeight: 600 }}>Operational Sub-systems</h2>
          <p className="text-secondary" style={{ marginTop: 'var(--space-2)' }}>
            Manage resources, audits, and compliance schedules inside the same database schema.
          </p>
        </div>
        <ThreeDCarousel />
      </section>

      {/* 5. ROLE PREVIEWS */}
      <section style={{ borderBottom: '1px solid var(--border)', padding: 'var(--space-12) var(--space-6)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', marginBottom: 'var(--space-10)' }}>
          <h2 style={{ fontSize: 'var(--font-size-h1)', fontWeight: 600 }}>Access Points</h2>
          <p className="text-secondary" style={{ marginTop: 'var(--space-2)' }}>
            Select a role to preview interface scopes.
          </p>
        </div>
        <VerticalColumnStory />
      </section>

      {/* 6. IMMERSIVE PREVIEW ZOOM */}
      <section style={{ borderBottom: '1px solid var(--border)' }}>
        <ImmersiveZoom />
      </section>

      {/* 7. VECTOR ILLUSTRATION FAMILY */}
      <section style={{ borderBottom: '1px solid var(--border)', padding: 'var(--space-12) var(--space-6)', background: 'var(--background-surface)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-10)', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: 'var(--font-size-h1)', fontWeight: 600, color: 'var(--accent)' }}>System Integrity</h2>
            <p className="text-secondary" style={{ marginTop: 'var(--space-4)', lineHeight: 1.6 }}>
              A robust, unified lifecycle system that connects hardware assets to compliance checklists. Avoid discrepancies through cryptographically signed audits.
            </p>
            <div style={{ marginTop: 'var(--space-6)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <PixelHover label="Asset Registry">
                <div style={{ fontWeight: 600 }}>TO-REGISTRY</div>
                <div style={{ fontSize: 'var(--font-size-caption)', color: 'var(--text-secondary)', marginTop: '4px' }}>Immutable ledger entry</div>
              </PixelHover>
              <PixelHover label="Allocation Flow">
                <div style={{ fontWeight: 600 }}>TO-FLOW</div>
                <div style={{ fontSize: 'var(--font-size-caption)', color: 'var(--text-secondary)', marginTop: '4px' }}>Handover custody state</div>
              </PixelHover>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <LottieIllustration />
          </div>
        </div>
      </section>

      {/* 8. WebGL OPERATIONAL NETWORK FOOTER */}
      <footer
        style={{
          background: 'var(--background-page)',
          padding: 'var(--space-8) var(--space-6)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Main Card Container */}
        <div
          style={{
            background: '#141414',
            border: '2px solid #FF4630',
            borderRadius: 'var(--radius-card)',
            padding: 'var(--space-8) var(--space-8) var(--space-4) var(--space-8)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
            minHeight: '520px',
            boxSizing: 'border-box',
          }}
        >
          {/* Canvas overlay inside the card */}
          <TransitNetworkCanvas />

          {/* Top Row: Logo & Columns */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-8)', zIndex: 1, pointerEvents: 'auto' }}>
            {/* Logo */}
            <div>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 8L6 16L12 24" stroke="#FF4630" strokeWidth="3" strokeLinecap="square" />
                <path d="M20 8L26 16L20 24" stroke="#FF4630" strokeWidth="3" strokeLinecap="square" />
              </svg>
            </div>

            {/* Links Columns Container */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '64px' }}>
              {/* Platform */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <h4 style={{ color: '#FF4630', fontSize: 'var(--font-size-body)', fontWeight: 600, letterSpacing: '0.05em', margin: '0 0 var(--space-2) 0', fontFamily: 'var(--font-family)' }}>PLATFORM</h4>
                <Link to="/login" style={{ color: '#FF4630', textDecoration: 'none', fontSize: 'var(--font-size-small)', fontFamily: 'monospace' }}>↳ LAUNCH LEDGER</Link>
                <Link to="/login" style={{ color: '#FF4630', textDecoration: 'none', fontSize: 'var(--font-size-small)', fontFamily: 'monospace' }}>↳ TELEMETRY STREAM</Link>
                <Link to="/login" style={{ color: '#FF4630', textDecoration: 'none', fontSize: 'var(--font-size-small)', fontFamily: 'monospace' }}>↳ CONTROL BOARD</Link>
              </div>

              {/* Solutions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <h4 style={{ color: '#FF4630', fontSize: 'var(--font-size-body)', fontWeight: 600, letterSpacing: '0.05em', margin: '0 0 var(--space-2) 0', fontFamily: 'var(--font-family)' }}>SOLUTIONS⁴</h4>
                <span style={{ color: '#FF4630', fontSize: 'var(--font-size-small)', fontFamily: 'monospace' }}>↳ ROUTING ENGINE</span>
                <span style={{ color: '#FF4630', fontSize: 'var(--font-size-small)', fontFamily: 'monospace' }}>↳ ASSET TELEMETRY</span>
                <span style={{ color: '#FF4630', fontSize: 'var(--font-size-small)', fontFamily: 'monospace' }}>↳ LEDGER AUDIT</span>
                <span style={{ color: '#FF4630', fontSize: 'var(--font-size-small)', fontFamily: 'monospace' }}>↳ DISPATCH AUTO</span>
              </div>

              {/* About */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <h4 style={{ color: '#FF4630', fontSize: 'var(--font-size-body)', fontWeight: 600, letterSpacing: '0.05em', margin: '0 0 var(--space-2) 0', fontFamily: 'var(--font-family)' }}>ABOUT²</h4>
                <Link to="/login" style={{ color: '#FF4630', textDecoration: 'none', fontSize: 'var(--font-size-small)', fontFamily: 'monospace' }}>↳ COMPANY</Link>
                <Link to="/login" style={{ color: '#FF4630', textDecoration: 'none', fontSize: 'var(--font-size-small)', fontFamily: 'monospace' }}>↳ CAREERS</Link>
                <Link to="/login" style={{ color: '#FF4630', textDecoration: 'none', fontSize: 'var(--font-size-small)', fontFamily: 'monospace' }}>INSIGHTS</Link>
                <Link to="/login" style={{ color: '#FF4630', textDecoration: 'none', fontSize: 'var(--font-size-small)', fontFamily: 'monospace' }}>CONTACT</Link>
              </div>
            </div>
          </div>

          {/* Middle Row: Empty / Flag / Address */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-6)', marginTop: 'var(--space-8)', zIndex: 1, pointerEvents: 'auto' }}>
            <div style={{ flex: 1, minWidth: '120px' }}></div>
            <div style={{ flex: 1, minWidth: '180px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)' }}>
              <svg width="28" height="18" viewBox="0 0 28 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="28" height="6" fill="#FF4630" />
                <rect y="6" width="28" height="6" fill="none" stroke="#FF4630" strokeWidth="1" />
                <circle cx="14" cy="9" r="1.8" fill="none" stroke="#FF4630" strokeWidth="1" />
                <rect y="12" width="28" height="6" fill="#FF4630" />
              </svg>
              <div style={{ color: '#FF4630', fontSize: 'var(--font-size-caption)', fontFamily: 'monospace', letterSpacing: '1px', textAlign: 'center', lineHeight: 1.4 }}>
                FORGED IN INDIA.<br />FOR THE GRID.
              </div>
            </div>
            <div style={{ flex: 1, minWidth: '200px', display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ color: '#FF4630', fontSize: 'var(--font-size-caption)', fontFamily: 'monospace', textAlign: 'right', letterSpacing: '1px', lineHeight: 1.4 }}>
                TRANSITOPS HQ<br />
                1100 ASHRAM ROAD,<br />
                STE 2100<br />
                AHMEDABAD, GJ 380009
              </div>
            </div>
          </div>

          {/* Big Brand Text */}
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 'var(--space-8)', zIndex: 1, pointerEvents: 'none', userSelect: 'none' }}>
            <h1 style={{
              fontSize: 'clamp(48px, 14vw, 180px)',
              fontWeight: 900,
              color: '#FF4630',
              letterSpacing: '-0.06em',
              lineHeight: 0.8,
              margin: '0 0 -8px 0',
              fontFamily: 'var(--font-family)',
              textTransform: 'uppercase',
            }}>
              TRANSITOPS
            </h1>
          </div>

          {/* Bottom metadata */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 'var(--space-4)',
            fontSize: 'var(--font-size-caption)',
            color: '#FF4630',
            fontFamily: 'monospace',
            letterSpacing: '1px',
            borderTop: '1px solid #FF4630',
            paddingTop: 'var(--space-4)',
            marginTop: 'var(--space-6)',
            zIndex: 1,
            pointerEvents: 'auto',
          }}>
            <span>©2026 TRANSITOPS, INC.</span>
            <div style={{ display: 'flex', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
              <Link to="/login" style={{ color: 'inherit', textDecoration: 'none' }}>LICENSE AGREEMENT</Link>
              <Link to="/login" style={{ color: 'inherit', textDecoration: 'none' }}>PRIVACY POLICY</Link>
              <Link to="/login" style={{ color: 'inherit', textDecoration: 'none' }}>TERMS OF USE</Link>
            </div>
          </div>
        </div>
      </footer>
    </PageTransition>
  );
}
