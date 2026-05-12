# Unit Economics

> CAC, LTV, funnel math, and revenue projections for AI Spend Audit.

## Assumptions

| Variable | Value | Basis |
|----------|-------|-------|
| Target market | Seed–Series A startups (5–50 people) | ~150,000 globally |
| Avg. AI tool spend per startup | $500/mo | Industry surveys, informal polling |
| Avg. savings found per audit | $200/mo | Based on engine testing across scenarios |
| Free tier conversion to email lead | 30% | Industry avg for free-tool-to-email |
| Email lead conversion to paid | 5% | Conservative SaaS free-to-paid benchmark |
| Monthly churn (paid) | 8% | High for SMB, realistic for early-stage SaaS |
| Premium price (blended avg) | $29/mo | Mix of $9 single features and $49 bundles |

## Funnel Math

### Monthly Funnel (at 1,000 audits/month)

```
Landing page visits:     3,000
                           │ 33% start audit
Audits started:          1,000
                           │ 70% complete
Audits completed:          700
                           │ 30% give email
Email leads:               210
                           │ 5% convert to paid
New paid users:             10.5 → ~10
```

### Steady-State Subscribers (Month 12)

With 8% monthly churn and ~10 new subscribers/month:

```
Month 1:   10 subscribers  →  $290 MRR
Month 3:   25 subscribers  →  $725 MRR
Month 6:   45 subscribers  →  $1,305 MRR
Month 12:  70 subscribers  →  $2,030 MRR
```

*(Using geometric series: steady state ≈ new/churn = 10/0.08 ≈ 125, but reached gradually)*

## Customer Acquisition Cost (CAC)

### Phase 1: Organic Only (Months 1–3)

| Channel | Monthly Time (hrs) | Imputed Cost (@$50/hr) | Expected Audits |
|---------|-------------------|----------------------|-----------------|
| Product Hunt / HN | 8 | $400 | 300 |
| Twitter threads | 6 | $300 | 150 |
| Reddit posts | 4 | $200 | 100 |
| LinkedIn | 4 | $200 | 75 |
| Cold outreach | 6 | $300 | 50 |
| **Total** | **28** | **$1,400** | **675** |

**CAC (to audit):** $1,400 / 675 = **$2.07/audit**
**CAC (to email):** $1,400 / 202 = **$6.93/lead**
**CAC (to paid):** $1,400 / 10 = **$140/customer**

### Phase 2: Content + SEO (Months 4–12)

Once content ranks, organic traffic reduces blended CAC:

| Channel | Monthly Cost | Expected Audits |
|---------|-------------|-----------------|
| Organic content (amortised) | $500 | 400 |
| Community engagement | $300 | 200 |
| Referrals (viral) | $0 | 100 |
| **Total** | **$800** | **700** |

**Blended CAC (to paid):** $800 / ~10 = **$80/customer**

## Lifetime Value (LTV)

```
LTV = ARPU / Churn Rate
LTV = $29 / 0.08
LTV = $362.50
```

### LTV:CAC Ratio

| Phase | CAC | LTV | LTV:CAC |
|-------|-----|-----|---------|
| Phase 1 (organic) | $140 | $362 | 2.6x |
| Phase 2 (content + viral) | $80 | $362 | 4.5x |

**Benchmark:** SaaS businesses are healthy at 3x+. We cross that threshold by Month 4.

## Revenue Projections

### Conservative Scenario (1,000 audits/month by Month 3)

| Month | Audits | New Paid | Total Paid | MRR | ARR |
|-------|--------|----------|------------|-----|-----|
| 1 | 300 | 3 | 3 | $87 | $1,044 |
| 3 | 700 | 7 | 18 | $522 | $6,264 |
| 6 | 1,000 | 10 | 45 | $1,305 | $15,660 |
| 12 | 1,500 | 15 | 95 | $2,755 | $33,060 |

### Aggressive Scenario (viral hit, 5,000 audits/month by Month 3)

| Month | Audits | New Paid | Total Paid | MRR | ARR |
|-------|--------|----------|------------|-----|-----|
| 1 | 2,000 | 20 | 20 | $580 | $6,960 |
| 3 | 5,000 | 50 | 120 | $3,480 | $41,760 |
| 6 | 5,000 | 50 | 280 | $8,120 | $97,440 |
| 12 | 5,000 | 50 | 500 | $14,500 | $174,000 |

## Cost Structure

### Fixed Costs (Monthly)

| Item | Cost |
|------|------|
| Vercel Pro (hosting) | $20 |
| Supabase Pro (database) | $25 |
| Domain + DNS | $2 |
| PostHog (analytics) | $0 (free tier) |
| **Total** | **$47/mo** |

### Variable Costs (Per 1,000 Audits)

| Item | Cost |
|------|------|
| Gemini API (summaries) | $3 |
| Resend (emails) | $0 (free tier covers first 3,000/mo) |
| Supabase bandwidth | $0 (within limits) |
| **Total** | **~$3/1,000 audits** |

### Breakeven

Fixed costs: $47/mo
Variable costs at 1,000 audits: ~$3/mo
**Total monthly cost: $50/mo**

**Breakeven: 2 paid subscribers** ($58 MRR > $50 costs)

We reach breakeven in **Month 1** even in the conservative scenario.

## Key Risks to Economics

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Lower conversion than 5% | Fewer paid users, longer to scale | Improve onboarding, add more premium features |
| Higher churn than 8% | Lower steady-state subscribers | Add retention features (monthly re-audit, alerts) |
| Market too small | Ceiling on growth | Expand to general SaaS audit (not just AI) |
| Pricing too low | Revenue doesn't cover expansion costs | Test $49 and $99 tiers with larger teams |
