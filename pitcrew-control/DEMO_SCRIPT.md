# 🏁 PitCrew Control - Demo Script

**Time: 60 seconds**
**Goal: Show AI-orchestrated execution control with visible Jira automation**

---

## Pre-Demo Setup (2 minutes)

### Checklist

✅ Forge app deployed and installed to Jira project
✅ Dashboard loads without errors
✅ Seeded telemetry mode enabled (default)
✅ Browser zoom at 100% for readability
✅ Jira project tab open in another browser tab/window

### Optional: Create Demo Issue

If you want to show **real Jira automation** instead of seeded data:

1. Create issue in Jira: `DEMO-123`
2. Set priority: **Highest**
3. Set status: **To Do**
4. Note: This will be the target for automation

---

## Demo Script

### **[0:00-0:10] Introduction** (10 seconds)

**Say:**
> "Formula 1 teams win through precision and instant decisions. PitCrew Control brings that discipline to Atlassian teams — monitoring telemetry, predicting risk, and automating execution before problems slow you down."

**Show:**
- Dashboard header: "🏁 PitCrew Control™"

---

### **[0:10-0:25] Race Status & Telemetry** (15 seconds)

**Say:**
> "The dashboard shows race status — green, yellow, or red flag — based on real-time telemetry from Jira."

**Show:**
- Point to **Race Status: YELLOW**
- Scan telemetry panels:
  - Sprint Velocity: 28/40 points (70%)
  - Blockers: 3 detected
  - SLA Risk: MEDIUM, 90 min breach ETA
  - Deploy: NOT READY, 2 pipelines failing

**Say:**
> "Right now, we're yellow flagged. Sprint velocity is at 70%, we have 3 blockers, and an SLA breach risk in 90 minutes."

---

### **[0:25-0:40] Ask Pit Engineer** (15 seconds)

**Say:**
> "Let's ask the Pit Engineer — our AI race strategist — what to do next."

**Do:**
- Click **"Ask Pit Engineer"** button

**Show (response appears):**
- Risk: **YELLOW**
- Action: "Assign DEMO-123 to senior engineer and add tracking label 'sla-watch'"
- Reason: "SLA at risk with 90 minutes remaining. Proactive assignment ensures timely resolution before escalation needed."

**Say:**
> "The Pit Engineer analyzed all signals and recommends one action: escalate DEMO-123 with an SLA tracking label."

---

### **[0:40-0:50] Apply Suggestion** (10 seconds)

**Say:**
> "Now watch this — one click to apply the recommendation."

**Do:**
- Click **"Apply Suggestion"** button

**Show (confirmation appears):**
- ✅ Suggestion Applied
- Applied to: DEMO-123
- Actions: added-escalation-comment, added-label-pitcrew-escalate

**Say:**
> "Done. PitCrew just added a comment and label to DEMO-123 in Jira."

---

### **[0:50-1:00] Verify in Jira** (10 seconds)

**Do:**
- Switch to Jira browser tab/window
- Navigate to DEMO-123

**Show:**
- New comment: "🏁 PitCrew Control: SLA Escalation"
- New label: `pitcrew-escalate`

**Say:**
> "And here it is in Jira — the escalation comment and label were added automatically. That's AI-orchestrated execution: detect, recommend, automate, verify. In production, this runs on live Jira data with Atlassian Rovo."

---

## Extended Demo (2 minutes)

If you have more time, add these segments:

### **Show Telemetry Refresh**

**Say:**
> "Telemetry refreshes on demand, pulling real data from Jira APIs."

**Do:**
- Click "Refresh Telemetry"
- Point to updated timestamp

---

### **Explain Rovo Integration**

**Say:**
> "The Pit Engineer currently uses deterministic logic, but it's architected for drop-in Rovo integration — a 10-line code change swaps the stub for Atlassian's AI."

**Show (optional):**
- Open `src/handlers/pitEngineer.js` in IDE
- Point to integration point (lines 9-21)

