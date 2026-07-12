import { Link } from 'react-router-dom';
import heroAsset from '../assets/hero.png';

const platformCapabilities = [
  {
    number: '01',
    title: 'Fleet registry',
    body: 'Keep vehicles, capacity, odometer readings, status, and service readiness in one operating view.',
  },
  {
    number: '02',
    title: 'Driver operations',
    body: 'Track driver availability, safety score, license validity, and trip eligibility before dispatch.',
  },
  {
    number: '03',
    title: 'Trip lifecycle',
    body: 'Move work from draft to dispatched, completed, or cancelled with resource status kept in sync.',
  },
  {
    number: '04',
    title: 'Maintenance control',
    body: 'Log issues, active repairs, closed maintenance, and vehicle readiness without losing history.',
  },
  {
    number: '05',
    title: 'Fuel and expense tracking',
    body: 'Capture fuel logs, vehicle expenses, trip cost context, and finance-ready operating records.',
  },
  {
    number: '06',
    title: 'Operational reporting',
    body: 'Review utilization, trip performance, maintenance load, expense patterns, and daily KPIs.',
  },
];

const workflowSteps = [
  ['01', 'Register', 'Create vehicles and drivers with the operational fields dispatch teams need.'],
  ['02', 'Plan', 'Draft trips with cargo weight, route distance, vehicle, driver, and revenue context.'],
  ['03', 'Dispatch', 'Move eligible drivers and vehicles into active trips with lifecycle status updates.'],
  ['04', 'Review', 'Complete trips, record fuel use, release resources, and report performance.'],
] as const;

const roles = [
  {
    title: 'Fleet Manager',
    text: 'Owns vehicles, drivers, dispatch, trip lifecycle decisions, and operational readiness.',
    modules: ['Dashboard', 'Vehicles', 'Drivers', 'Trips', 'Maintenance'],
  },
  {
    title: 'Driver',
    text: 'Works inside assigned trip flows and keeps trip completion details accurate.',
    modules: ['Trips', 'Current work', 'Completion', 'Status updates'],
  },
  {
    title: 'Safety Officer',
    text: 'Reviews driver safety, maintenance exposure, vehicle condition, and operational risk.',
    modules: ['Drivers', 'Maintenance', 'Reports', 'Read-only fleet view'],
  },
  {
    title: 'Financial Analyst',
    text: 'Tracks fuel logs, expenses, revenue context, and reporting for transport cost control.',
    modules: ['Fuel Logs', 'Expenses', 'Reports', 'Dashboard'],
  },
];

const dashboardMetrics = [
  ['Vehicles ready', '18'],
  ['Active trips', '6'],
  ['Drivers available', '12'],
  ['Maintenance open', '4'],
  ['Fuel logs', '32'],
  ['Monthly expense', '2.8L'],
] as const;

