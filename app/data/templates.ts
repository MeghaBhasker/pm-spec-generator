export interface SpecTemplate {
  id: string
  label: string
  category: string
  icon: string
  productType: string
  primaryUser: string
  sections: string[]
  feature: string
  tag?: string
}

export interface DiagramTemplate {
  id: string
  label: string
  category: string
  icon: string
  diagramType: string
  description: string
}

export interface TranslateTemplate {
  id: string
  label: string
  category: string
  icon: string
  text: string
}

export interface CsvTemplate {
  id: string
  label: string
  category: string
  icon: string
  description: string
  csv: string
}

// ── SPEC TEMPLATES ──────────────────────────────────────────────────────────

export const SPEC_TEMPLATES: SpecTemplate[] = [
  // AUTH & IDENTITY
  {
    id: 'auth-sso',
    label: 'SSO / OAuth login',
    category: 'Auth & Identity',
    icon: '🔐',
    tag: 'Popular',
    productType: 'SaaS dashboard',
    primaryUser: 'enterprise admin',
    sections: ['overview', 'stories', 'functional', 'acceptance', 'edge', 'nonfunctional'],
    feature: 'Add SSO login via SAML 2.0 and OAuth 2.0 so enterprise customers can authenticate using their existing identity provider (Okta, Azure AD, Google Workspace) without creating separate credentials.',
  },
  {
    id: 'auth-mfa',
    label: 'Multi-factor authentication',
    category: 'Auth & Identity',
    icon: '🔑',
    productType: 'SaaS dashboard',
    primaryUser: 'end user',
    sections: ['overview', 'stories', 'functional', 'acceptance', 'edge', 'qa'],
    feature: 'Add multi-factor authentication (TOTP via authenticator app + SMS fallback) to the login flow, with recovery codes and the ability to manage trusted devices.',
  },
  {
    id: 'auth-rbac',
    label: 'Role-based permissions',
    category: 'Auth & Identity',
    icon: '👥',
    productType: 'SaaS dashboard',
    primaryUser: 'admin',
    sections: ['overview', 'stories', 'functional', 'acceptance', 'edge', 'outofscope'],
    feature: 'Implement role-based access control (RBAC) with Admin, Editor, and Viewer roles. Admins manage members and billing. Editors create and modify content. Viewers have read-only access. Role changes take effect immediately.',
  },
  // ONBOARDING
  {
    id: 'onboarding-interactive',
    label: 'Interactive onboarding flow',
    category: 'Onboarding',
    icon: '🚀',
    tag: 'Popular',
    productType: 'Consumer web app',
    primaryUser: 'new user',
    sections: ['overview', 'stories', 'functional', 'acceptance', 'edge', 'metrics'],
    feature: 'Design an interactive onboarding flow for new users — progressive profile setup, contextual tooltips, a checklist of first actions, and a skip option. Track completion rate per step to identify drop-off.',
  },
  {
    id: 'onboarding-api',
    label: 'API developer onboarding',
    category: 'Onboarding',
    icon: '🧑‍💻',
    productType: 'API platform',
    primaryUser: 'API developer',
    sections: ['overview', 'stories', 'functional', 'acceptance', 'edge', 'metrics'],
    feature: 'Redesign the API developer onboarding: interactive playground with live response previews, auto-generated API keys on sign-up, quickstart guides for top 3 use cases, and a progress tracker for trial-to-first-call.',
  },
  // NOTIFICATIONS
  {
    id: 'notifications-prefs',
    label: 'Notification preferences',
    category: 'Notifications',
    icon: '🔔',
    productType: 'Mobile app',
    primaryUser: 'end user',
    sections: ['overview', 'stories', 'functional', 'acceptance', 'edge'],
    feature: 'Build a notification preferences centre where users can control which notifications they receive (push, email, in-app), at what frequency, and for which events. Preferences should sync across devices.',
  },
  {
    id: 'notifications-webhooks',
    label: 'Webhook event system',
    category: 'Notifications',
    icon: '📡',
    productType: 'API platform',
    primaryUser: 'API developer',
    sections: ['overview', 'functional', 'acceptance', 'edge', 'nonfunctional'],
    feature: 'Build a webhook delivery system that notifies customer endpoints on key platform events. Support configurable event subscriptions, retry logic with exponential backoff, delivery logs, and manual re-trigger.',
  },
  // SEARCH & DISCOVERY
  {
    id: 'search-global',
    label: 'Global search',
    category: 'Search & Discovery',
    icon: '🔍',
    tag: 'Popular',
    productType: 'SaaS dashboard',
    primaryUser: 'power user',
    sections: ['overview', 'stories', 'functional', 'acceptance', 'edge', 'nonfunctional'],
    feature: 'Add global search across all entities (projects, users, docs, settings) with keyboard shortcut (⌘K), fuzzy matching, recent searches, and filtered results by type. Results should appear within 200ms.',
  },
  {
    id: 'search-filters',
    label: 'Advanced filters & faceted search',
    category: 'Search & Discovery',
    icon: '🗂',
    productType: 'SaaS dashboard',
    primaryUser: 'analyst / admin',
    sections: ['overview', 'functional', 'acceptance', 'edge'],
    feature: 'Add advanced filtering to the data table: multi-select facets, date range pickers, saved filter presets, shareable filter URLs, and a count of active filters with one-click clear.',
  },
  // PAYMENTS
  {
    id: 'payments-checkout',
    label: 'Checkout & payment flow',
    category: 'Payments',
    icon: '💳',
    tag: 'Popular',
    productType: 'E-commerce',
    primaryUser: 'shopper',
    sections: ['overview', 'stories', 'functional', 'acceptance', 'edge', 'nonfunctional'],
    feature: 'Build a streamlined checkout flow: guest and logged-in paths, credit/debit card + PayPal + Apple Pay, address autofill, order summary, coupon code entry, and a confirmation email with receipt.',
  },
  {
    id: 'payments-subscription',
    label: 'Subscription plan upgrade/downgrade',
    category: 'Payments',
    icon: '🔄',
    productType: 'SaaS dashboard',
    primaryUser: 'account owner',
    sections: ['overview', 'stories', 'functional', 'acceptance', 'edge', 'outofscope'],
    feature: 'Allow users to upgrade or downgrade their subscription plan in-app. Handle prorated billing, immediate vs end-of-cycle changes, seat limit enforcement on downgrade, and cancellation with retention offer.',
  },
  // ANALYTICS & OBSERVABILITY
  {
    id: 'analytics-dashboard',
    label: 'Product analytics dashboard',
    category: 'Analytics',
    icon: '📊',
    productType: 'SaaS dashboard',
    primaryUser: 'PM / analyst',
    sections: ['overview', 'stories', 'functional', 'acceptance', 'edge', 'metrics'],
    feature: 'Build an analytics dashboard showing DAU/MAU, feature adoption by cohort, funnel conversion rates, retention curves, and top drop-off points. Support date range selection, CSV export, and shareable dashboard links.',
  },
  {
    id: 'analytics-api-telemetry',
    label: 'API usage & telemetry',
    category: 'Analytics',
    icon: '📡',
    productType: 'API platform',
    primaryUser: 'API developer / admin',
    sections: ['overview', 'functional', 'acceptance', 'edge', 'nonfunctional', 'metrics'],
    feature: 'Launch token-scoped API usage dashboards showing real-time call volume, error rates, latency percentiles, fallback triggers, and cost-per-resolution. Support per-key and aggregate views with anomaly alerting.',
  },
  // MIGRATIONS & INFRA
  {
    id: 'migration-data',
    label: 'Data migration flow',
    category: 'Migration & Infra',
    icon: '🚚',
    productType: 'Internal tool',
    primaryUser: 'ops / engineering',
    sections: ['overview', 'functional', 'acceptance', 'edge', 'nonfunctional', 'outofscope'],
    feature: 'Build a self-service data migration tool to move customer data from legacy system to new platform. Includes dry-run mode, validation report, rollback capability, and progress tracking with estimated completion time.',
  },
  {
    id: 'migration-api-versioning',
    label: 'API versioning & deprecation',
    category: 'Migration & Infra',
    icon: '🗓',
    productType: 'API platform',
    primaryUser: 'API developer',
    sections: ['overview', 'functional', 'acceptance', 'edge', 'nonfunctional'],
    feature: 'Introduce API versioning (v1/v2) with a deprecation policy. Serve both versions simultaneously during transition, add deprecation headers to v1 responses, notify developers via email and dashboard warnings 90 days before sunset.',
  },
  // A/B TESTING
  {
    id: 'ab-framework',
    label: 'A/B testing framework',
    category: 'Experimentation',
    icon: '🧪',
    productType: 'Consumer web app',
    primaryUser: 'PM / growth team',
    sections: ['overview', 'functional', 'acceptance', 'edge', 'metrics'],
    feature: 'Build an internal A/B testing framework: experiment creation with traffic split controls, variant assignment via user ID hashing, metric tracking per variant, statistical significance calculator, and one-click rollout.',
  },
  // MOBILE
  {
    id: 'mobile-offline',
    label: 'Offline mode',
    category: 'Mobile',
    icon: '📴',
    productType: 'Mobile app',
    primaryUser: 'mobile user',
    sections: ['overview', 'stories', 'functional', 'acceptance', 'edge', 'nonfunctional'],
    feature: 'Add offline mode so users can access and edit their last synced data without a connection. Changes queue locally and sync automatically when connection is restored, with conflict resolution for concurrent edits.',
  },
  {
    id: 'mobile-push',
    label: 'Push notification delivery',
    category: 'Mobile',
    icon: '📲',
    productType: 'Mobile app',
    primaryUser: 'end user',
    sections: ['overview', 'functional', 'acceptance', 'edge', 'metrics'],
    feature: 'Implement push notifications for iOS and Android with permission request flow, notification categories, deep link routing from tap, delivery tracking, and opt-out management that syncs with email preferences.',
  },
]

