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
          background: '#141414',
          color: '#EDEDEA',
          minHeight: '50vh',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 'var(--space-10) var(--space-8)',
          overflow: 'hidden'
        }}
      >
        {/* Canvas overlays */}
        <TransitNetworkCanvas />

        {/* Footer contents */}
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-6)', zIndex: 1, pointerEvents: 'auto' }}>
          <div>
            <span style={{ fontSize: 'var(--font-size-h3)', fontWeight: 600, color: '#5b87be' }}>
              TransitOps
            </span>
            <p style={{ color: '#8b8b85', fontSize: 'var(--font-size-small)', marginTop: 'var(--space-2)' }}>
              Swiss-minimal logistics ledger
            </p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-10)' }}>
            <div>
              <h5 style={{ color: '#EDEDEA', fontSize: 'var(--font-size-small)', marginBottom: 'var(--space-3)', fontWeight: 600 }}>Platform</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', fontSize: 'var(--font-size-small)' }}>
                <Link to="/login" style={{ color: '#8b8b85' }}>Launch</Link>
                <Link to="/login" style={{ color: '#8b8b85' }}>Security</Link>
                <Link to="/login" style={{ color: '#8b8b85' }}>Telemetry</Link>
              </div>
            </div>
            <div>
              <h5 style={{ color: '#EDEDEA', fontSize: 'var(--font-size-small)', marginBottom: 'var(--space-3)', fontWeight: 600 }}>Legal</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', fontSize: 'var(--font-size-small)' }}>
                <Link to="/login" style={{ color: '#8b8b85' }}>Privacy</Link>
                <Link to="/login" style={{ color: '#8b8b85' }}>Terms</Link>
                <Link to="/login" style={{ color: '#8b8b85' }}>WCAG AA</Link>
              </div>
            </div>
          </div>
        </div>

        <div style={{ zIndex: 1, pointerEvents: 'auto', margin: 'var(--space-6) 0' }}>
          <TextReveal
            tag="h2"
            pattern="char"
            text="Keep every operation visible."
            className="footer-statement"
            style={{ fontSize: '32px', color: '#5b87be', fontWeight: 600 }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #2a2a28', paddingTop: 'var(--space-4)', zIndex: 1, pointerEvents: 'auto', fontSize: 'var(--font-size-caption)', color: '#5e5e5a' }}>
          <span>© 2026 TransitOps. All rights reserved.</span>
          <MagneticElement>
            <a href="mailto:ops@transitops.io" style={{ color: '#5b87be', fontWeight: 'bold' }}>
              ops@transitops.io →
            </a>
          </MagneticElement>
        </div>
      </footer>
    </PageTransition>
  );
}