export default function LandingPage() {
  return (
    <main className="landing-page">
      <header className="landing-header">
        <Link to="/" className="landing-brand" aria-label="TransitOps home">
          <span className="landing-brand-mark">TO</span>
          <span>TransitOps</span>
        </Link>
        <nav className="landing-nav" aria-label="Landing page sections">
          <a href="#platform">Platform</a>
          <a href="#workflow">Workflow</a>
          <a href="#roles">Roles</a>
          <a href="#visibility">Visibility</a>
        </nav>
        <Link to="/login" className="landing-login-link">
          Log in
        </Link>
      </header>

      <section className="landing-hero" aria-labelledby="landing-hero-title">
        <div className="landing-hero-copy">
          <p className="landing-section-label">Smart transport operation platform</p>
          <h1 id="landing-hero-title">
            TransitOps keeps every fleet movement visible.
          </h1>
          <p className="landing-hero-text">
            One ERP workspace for fleet managers, drivers, safety officers, and finance teams to run vehicles,
            trips, maintenance, fuel logs, expenses, and reports from the same operational truth.
          </p>
          <div className="landing-hero-actions">
            <Link to="/login" className="button button-primary">
              Launch dashboard
            </Link>
            <a href="#platform" className="button button-secondary">
              Explore platform
            </a>
          </div>
        </div>

        <div className="landing-hero-visual" aria-label="TransitOps dashboard preview">
          <img src={heroAsset} alt="" className="landing-hero-asset" />
          <div className="landing-preview-card">
            <div className="landing-preview-topbar">
              <strong>TransitOps Control</strong>
              <span>Live</span>
            </div>
            <div className="landing-preview-grid">
              {dashboardMetrics.slice(0, 4).map(([label, value]) => (
                <div key={label} className="landing-preview-metric">
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
            <div className="landing-route-panel">
              <div>
                <span>Route</span>
                <strong>Ahmedabad to Surat</strong>
              </div>
              <span className="landing-status-pill">Dispatched</span>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-proof-strip" aria-label="TransitOps proof points">
        {[
          ['Centralized', 'Vehicles, drivers, trips, maintenance, fuel, expenses, and reports share one workspace.'],
          ['Rule-aware', 'Trip creation checks resource availability, driver eligibility, and capacity before work moves.'],
          ['Lifecycle-driven', 'Draft, dispatch, completion, and cancellation states stay visible across the operation.'],
          ['Role-ready', 'Fleet, driver, safety, and finance users see the workflows that match their responsibility.'],
        ].map(([heading, text]) => (
          <article key={heading}>
            <h2>{heading}</h2>
            <p>{text}</p>
          </article>
        ))}
      </section>

      <section className="landing-platform-section" id="platform">
        <div className="landing-section-heading">
          <p className="landing-section-label">Platform</p>
          <h2>Every transport workflow, connected.</h2>
          <p>
            TransitOps turns day-to-day logistics work into structured modules with shared records, clear ownership,
            and status changes that teams can trust.
          </p>
        </div>
        <div className="landing-capability-grid">
          {platformCapabilities.map((capability) => (
            <article className="landing-capability" key={capability.number}>
              <span>{capability.number}</span>
              <h3>{capability.title}</h3>
              <p>{capability.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-workflow-section" id="workflow">
        <p className="landing-section-label">Workflow</p>
        <h2>From planning to completion, every trip has a clean trail.</h2>
        <div className="landing-workflow-steps">
          {workflowSteps.map(([number, title, text]) => (
            <article key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-dashboard-section" id="visibility">
        <div className="landing-section-heading">
          <p className="landing-section-label">Operational visibility</p>
          <h2>A calm dashboard for busy fleet teams.</h2>
          <p>
            See what is available, active, delayed, under maintenance, and financially important before it becomes a
            bottleneck.
          </p>
        </div>
        <div className="landing-dashboard-frame">
          <aside className="landing-dashboard-sidebar">
            {['Dashboard', 'Vehicles', 'Drivers', 'Trips', 'Maintenance', 'Fuel Logs', 'Expenses', 'Reports'].map(
              (item) => (
                <span key={item} className={item === 'Dashboard' ? 'is-active' : ''}>
                  {item}
                </span>
              ),
            )}
          </aside>
          <div className="landing-dashboard-main">
            <div className="landing-dashboard-title">
              <div>
                <span>Today</span>
                <h3>Fleet overview</h3>
              </div>
              <span className="landing-status-pill">Healthy</span>
            </div>
            <div className="landing-dashboard-metrics">
              {dashboardMetrics.map(([label, value]) => (
                <article key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </article>
              ))}
            </div>
            <div className="landing-activity-panel">
              <h3>Recent activity</h3>
              <p>Trip #42 dispatched with Truck GJ01AB1234 and driver Amit Patel.</p>
              <p>Brake inspection opened for vehicle Eicher Pro 3015.</p>
              <p>Fuel log added after completed Ahmedabad local delivery.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-roles-section" id="roles">
        <div className="landing-section-heading">
          <p className="landing-section-label">Role-based operation</p>
          <h2>The right view for every transport responsibility.</h2>
          <p>
            The existing ERP roles stay intact. The landing page simply introduces how those roles work inside the
            product.
          </p>
        </div>
        <div className="landing-role-grid">
          {roles.map((role) => (
            <article className="landing-role-card" key={role.title}>
              <h3>{role.title}</h3>
              <p>{role.text}</p>
              <ul>
                {role.modules.map((moduleName) => (
                  <li key={moduleName}>{moduleName}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-final-section">
        <p className="landing-section-label">Start with clarity</p>
        <h2>Run transport operations from one shared system.</h2>
        <p>
          Sign in to manage fleet records, dispatch trips, close maintenance, record fuel and expenses, and review
          operational reports.
        </p>
        <Link to="/login" className="button button-primary">
          Go to login
        </Link>
      </section>

      <footer className="landing-footer">
        <div>
          <strong>TransitOps</strong>
          <p>Smart transport operations platform for fleet visibility, lifecycle control, and reporting.</p>
        </div>
        <p>Built for fleet managers, drivers, safety officers, and finance teams.</p>
      </footer>
    </main>
  );
}
