# Key Metrics

## North Star Metric
**Total Identified Annual Savings ($)**: The aggregate amount of money our tool has identified for users. This aligns our success directly with user value.

## Input Metrics
1. **Audit Completion Rate (%)**: Measures the friction of the multi-step form.
2. **Lead Capture Velocity**: Number of new emails captured per 1,000 visitors.
3. **Savings Realization (Surveyed)**: Percentage of users who actually take action based on recommendations (tracked via follow-up emails).

## Instrumentation
- **PostHog**: Funnel tracking from landing -> step 1 -> step 3 -> results.
- **Supabase Logs**: Tracking shareable link generation and repeat visits.
- **Vercel Analytics**: Core web vitals and geographical distribution of users.

## Pivot Decision Trigger
We will consider pivoting or sunsetting the project if:
- **The Audit-to-Lead conversion stays below 5% for 3 consecutive months** despite UI optimizations. This would indicate that "audit results" aren't a strong enough incentive for email capture in this niche.
- **Average savings per audit drops below $50/mo**. This would suggest that AI tool pricing has become too standardized or "perfected" for a third-party optimizer to provide meaningful value.
