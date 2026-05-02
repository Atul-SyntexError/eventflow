<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="en">
  <head>
    <%@ include file="../partials/app-head.jspf" %>
  </head>
  <body>
    <a class="skip-link" href="#main-content">Skip to main content</a>
    <button class="shell-overlay" type="button" aria-label="Close navigation" data-nav-close></button>
    <div class="app-shell">
      <%@ include file="../partials/app-sidebar.jspf" %>
      <div class="app-main">
        <%@ include file="../partials/app-topbar.jspf" %>

        <main id="main-content" class="page-container">
          <section id="showcase-overview" class="showcase-hero surface-panel">
            <div class="page-header-copy">
              <p class="page-eyebrow">Phase 1 foundation</p>
              <h1 class="page-title">A clean, modular shell built before feature pages.</h1>
              <p class="page-lead">
                This slice establishes the shared EventFlow look and structure first: reusable tokens,
                consistent components, responsive layout behavior, and early UI placeholders for the
                system's AI-driven features.
              </p>
            </div>

            <div class="showcase-hero-grid">
              <div class="stack-md">
                <div class="button-row">
                  <button type="button" class="button button-primary" data-open-dialog>Open modal pattern</button>
                  <button type="button" class="button button-secondary" data-show-toast>Trigger toast pattern</button>
                  <button type="button" class="button button-ghost">Preview filters</button>
                </div>
                <div class="status-line">
                  <span class="badge badge-success">Design tokens ready</span>
                  <span class="badge badge-info">Shared shell ready</span>
                  <span class="badge badge-warning">AI cards scaffolded</span>
                </div>
              </div>

              <div class="showcase-shell-card card">
                <p class="eyebrow">Shell composition</p>
                <div class="showcase-shell-preview">
                  <div class="showcase-shell-row">
                    <div class="showcase-sidebar-block"></div>
                    <div class="showcase-content-block"></div>
                  </div>
                  <p class="text-muted">Sidebar, top bar, page container, and overlay behavior are defined once and reused by role pages later.</p>
                </div>
              </div>
            </div>
          </section>

          <section id="showcase-tokens" class="showcase-section">
            <div class="showcase-section-head">
              <p class="eyebrow">Design tokens</p>
              <h2 class="showcase-title">Neutral surfaces, one accent, disciplined spacing.</h2>
              <p class="showcase-copy">
                The visual system stays minimal and professional: warm neutral backgrounds, restrained teal accents,
                strong spacing rhythm, and soft elevation instead of loud color or heavy chrome.
              </p>
            </div>

            <div class="showcase-panel-grid">
              <div class="component-panel stack-md">
                <p class="panel-title">Color system</p>
                <div class="showcase-swatch-grid">
                  <div class="showcase-swatch"><div class="swatch-chip" style="background: var(--surface-canvas);"></div><span class="text-muted mono-copy">canvas</span></div>
                  <div class="showcase-swatch"><div class="swatch-chip" style="background: var(--surface-card);"></div><span class="text-muted mono-copy">card</span></div>
                  <div class="showcase-swatch"><div class="swatch-chip" style="background: var(--accent);"></div><span class="text-muted mono-copy">accent</span></div>
                  <div class="showcase-swatch"><div class="swatch-chip" style="background: var(--warning);"></div><span class="text-muted mono-copy">warning</span></div>
                </div>
              </div>

              <div class="component-panel stack-md">
                <p class="panel-title">Typography and spacing</p>
                <div class="showcase-mini-stack">
                  <p class="page-eyebrow">Display face</p>
                  <p class="text-strong" style="font-family: var(--font-display); font-size: 2rem;">Calm, precise headlines.</p>
                  <p class="text-muted">Primary copy uses a modern sans face. Spacing tokens are used throughout cards, forms, tables, and overlays.</p>
                </div>
              </div>
            </div>
          </section>

          <section id="showcase-components" class="showcase-section stack-lg">
            <div class="showcase-section-head">
              <p class="eyebrow">Shared components</p>
              <h2 class="showcase-title">Build once, reuse across Admin, Organizer, Volunteer, and Student flows.</h2>
            </div>

            <div class="metric-grid">
              <article class="metric-card">
                <span class="metric-label">Health score</span>
                <span class="metric-value">84</span>
                <span class="metric-delta">+6 versus previous snapshot</span>
              </article>
              <article class="metric-card">
                <span class="metric-label">Volunteer coverage</span>
                <span class="metric-value">92%</span>
                <span class="text-muted">3 high-skill volunteers still available</span>
              </article>
              <article class="metric-card">
                <span class="metric-label">Live alerts</span>
                <span class="metric-value">2</span>
                <span class="text-muted">One schedule warning, one assignment review</span>
              </article>
              <article class="metric-card">
                <span class="metric-label">Mood trend</span>
                <span class="metric-value">71</span>
                <span class="text-muted">Neutral-to-positive after last check-in wave</span>
              </article>
            </div>

            <div class="section-grid">
              <article class="component-panel span-7 stack-md">
                <div class="split">
                  <div class="stack-sm">
                    <p class="panel-title">Form and action patterns</p>
                    <p class="text-muted">These inputs define the baseline styling for event, task, and user management forms.</p>
                  </div>
                  <div class="segmented-control" aria-label="Example filter chips">
                    <span class="segmented-pill is-active">All</span>
                    <span class="segmented-pill">Live</span>
                    <span class="segmented-pill">Upcoming</span>
                  </div>
                </div>

                <form class="form-shell" action="#" method="post">
                  <div class="form-grid">
                    <label class="field">
                      <span class="field-label">Event name</span>
                      <input class="control" type="text" value="City Innovation Summit" />
                    </label>
                    <label class="field">
                      <span class="field-label">Expected attendance</span>
                      <input class="control" type="number" value="240" />
                    </label>
                    <label class="field">
                      <span class="field-label">Category</span>
                      <select class="select-control">
                        <option selected>Technology</option>
                        <option>Community</option>
                        <option>Education</option>
                      </select>
                    </label>
                    <label class="field">
                      <span class="field-label">Risk posture</span>
                      <input class="control" type="text" value="Moderate review needed" aria-describedby="risk-hint" />
                      <span id="risk-hint" class="field-hint">This field becomes read-only when backed by the risk prediction service.</span>
                    </label>
                  </div>

                  <label class="field">
                    <span class="field-label">Operational notes</span>
                    <textarea class="textarea-control">Reserve two backup volunteers and keep the student check-in desk open 15 minutes longer if registration spikes.</textarea>
                    <span class="field-success">Autosave-ready copy block pattern</span>
                  </label>

                  <label class="checkbox-line">
                    <input type="checkbox" checked />
                    <span>Notify volunteers immediately when schedule adjustments are approved.</span>
                  </label>
                </form>
              </article>

              <article class="table-shell span-5">
                <div class="table-toolbar">
                  <div class="stack-sm">
                    <p class="panel-title">Shared table pattern</p>
                    <p class="text-muted">Role pages reuse the same data table foundation with badges, filters, and action slots.</p>
                  </div>
                  <span class="badge badge-neutral">Paged</span>
                </div>
                <div class="table-scroll-shell">
                  <table class="data-table">
                    <thead>
                      <tr>
                        <th>Task</th>
                        <th>Status</th>
                        <th>Owner</th>
                        <th>Deadline</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Main hall setup</td>
                        <td><span class="badge badge-info">Assigned</span></td>
                        <td>Alex R.</td>
                        <td>09:30</td>
                      </tr>
                      <tr>
                        <td>Speaker check-in desk</td>
                        <td><span class="badge badge-warning">Blocked</span></td>
                        <td>Priya S.</td>
                        <td>10:10</td>
                      </tr>
                      <tr>
                        <td>Student registration lane</td>
                        <td><span class="badge badge-success">In progress</span></td>
                        <td>Jaden T.</td>
                        <td>10:45</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </article>
            </div>
          </section>

          <section id="showcase-ai" class="showcase-section stack-lg">
            <div class="showcase-section-head">
              <p class="eyebrow">AI-facing surfaces</p>
              <h2 class="showcase-title">The frontend foundation already reserves space for the intelligent parts of EventFlow.</h2>
              <p class="showcase-copy">
                These are UI placeholders for the services already captured in the architectural plan: health scoring,
                risk prediction, smart volunteer assignment, recommendations, and schedule adjustment support.
              </p>
            </div>

            <div class="ai-grid">
              <article class="card stack-md">
                <div class="split">
                  <p class="panel-title">Event health snapshot</p>
                  <span class="badge badge-success">Live</span>
                </div>
                <div class="signal-strip">
                  <span class="badge badge-neutral">Attendance 0.81</span>
                  <span class="badge badge-info">Engagement 0.74</span>
                  <span class="badge badge-success">Volunteer efficiency 0.88</span>
                </div>
                <p class="text-muted">This card maps to the future `EventHealthSnapshotDto` contract.</p>
              </article>

              <article class="card stack-md">
                <div class="split">
                  <p class="panel-title">Risk prediction panel</p>
                  <span class="badge badge-warning">Medium</span>
                </div>
                <div class="alert alert-warning">
                  <strong>Volunteer shortage risk</strong>
                  <span>Two critical tasks share the same skill requirement between 10:00 and 10:30.</span>
                </div>
                <p class="text-muted">This panel aligns with `RiskPredictionDto` and later backend scoring rules.</p>
              </article>

              <article class="recommendation-card">
                <span class="eyebrow">Student recommendation</span>
                <span class="recommendation-score">0.87</span>
                <p class="text-strong"><strong>Innovation workshop is a strong match.</strong></p>
                <div class="badge-row">
                  <span class="badge badge-info">Previous interest</span>
                  <span class="badge badge-neutral">Morning slot</span>
                  <span class="badge badge-success">Seats available</span>
                </div>
              </article>
            </div>
          </section>

          <section id="showcase-states" class="showcase-section stack-lg">
            <div class="showcase-section-head">
              <p class="eyebrow">States and resilience</p>
              <h2 class="showcase-title">Loading, empty, notifications, and recovery patterns are part of the baseline.</h2>
            </div>

            <div class="section-grid">
              <article class="span-4 stack-md">
                <div class="alert alert-info">
                  <strong>Notification pattern</strong>
                  <span>Event updates, task assignments, and schedule changes use the same surface and severity system.</span>
                </div>
                <div class="notification-card stack-sm">
                  <p class="panel-title">Latest update</p>
                  <p class="text-strong"><strong>Schedule revision proposed for Hall B setup.</strong></p>
                  <p class="notification-meta">2 minutes ago · organizer-visible · email triggered</p>
                </div>
              </article>

              <article class="span-4 empty-state">
                <span class="empty-mark">0</span>
                <p class="panel-title">Empty state</p>
                <p class="text-muted">No unresolved risks for this event. The same component can carry action text when intervention is needed.</p>
                <button type="button" class="button button-secondary">Review backup plan</button>
              </article>

              <article class="span-4 activity-feed stack-md">
                <p class="panel-title">Skeleton and activity feed</p>
                <div class="skeleton"></div>
                <div class="skeleton skeleton-sm"></div>
                <div class="skeleton skeleton-lg"></div>
              </article>

              <article class="span-6 timeline stack-md">
                <p class="panel-title">Timeline pattern</p>
                <ul class="timeline-list">
                  <li class="timeline-item">
                    <strong>09:15 - Check-in desks open</strong>
                    <p class="timeline-meta">Student flow event with live occupancy updates</p>
                  </li>
                  <li class="timeline-item">
                    <strong>10:00 - Main stage starts</strong>
                    <p class="timeline-meta">AI schedule adjustment suggestion will appear here if delays propagate.</p>
                  </li>
                </ul>
              </article>

              <article class="span-6 activity-feed stack-md">
                <p class="panel-title">Activity feed pattern</p>
                <ul class="activity-list">
                  <li class="activity-item">
                    <strong>Volunteer reassigned</strong>
                    <p class="activity-meta">Skill-fit score improved from 0.71 to 0.89</p>
                  </li>
                  <li class="activity-item">
                    <strong>Mood signal updated</strong>
                    <p class="activity-meta">Negative sentiment dropped after the room change notice</p>
                  </li>
                </ul>
              </article>
            </div>
          </section>
        </main>
      </div>
    </div>

    <div class="dialog" data-demo-dialog hidden>
      <div class="dialog-card" role="dialog" aria-modal="true" aria-labelledby="demo-dialog-title" tabindex="-1" data-dialog-panel>
        <div class="stack-sm">
          <p class="eyebrow">Modal pattern</p>
          <h2 id="demo-dialog-title" class="panel-title">Shared confirmation and preview dialogs live here.</h2>
          <p class="text-muted">
            Future task assignment, delete confirmation, and schedule adjustment approvals will reuse this
            container instead of each page inventing a separate interaction model.
          </p>
        </div>
        <div class="dialog-actions">
          <button type="button" class="button button-ghost" data-close-dialog data-dialog-initial-focus>Close</button>
          <button type="button" class="button button-primary" data-close-dialog>Looks good</button>
        </div>
      </div>
    </div>

    <div class="toast-stack" data-toast-stack aria-live="polite" aria-atomic="true"></div>

    <script src="${pageContext.request.contextPath}/assets/js/components/shell.js"></script>
    <script src="${pageContext.request.contextPath}/assets/js/pages/design-system-showcase.js"></script>
  </body>
</html>