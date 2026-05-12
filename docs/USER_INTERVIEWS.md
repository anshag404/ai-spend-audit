# User Interview Framework

> Structure for validating AI Spend Audit with real users. No fabricated interviews.

## Purpose

This document provides a **framework** for conducting user interviews to validate assumptions. Actual interviews have not been conducted yet — this outlines who to talk to, what to ask, and how to interpret results.

## Target Interview Segments

### Segment 1: Engineering Leads (Primary)
- **Who:** Engineering managers or tech leads at 5–25 person startups
- **Why:** They choose the tools and approve the spend
- **Where to find them:** LinkedIn, Indie Hackers, local startup meetups, YC/Techstars alumni Slack groups
- **Sample size goal:** 8–12 interviews

### Segment 2: Technical Co-Founders (Secondary)
- **Who:** Founders who are still writing code and managing infra
- **Why:** They feel the financial pain directly
- **Where to find them:** Twitter/X, founder communities, startup pitch events
- **Sample size goal:** 5–8 interviews

### Segment 3: Operations / Finance (Tertiary)
- **Who:** Head of Ops or Finance lead at Series A+ startups
- **Why:** They manage the SaaS budget holistically
- **Where to find them:** LinkedIn, finance-focused SaaS communities
- **Sample size goal:** 3–5 interviews

## Interview Script (30 minutes)

### Warm-Up (5 min)
1. What's your role? How many people on your engineering team?
2. Roughly how many AI tools does your team use? (paid + free)

### Problem Exploration (10 min)
3. How do you currently track what AI tools your team pays for?
4. Have you ever discovered that you were paying for something nobody used?
5. When was the last time you cancelled or downgraded an AI subscription? What triggered it?
6. How do you decide between competing tools (e.g., Cursor vs Copilot)?
7. Does anyone on the team have budget authority for new AI tool purchases?

### Solution Validation (10 min)
8. *Show the product.* Walk them through a demo audit.
9. Does this report match your intuition about where you're overspending?
10. What's the most useful part of this report? What's missing?
11. Would you share this report with your co-founder or CFO?
12. How often would you want to re-run this audit? Monthly? Quarterly?

### Willingness to Pay (5 min)
13. Would you use this if it were free? (Expected: yes)
14. Would you pay $9/month for monthly re-audits and alerts? What about $29?
15. What feature would make you pay? (Open-ended)

## Key Hypotheses to Validate

| # | Hypothesis | How to Validate |
|---|-----------|-----------------|
| H1 | Teams don't know their total AI spend | Q3: Look for "I'd have to check" or "we don't track it" |
| H2 | Redundant tools are common | Q4, Q6: Look for overlapping tools mentioned |
| H3 | Cancellation is reactive, not proactive | Q5: Look for triggers like "invoice shock" or "someone noticed" |
| H4 | The audit report is actionable | Q9, Q10: Does the user say "I'd act on this"? |
| H5 | Monthly re-audits justify $9/mo | Q12, Q14: Is monthly frequency desired? Is $9 acceptable? |

## Scoring Framework

After each interview, score the following (1–5):

| Dimension | 1 (Low) | 5 (High) |
|-----------|---------|----------|
| Problem awareness | "We don't have this problem" | "This keeps me up at night" |
| Current solution | "We have a great system" | "We use spreadsheets / nothing" |
| Product fit | "This isn't useful" | "I'd use this today" |
| Willingness to pay | "No" | "I'd pay $29/mo easily" |
| Referral intent | "I wouldn't share this" | "I'd send this to 3 people" |

**Target:** Average score ≥ 3.5 across all dimensions to proceed with paid features.

## Anti-Patterns to Watch For

- **Politeness bias:** "Yeah, this is cool" means nothing. Look for specific actions: "I'd cancel our Gemini Advanced tomorrow."
- **Hypothetical willingness:** "I'd probably pay $9" is weaker than "Can I sign up now?"
- **Wrong persona:** If the interviewee says "I don't manage any tools", stop and find the right person.

## Post-Interview Actions

1. Transcribe key quotes (verbatim — exact words matter)
2. Update the hypothesis scorecard
3. If ≥3 users mention a missing feature, add it to the roadmap
4. If ≥3 users reject a hypothesis, pivot the assumption
5. Share learnings in the DEVLOG
