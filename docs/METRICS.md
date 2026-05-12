# Metrics

> Key performance indicators and tracking plan for AI Spend Audit.

## North Star Metric

**Audits Completed Per Week**

This is the single number that matters most. Every other metric flows from it:
- More audits → more leads → more paid conversions
- More audits → more share links → more organic traffic
- More audits → more data → better recommendations

## Metric Categories

### 1. Acquisition Metrics

| Metric | Definition | Target (Month 3) | Tracking |
|--------|-----------|-------------------|----------|
| Landing page visits | Unique visitors to `/` | 3,000/mo | PostHog |
| Audit start rate | Visitors who click "Start audit" / Total visitors | 33% | PostHog (`audit_started`) |
| Audit completion rate | Completed audits / Started audits | 70% | PostHog (`audit_completed`) |
| Step drop-off | Where users abandon the form | < 20% per step | PostHog (`audit_step_completed`) |

### 2. Engagement Metrics

| Metric | Definition | Target | Tracking |
|--------|-----------|--------|----------|
| Avg. tools per audit | Number of tools selected per audit | ≥ 3 | PostHog property |
| AI summary usage | % of users who generate an AI summary | 40% | API route logs |
| Share link generation | % of users who save/share their report | 20% | PostHog (`share_modal_opened`) |
| Return visits | Users who come back within 30 days | 10% | PostHog cohorts |

### 3. Lead Generation Metrics

| Metric | Definition | Target | Tracking |
|--------|-----------|--------|----------|
| Email capture rate | Emails collected / Audits completed | 30% | Supabase `leads` table |
| Lead-to-paid conversion | Paid subscribers / Email leads | 5% | Stripe + Supabase |
| Email open rate | Opens / Emails sent | 40% | Resend analytics |
| Email click rate | Clicks / Emails sent | 8% | Resend analytics |

### 4. Revenue Metrics (Post-Launch)

| Metric | Definition | Target (Month 6) | Tracking |
|--------|-----------|-------------------|----------|
| MRR | Monthly recurring revenue | $1,300 | Stripe |
| ARPU | Average revenue per user | $29 | Stripe |
| Monthly churn | Subscribers lost / Total subscribers | < 8% | Stripe |
| LTV | ARPU / Churn rate | $362 | Calculated |
| CAC | Total acquisition cost / New customers | < $100 | Calculated |
| LTV:CAC | Ratio | > 3x | Calculated |

### 5. Product Quality Metrics

| Metric | Definition | Target | Tracking |
|--------|-----------|--------|----------|
| Avg. savings per audit | Total savings found / Audits completed | $200/mo | Engine output |
| Health score distribution | % of audits with score < 60 (room to improve) | > 50% | Engine output |
| Engine error rate | Audits that produce 0 recommendations | < 5% | Monitoring |
| Page load time (LCP) | Largest Contentful Paint | < 2.5s | Lighthouse |
| Lighthouse accessibility | Accessibility score | ≥ 90 | Lighthouse |

## PostHog Event Taxonomy

| Event Name | Trigger | Properties |
|-----------|---------|------------|
| `audit_started` | User enters the form | — |
| `audit_step_completed` | User advances a form step | `step`: "select-tools" \| "configure" \| "team-info" |
| `audit_completed` | User generates their report | `toolCount`, `totalMonthlySavings`, `healthScore` |
| `share_modal_opened` | User opens the share panel | — |
| `ai_summary_requested` | User clicks "Generate AI Summary" | — |
| `lead_captured` | User submits their email | `source` |

## Dashboard Layout

### Weekly Check (5 min)
- Audits completed this week vs last week
- Step drop-off funnel
- Email capture rate
- Share link generation count

### Monthly Review (30 min)
- Traffic sources and trends
- Conversion funnel analysis
- Average savings per audit trend
- Feature usage breakdown
- Revenue (when applicable)

## When to Worry

| Signal | Threshold | Action |
|--------|----------|--------|
| Audit start rate drops below 25% | Sustained for 1 week | Re-examine CTA copy and page load speed |
| Completion rate drops below 50% | Sustained for 1 week | Audit the form for friction; check for errors |
| Email capture rate below 15% | Sustained for 2 weeks | Test different value propositions in the email prompt |
| Engine produces 0 recommendations | > 10% of audits | Check pricing data currency; review rule thresholds |
| LCP exceeds 4s | Sustained | Audit bundle size; review third-party scripts |