// ── DIAGRAM TEMPLATES ────────────────────────────────────────────────────────

export const DIAGRAM_TEMPLATES: DiagramTemplate[] = [
  // USER JOURNEYS
  { id: 'uj-onboarding', label: 'User onboarding journey', category: 'User Journeys', icon: '🚀', diagramType: 'userJourney', description: 'New user onboarding: landing page → sign up → email verification → profile setup → first key action → aha moment → habitual use' },
  { id: 'uj-checkout', label: 'Checkout & purchase', category: 'User Journeys', icon: '🛒', diagramType: 'userJourney', description: 'E-commerce checkout: browse → add to cart → review cart → enter details → payment → confirmation → post-purchase email' },
  { id: 'uj-support', label: 'Support escalation', category: 'User Journeys', icon: '🎧', diagramType: 'userJourney', description: 'Customer support journey: issue encountered → self-serve help search → chatbot → ticket creation → agent assigned → resolution → satisfaction survey' },
  { id: 'uj-offboarding', label: 'User offboarding / cancellation', category: 'User Journeys', icon: '👋', diagramType: 'userJourney', description: 'Cancellation flow: settings → cancel plan → reason survey → retention offer → confirm cancel → data export offer → goodbye email' },
  // SYSTEM FLOWS
  { id: 'sys-auth', label: 'Authentication flow', category: 'System Flows', icon: '🔐', diagramType: 'sequenceDiagram', description: 'OAuth 2.0 authentication sequence: User → Client App → Auth Server → Resource Server. Include token request, authorization code exchange, access token issuance, and API call with bearer token.' },
  { id: 'sys-api-request', label: 'API request lifecycle', category: 'System Flows', icon: '⚡', diagramType: 'sequenceDiagram', description: 'API request lifecycle: Client → API Gateway → Rate Limiter → Auth Middleware → Business Logic → Database → Cache → Response. Include error handling paths.' },
  { id: 'sys-webhook', label: 'Webhook delivery', category: 'System Flows', icon: '📡', diagramType: 'sequenceDiagram', description: 'Webhook delivery sequence: Event triggers → Webhook service queues payload → Attempts delivery to customer endpoint → On failure: exponential backoff retry → After max retries: dead letter queue → Admin alert' },
  { id: 'sys-data-pipeline', label: 'Data ingestion pipeline', category: 'System Flows', icon: '🏭', diagramType: 'flowchart', description: 'Data ingestion pipeline: Raw data source → Ingest service → Validation & schema check → Transformation → Quality gate → Staging → Production load → Versioned snapshot → Rollback path on failure' },
  { id: 'sys-payment', label: 'Payment processing', category: 'System Flows', icon: '💳', diagramType: 'sequenceDiagram', description: 'Payment processing: Customer → Checkout UI → Payment Service → Fraud Detection → Payment Gateway (Stripe) → Bank Auth → Confirmation → Order Service → Fulfilment → Email receipt' },
  // FEATURE FLOWS
  { id: 'feat-search', label: 'Search & indexing flow', category: 'Feature Flows', icon: '🔍', diagramType: 'flowchart', description: 'Search system flow: User types query → Debounce → Query parser → Index lookup → Ranking model → Filter & facets → Result set → Cache hit path vs cold path' },
  { id: 'feat-notification', label: 'Notification dispatch', category: 'Feature Flows', icon: '🔔', diagramType: 'flowchart', description: 'Notification dispatch flow: Event occurs → User preference check → Channel router (push/email/in-app) → Template render → Delivery attempt → Delivery confirmation → Unread count update' },
  { id: 'feat-ab-test', label: 'A/B test assignment', category: 'Feature Flows', icon: '🧪', diagramType: 'flowchart', description: 'A/B test assignment: User request → Experiment service → User ID hash → Bucket assignment → Feature flag lookup → Variant served → Metric event logged → Results aggregated' },
  // STATE MACHINES
  { id: 'state-order', label: 'Order state machine', category: 'State Machines', icon: '📦', diagramType: 'stateDiagram', description: 'Order states: Draft → Submitted → Payment Pending → Paid → Fulfilling → Shipped → Delivered → Completed. Also: Cancelled (from any state except Delivered), Refund Requested → Refunded' },
  { id: 'state-subscription', label: 'Subscription states', category: 'State Machines', icon: '🔄', diagramType: 'stateDiagram', description: 'Subscription lifecycle states: Trial → Active → Past Due → Suspended → Cancelled → Reactivated. Include upgrade/downgrade transitions between plan tiers.' },
  { id: 'state-ticket', label: 'Support ticket lifecycle', category: 'State Machines', icon: '🎫', diagramType: 'stateDiagram', description: 'Support ticket states: New → Assigned → In Progress → Waiting for Customer → Resolved → Closed. Also: Escalated (from In Progress), Reopened (from Resolved/Closed)' },
  // DATA MODELS
  { id: 'er-saas', label: 'SaaS data model', category: 'Data Models', icon: '🗄', diagramType: 'erDiagram', description: 'SaaS platform ER diagram with entities: Organization, User, Role, Workspace, Project, Feature, Subscription, Invoice, AuditLog. Show relationships and cardinality.' },
  { id: 'er-ecommerce', label: 'E-commerce data model', category: 'Data Models', icon: '🏪', diagramType: 'erDiagram', description: 'E-commerce ER diagram: Customer, Address, Product, ProductVariant, Category, Cart, CartItem, Order, OrderItem, Payment, Coupon, Review' },
  // PROCESS FLOWS
  { id: 'proc-incident', label: 'Incident response', category: 'Process Flows', icon: '🚨', diagramType: 'flowchart', description: 'Incident response process: Alert fires → On-call paged → Triage (P1/P2/P3) → War room opened → Mitigation steps → Root cause identified → Fix deployed → Post-mortem scheduled → Action items logged' },
  { id: 'proc-release', label: 'Release process', category: 'Process Flows', icon: '🚢', diagramType: 'flowchart', description: 'Software release process: Feature complete → Code review → CI pipeline → Staging deploy → QA sign-off → Canary release 5% → Monitor metrics → Full rollout → Rollback trigger condition' },
  { id: 'proc-sprint', label: 'Sprint planning flow', category: 'Process Flows', icon: '📋', diagramType: 'flowchart', description: 'Sprint planning: Backlog refinement → Priority stack rank → Capacity planning → Story point estimation → Sprint commitment → Daily standups → Mid-sprint check → Demo → Retro → Next sprint' },
]