---

### **Show Risk Scoring Logic**

**Say:**
> "Risk prioritization is SLA first, then blockers, then velocity, then deploy. The highest risk gets the action."

**Show (optional):**
- Open `src/utils/riskScoring.js` in IDE
- Point to `identifyTopRisk()` function

---

## Q&A Talking Points

### "How does it integrate with Rovo?"

> "The Pit Engineer interface is Rovo-ready. The deterministic stub returns `{ risk, action, reason }` — the same schema Rovo will return. Integration is a simple API call swap in `pitEngineer.js`."

### "What if I want real Jira data?"

> "Set `useSeededData = false` in the telemetry handler. The app queries sprint velocity, blockers, and SLA risk from Jira REST APIs. Seeded mode is for demo reliability."

### "What other automations can you add?"

> "The architecture supports any safe Jira mutation: auto-assign, sprint scope changes, deploy pipeline retries, Confluence documentation updates. We prioritized SLA escalation and blocker tracking for the MVP."

### "How does it scale to multiple projects?"

> "Each project page has its own dashboard. Future enhancement: portfolio-level telemetry aggregating all projects."

### "What's the racing theme connection?"

> "Formula 1 pit crews make split-second decisions to keep the race on track. PitCrew Control does the same for software teams — detect friction, recommend action, automate execution. It's not just terminology; the entire UX is race-control-inspired."

### "What's next after the hackathon?"

> "Phase 1: Rovo integration, Bitbucket correlation, JSM SLA tracking. Phase 2: More automation playbooks like blocker swarming and sprint health checks. Phase 3: Marketplace packaging for enterprise adoption."

---

## Fallback Scenarios

### If Dashboard Doesn't Load

**Fallback:**
- Show project structure in IDE
- Walk through code architecture
- Show README.md with diagrams

### If Automation Fails

**Fallback:**
- Show confirmation message in UI
- Explain: "In demo mode, the action was logged. In production, it writes to Jira."
- Show `applySuggestion.js` code

### If Asked for Live Demo

**Response:**
> "This uses seeded telemetry for reliability. To show live data, I'd toggle `useSeededData = false` and deploy. The app queries real Jira issues, story points, and priorities."

---

## Timing Breakdown

| Segment | Time | Key Message |
|---------|------|-------------|
| Introduction | 0:10 | Racing-inspired execution control |
| Telemetry | 0:15 | Multi-signal monitoring (velocity, blockers, SLA) |
| Pit Engineer | 0:15 | AI recommends one next action |
| Automation | 0:10 | One-click application |
| Verify | 0:10 | Visible outcome in Jira |
| **Total** | **1:00** | Detect → Recommend → Automate → Verify |

---

## Judge Criteria Alignment

### ✅ Racing Theme

- Visual: Green/yellow/red flags, pit engineer, telemetry panels
- Functional: Race control decision-making model
- Narrative: F1 pit crew metaphor throughout

### ✅ Real Rovo Value

- Architecture: Drop-in Rovo integration (interface-stable)
- Current: Deterministic stub with explainable logic
- Future: Rovo AI for nuanced recommendations

### ✅ Forge-Native Architecture

- No external services required
- Event-driven (no polling)
- Forge Storage for lightweight snapshots
- Forge UI Kit for zero-latency rendering

### ✅ Closed-Loop Automation

- Visible Jira mutation (comment + label)
- Observable outcome in < 10 seconds
- Safe and reversible actions

---

## Post-Demo Follow-Up

**Provide:**
- GitHub repo link
- README.md (architecture + Devpost text)
- QUICKSTART.md (installation steps)
- INTEGRATION.md (Rovo + real data setup)

**Call to Action:**
> "Install it in 5 minutes with `forge deploy`. Customize the telemetry for your team. Swap in Rovo when available. And ship AI-orchestrated execution to your Atlassian teams."

---

🏁 **Race faster. Fail less. Win more.** 🏁