// ── TRANSLATE TEMPLATES ──────────────────────────────────────────────────────

export const TRANSLATE_TEMPLATES: TranslateTemplate[] = [
  { id: 'tr-user-research', label: 'User research script', category: 'Research', icon: '🎙', text: `User Interview Script — Feature Discovery

Thank you for joining us today. We're exploring how you currently handle [task] and what could make it easier.

1. Can you walk me through the last time you did [task]? What steps did you take?
2. What was the most frustrating part of that process?
3. How often do you do this, and how long does it typically take?
4. What tools or workarounds do you currently use?
5. If you could change one thing about how this works today, what would it be?
6. What would an ideal solution look like for you?

Thank you for your time. Is there anything else you'd like to share?` },
  { id: 'tr-release-notes', label: 'Release notes', category: 'Communication', icon: '📋', text: `Release Notes — v2.4.0

What's new:
• Multi-model routing engine now supports 5 geocoding providers with real-time confidence scoring
• New API playground with live response previews and integration sandboxes
• Token-scoped usage dashboards now available to all paid plans

Improvements:
• Address match rate improved by 18% across all fallback strategies
• API response latency reduced by 20–35% for standard queries
• Onboarding guide updated with quickstart examples for top 3 use cases

Bug fixes:
• Fixed an issue where plan limits were not enforced after downgrade
• Resolved race condition in webhook retry logic
• Corrected display of negative balance in admin portal

Breaking changes:
• The /v1/geocode endpoint is deprecated. Please migrate to /v2/geocode before March 1st.` },
  { id: 'tr-error-messages', label: 'Error messages (UI copy)', category: 'UX Copy', icon: '⚠️', text: `Error Messages for Localisation

Authentication errors:
- "Your session has expired. Please sign in again."
- "Incorrect email or password. Please try again."
- "Your account has been locked after 5 failed attempts. Check your email to unlock."

Payment errors:
- "Your payment could not be processed. Please check your card details and try again."
- "Your card was declined. Please contact your bank or use a different payment method."
- "This coupon code is no longer valid."

API errors:
- "You have exceeded your rate limit. Please wait 60 seconds before retrying."
- "Your API key is invalid or has been revoked."
- "The requested resource could not be found."

General errors:
- "Something went wrong on our end. Please try again in a few moments."
- "You don't have permission to perform this action."
- "This feature is not available on your current plan."` },
  { id: 'tr-onboarding-email', label: 'Welcome / onboarding email', category: 'Communication', icon: '📧', text: `Subject: Welcome to [Product] — here's how to get started

Hi [First Name],

Welcome to [Product]. You're now set up and ready to go.

Here's how to make the most of your first week:

1. Complete your profile — add your team details so we can personalise your experience.
2. Make your first API call — use our interactive playground to test the API without writing any code.
3. Explore the docs — our quickstart guide walks you through the most common use cases in under 10 minutes.

If you need help at any point, our support team is available at support@[product].com, or browse the Help Centre.

We're glad to have you on board.

The [Product] team` },
  { id: 'tr-pm-phrases', label: 'Common PM phrases', category: 'PM Language', icon: '💬', text: `Common Product Management Phrases

Strategy:
- "What problem are we solving, and for whom?"
- "What does success look like in 6 months?"
- "What are we explicitly not doing?"
- "What's the smallest version of this we could ship to learn?"

Prioritisation:
- "What's the opportunity cost of building this?"
- "How does this move the north star metric?"
- "Is this a must-have, should-have, or nice-to-have?"

With engineering:
- "What's your biggest concern about this spec?"
- "Where are the unknowns we need to de-risk?"
- "What would you do differently if you were PM?"

In stakeholder reviews:
- "Here's what we're shipping, what we're not, and why."
- "This is the assumption we're making — here's how we'll validate it."
- "We'll know this worked if we see X change in Y metric."` },
  { id: 'tr-spec-summary', label: 'Spec executive summary', category: 'Documentation', icon: '📄', text: `Feature: [Feature Name]
Status: Draft for review
Author: [PM Name]
Date: [Date]

Problem
[2–3 sentences describing the user problem and why it matters now]

Proposed solution
[2–3 sentences describing what we're building at a high level]

Who it's for
Primary: [User persona]
Secondary: [User persona if applicable]

What success looks like
- [Metric 1]: from [baseline] to [target] within [timeframe]
- [Metric 2]: from [baseline] to [target]
- [Qualitative signal]: [description]

What's in scope
- [Feature 1]
- [Feature 2]
- [Feature 3]

What's out of scope
- [Item 1]
- [Item 2]

Key open questions
1. [Question]
2. [Question]

Timeline
Design complete: [date]
Engineering kickoff: [date]
Target ship: [date]` },
]

// ── CSV SAMPLE TEMPLATES ─────────────────────────────────────────────────────

export const CSV_TEMPLATES: CsvTemplate[] = [
  {
    id: 'csv-product-metrics',
    label: 'Product metrics',
    category: 'Product Analytics',
    icon: '📈',
    description: 'Weekly DAU, MAU, signups, churn, and revenue',
    csv: `week,dau,mau,new_signups,churned_users,mrr_usd,arpu_usd
2024-W01,1240,8900,312,45,42000,4.72
2024-W02,1310,9100,289,38,43200,4.75
2024-W03,1280,9050,301,52,43200,4.77
2024-W04,1420,9400,445,41,45600,4.85
2024-W05,1380,9350,378,60,45600,4.88
2024-W06,1460,9600,402,35,47100,4.91
2024-W07,1510,9800,418,42,47100,4.81
2024-W08,1490,9750,395,58,48300,4.95
2024-W09,1620,10200,512,39,50400,4.94
2024-W10,1580,10050,478,67,50400,5.01
2024-W11,1700,10500,534,44,52800,5.03
2024-W12,1650,10300,498,71,52800,5.12`
  },
  {
    id: 'csv-feature-adoption',
    label: 'Feature adoption',
    category: 'Product Analytics',
    icon: '🎯',
    description: 'Feature usage rates by user cohort and plan',
    csv: `feature,free_users_pct,pro_users_pct,enterprise_users_pct,total_users_pct,avg_uses_per_week,retention_impact
dashboard,82,94,99,88,6.2,high
api_playground,12,67,91,38,3.1,high
csv_export,8,71,88,34,2.4,medium
webhooks,3,42,85,23,1.8,high
custom_domain,1,28,76,15,0.3,medium
sso_login,0,5,94,8,1.1,high
audit_log,0,18,97,12,0.9,medium
api_key_rotation,2,35,89,20,0.5,low
bulk_import,4,48,82,27,1.2,medium
team_invite,9,78,98,42,2.8,high`
  },
  {
    id: 'csv-cohort-retention',
    label: 'Cohort retention',
    category: 'Retention',
    icon: '🔁',
    description: '12-month cohort retention table',
    csv: `cohort,month_0,month_1,month_2,month_3,month_4,month_5,month_6,month_7,month_8,month_9,month_10,month_11,month_12
Jan-2024,100,68,54,48,43,40,38,36,35,34,33,32,31
Feb-2024,100,71,57,50,46,42,40,38,37,36,35,34,
Mar-2024,100,66,52,46,41,38,36,35,34,33,32,,
Apr-2024,100,73,60,53,48,44,42,40,39,38,,,
May-2024,100,69,55,49,44,41,39,37,36,,,,
Jun-2024,100,74,61,54,49,45,43,41,,,,,
Jul-2024,100,72,58,52,47,43,41,,,,,,
Aug-2024,100,76,63,56,51,47,,,,,,,
Sep-2024,100,70,57,50,45,,,,,,,,
Oct-2024,100,78,65,58,,,,,,,,,
Nov-2024,100,75,62,,,,,,,,,,
Dec-2024,100,80,,,,,,,,,,,`
  },
  {
    id: 'csv-nps',
    label: 'NPS survey results',
    category: 'Customer Feedback',
    icon: '⭐',
    description: 'NPS scores with segment and verbatim feedback',
    csv: `respondent_id,date,score,segment,plan,tenure_months,verbatim
R001,2024-01-08,9,power_user,pro,14,"Extremely reliable API, great docs"
R002,2024-01-09,3,churned_risk,free,2,"Too expensive to upgrade, missing key features"
R003,2024-01-10,8,active,enterprise,24,"Great support team, dashboard could be cleaner"
R004,2024-01-11,10,advocate,enterprise,36,"Best API platform we've used, our team loves it"
R005,2024-01-12,5,passive,pro,6,"Product is fine but onboarding was confusing"
R006,2024-01-13,2,churned_risk,free,1,"Couldn't figure out how to get started, gave up"
R007,2024-01-14,9,power_user,pro,18,"Fast, reliable, good value at pro tier"
R008,2024-01-15,7,active,pro,9,"Good product, would love better analytics"
R009,2024-01-16,10,advocate,enterprise,48,"We've built our whole platform on this"
R010,2024-01-17,4,passive,free,3,"Feature set is limited on free plan"
R011,2024-01-18,8,active,pro,11,"Solid product, docs improved a lot recently"
R012,2024-01-19,6,passive,pro,7,"Gets the job done, UI feels dated"`
  },
  {
    id: 'csv-api-usage',
    label: 'API usage by endpoint',
    category: 'API Analytics',
    icon: '⚡',
    description: 'API calls, latency, and error rates per endpoint',
    csv: `endpoint,method,total_calls,p50_ms,p95_ms,p99_ms,error_rate_pct,top_error_code,calls_last_7d,calls_prev_7d,pct_change
/v2/geocode,POST,2841000,48,142,380,0.8,422,312400,298200,4.8
/v2/geocode/batch,POST,94200,210,680,1420,1.2,429,10200,8900,14.6
/v1/geocode,POST,182000,62,198,510,2.1,400,18400,24100,-23.7
/v2/buildings,GET,1240000,35,98,220,0.3,404,142000,138000,2.9
/v2/buildings/search,POST,380000,88,245,620,0.6,400,44200,40100,10.2
/v2/keys,GET,28400,22,55,88,0.1,401,3200,3100,3.2
/v2/keys,POST,4200,38,92,180,0.4,409,480,390,23.1
/v2/usage,GET,62000,28,72,145,0.2,403,7400,7100,4.2
/health,GET,840000,8,18,32,0.0,,94000,91000,3.3
/v2/plans,GET,18200,24,58,92,0.1,401,2100,1980,6.1`
  },
]


