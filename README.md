# TRACEBACK AI
> **“Find what you've lost. Prove what is yours.”**  
> *An AI-Powered Campus Lost & Found Assistant that turns vague clues into intelligent recovery.*

---

## 🏆 Project Overview

**TraceBack AI** is a next-generation campus-wide intelligent lost-and-found platform. Traditional lost-and-found noticeboards and keyword searches fail because owners and finders use vastly different vocabularies to describe the same item (e.g., *"I lost a dark green water bottle near the library"* vs *"Found an olive insulated metal flask on 2nd floor desk"*).

TraceBack AI solves this by converting unstructured reports into normalized **AI Item Fingerprints** and executing a 5-factor weighted evidence model:
1. **Visual Similarity (30%)**: Color profile, texture, and silhouette geometry.
2. **Semantic Description (25%)**: Multimodal embedding cosine similarity.
3. **Distinctive Features (20%)**: Logos, stickers, scratches, decals, and accessories.
4. **Location Proximity (15%)**: Campus sector graph and proximity matrix.
5. **Time Proximity (10%)**: Temporal decay windows between loss and discovery.

It acts as an **intelligent digital detective**:
- Visualizes an interactive **Evidence Constellation** graph.
- Triggers **AI Detective Mode** to formulate the single targeted question that breaks candidate ambiguity and animates live ranking changes.
- Implements **Zero-Knowledge Ownership Verification** with protected private clues.
- Empowers campus security and staff with full operational claim reviews, handover management, and celebration certificates.
- Features an **Interactive Campus Heatmap** and executive administrative analytics.

---

## 🚀 Key Features

| Feature | Description |
| :--- | :--- |
| **AI Item Fingerprint** | Structured forensic evidence dossier detailing object type, brand, colors, materials, silhouettes, and unique surface marks without hallucination. |
| **5-Factor Matching Model** | Explainable $Score = 0.30V + 0.25S + 0.20F + 0.15L + 0.10T$ with supporting checks (`✓`) and conflicting alerts (`!`). |
| **AI Detective Mode** | Signature disambiguation engine that asks one targeted question (YES / NO / I DON'T KNOW) to dynamically recalibrate candidate scores. |
| **Evidence Constellation** | Interactive animated SVG graph linking candidate items to 5 radiating evidence factor nodes with flowing energy particles. |
| **Comparative Dossier** | Side-by-side forensic cross-examination comparing the owner's report directly against the found item with connecting similarity bars. |
| **Zero-Knowledge Claims** | Owners record secret private clues (e.g. engravings, wallpaper, decals) that are never exposed publicly. Claimants prove ownership blindly. |
| **Staff Ops & Handover** | Operational dashboard for dispatch officers to approve or reject claims with recorded rationales, execute handovers, and trigger celebration modals. |
| **Interactive Campus Heatmap** | 10-zone SVG campus map displaying loss densities, recovery rates, and safety hotspots. |
| **Natural Language Search** | Translates natural English queries (*"black bottle found near library yesterday"*) into structured entity chips and matched items. |
| **Accountable Audit Trail** | Immutable chronological ledger of every report, fingerprint, claim, review, and handover event. |

---

## 🛠️ Tech Stack & Architecture

- **Frontend**:
  - React 19 + TypeScript
  - Tailwind CSS v4 (Glassmorphic Midnight Navy & Electric Cyan design system)
  - Lucide React (Forensic iconography)
  - Canvas Confetti (Celebratory handover animations)
  - Vite 8.3
- **Backend**:
  - Python 3.11 + FastAPI
  - Uvicorn (ASGI web server)
  - Pydantic v2 (Strict forensic schemas)
  - HTTPX & Multimodal AI Clients
  - Python-Multipart (Secure photo uploads)
- **Database & Storage**:
  - Thread-safe persistent JSON repository (`backend/data/traceback_store.json`) with atomic file writes
  - Local static upload storage (`backend/uploads/`)
  - Ready for Supabase PostgreSQL + `pgvector` cloud sync
- **AI Engine**:
  - Primary: Google Gemini 2.0 Flash multimodal API
  - Fallback: **TraceBack Intelligence • Demo Engine** (High-fidelity heuristic NLP and 64-dimensional vector embeddings, requiring **zero API keys** to run out of the box!)

---

## 👥 Demo Personas (1-Click Switcher)

TraceBack AI includes 3 pre-seeded role personas with full data:

| Persona | Role | Email | Password | Responsibilities |
| :--- | :--- | :--- | :--- | :--- |
| **Alex Rivera** | `student` | `student@traceback.demo` | `password123` | Reports lost items, answers Detective probes, files claims |
| **Officer Marcus Vance** | `staff` | `staff@traceback.demo` | `password123` | Custody intake, reviews claims, executes handovers |
| **Dr. Sarah Chen** | `admin` | `admin@traceback.demo` | `password123` | Institutional analytics, campus heatmaps, audit trail |

*Tip: Click the user menu in the top-right corner of the app to switch personas instantly with one click.*

---

## 📂 Project Directory Structure

```text
antrigravity/
├── backend/
│   ├── app/
│   │   ├── api/             # FastAPI REST endpoints
│   │   │   ├── auth.py          # Session auth & demo accounts
│   │   │   ├── lost_items.py    # 6-step reporting & protected clues
│   │   │   ├── found_items.py   # Intake & reverse matching
│   │   │   ├── ai.py            # Fingerprinting, matching, Detective Mode
│   │   │   ├── claims.py        # Zero-knowledge claims & handovers
│   │   │   ├── analytics.py     # KPIs, recovery funnel & timeline
│   │   │   ├── heatmap.py       # 10 campus zones & incident density
│   │   │   ├── notifications.py # Real-time forensic alerts
│   │   │   ├── audit_logs.py    # Immutable accountability log
│   │   │   └── upload.py        # Secure image file uploads
│   │   ├── ai/              # Modular AI engines
│   │   │   ├── fingerprint_service.py # Multimodal extractor
│   │   │   ├── matching_service.py    # 5-factor weighted model
│   │   │   ├── detective_service.py   # Disambiguation & re-ranking
│   │   │   ├── verification_service.py# Private clue evaluation
│   │   │   └── embedding_service.py   # 64-dim vector similarity
│   │   ├── models/schemas.py# Pydantic data contracts
│   │   ├── services/
│   │   │   ├── database.py      # Thread-safe persistent store
│   │   │   └── seed_data.py     # Pre-loaded realistic campus scenarios
│   │   ├── config.py        # Settings & demo engine detection
│   │   └── main.py          # FastAPI application & CORS
│   ├── data/                # Persistent JSON database
│   ├── uploads/             # Stored item photos
│   ├── requirements.txt     # Python dependencies
│   ├── run_backend.py       # Uvicorn startup runner
│   └── test_api_endpoints.py# 18-step integration test suite
├── src/
│   ├── components/
│   │   ├── common/          # Signature reusable UI components
│   │   │   ├── TraceScoreRing.tsx       # Animated circular meter
│   │   │   ├── FingerprintCard.tsx      # Evidence dossier card
│   │   │   ├── EvidenceConstellation.tsx# Interactive SVG graph
│   │   │   ├── MatchComparisonModal.tsx # Side-by-side modal
│   │   │   ├── PrivateClueBadge.tsx     # Zero-knowledge clue guard
│   │   │   ├── RecoveryTimeline.tsx     # 7-stage lifecycle stepper
│   │   │   ├── CampusHeatmapWidget.tsx  # 10-zone SVG heatmap
│   │   │   ├── RecoveryCelebration.tsx  # Confetti completion modal
│   │   │   └── DemoEngineStatusBadge.tsx# Subtle AI engine badge
│   │   ├── investigation/
│   │   │   ├── DetectiveConsole.tsx     # AI Detective interrogation
│   │   │   └── NaturalSearchBar.tsx     # Natural English query parser
│   │   └── layout/          # Navbar, Footer
│   ├── context/
│   │   ├── AuthContext.tsx         # User session & 1-click switcher
│   │   └── NotificationContext.tsx # Real-time notification drawer
│   ├── pages/
│   │   ├── LandingPage.tsx         # Product hero & pipeline overview
│   │   ├── StudentDashboard.tsx    # Personalized student home
│   │   ├── ReportLostWizard.tsx    # 6-step reporting wizard
│   │   ├── ReportFoundWizard.tsx   # Found item intake form
│   │   ├── MatchResultsPage.tsx    # Ranked candidates & Evidence Graph
│   │   ├── FoundItemsExplorer.tsx  # Public inventory & claim dialog
│   │   ├── ClaimsPage.tsx          # Student claim status tracker
│   │   ├── StaffDashboard.tsx      # Dispatch officer operations
│   │   ├── AdminAnalyticsPage.tsx  # Institutional charts & funnel
│   │   ├── MyReportsPage.tsx       # Detailed case timelines
│   │   ├── CampusMapPage.tsx       # Full campus geospatial matrix
│   │   └── ProfilePage.tsx         # User identity card & stats
│   ├── services/api.ts      # Typed REST client
│   ├── types/index.ts       # Domain TypeScript contracts
│   ├── App.tsx              # Main application router
│   ├── main.tsx             # React DOM entry
│   └── index.css            # Tailwind CSS styling & animations
├── .env.example
├── package.json
└── vite.config.ts
```

---

## ⚡ Quick Start & Setup Instructions

### 1. Prerequisites
- **Node.js** v18+ (tested on v22)
- **Python** 3.10+ (tested on Python 3.11)

### 2. Backend Setup
```powershell
# Navigate to project root
cd c:\Users\ADMIN\Documents\antrigravity

# Install backend dependencies
pip install -r backend/requirements.txt

# Run integration test suite (optional but verifies all 18 endpoints)
python backend/test_api_endpoints.py

# Start the FastAPI server (runs on http://127.0.0.1:8000)
python backend/run_backend.py
```
*Interactive Swagger API documentation is available at `http://127.0.0.1:8000/docs`.*

### 3. Frontend Setup
```powershell
# In a new terminal tab at project root
npm install

# Start Vite development server (runs on http://localhost:5173)
npm run dev
```

---

## 🧪 Interactive Hackathon Demo Flow (Step-by-Step)

Follow this 2-minute workflow to demonstrate the full power of TraceBack AI:

1. **Open the App**:
   - Visit `http://localhost:5173`. Notice the subtle status badge: `"TraceBack Intelligence • Demo Engine"`.
2. **Student Dashboard**:
   - You are logged in as **Alex Rivera** (CS Undergrad).
   - Under *Active Investigations*, click **Inspect** on the **Hydro Flask Insulated Water Bottle**.
3. **Inspect Match & Evidence Graph**:
   - Observe **#01 Candidate** (88% Match confidence).
   - Click **Inspect Evidence Graph** to view the **Evidence Constellation** SVG connecting Visual (95%), Semantic (93%), Distinctive (55%), Location (92%), and Time (85%).
   - Click **Compare Side-by-Side** to inspect the comparative dossier with the shielded private clue.
4. **Trigger AI Detective Mode**:
   - Look at the top *TRACEBACK DETECTIVE MODE* panel.
   - The detective asks: *“Do you remember whether your bottle has small white sticker near base?”*
   - Click **YES**.
   - Watch the animated re-evaluation: Candidate #1 receives a confidence boost to **91%** and locks into #1!
5. **Submit a Zero-Knowledge Claim**:
   - Click **Claim This Item**.
   - In the modal, provide identifying evidence: *"It has a circular white NASA decal near the base and a minor scratch under the logo."*
   - Click **Submit Claim**. Notice the instant AI Verification Confidence: **98%**!
6. **Switch to Staff Persona (1 Click)**:
   - Click Alex's avatar in the top-right and select **Staff: Marcus Vance**.
   - Navigate to **Staff Operations**.
   - Under *Pending Claims*, click **Review & Decide**.
   - Select **Approve Claim**, note *"Confirmed NASA decal matches custody vault item"*, and commit decision.
7. **Execute Handover & Celebrate**:
   - Switch to the **Handover Queue** tab.
   - Click **Mark as Handed Over**.
   - 🎉 **Boom!** A celebratory confetti explosion triggers with *"ITEM RECOVERED ✓ — Another trace completed."*
8. **Inspect Institutional Impact**:
   - Switch to **Admin: Dr. Sarah Chen**.
   - Click **Analytics** to view the live recovery rate update, category bar charts, and the **Campus Heatmap**.
   - Click **Audit Trail** to inspect the immutable forensic event log.

---

## 🔒 Security & Privacy Guarantees

- **Zero-Knowledge Private Clues**: Owner-provided private clues are never returned to unauthenticated users or competing claimants. Only authorized staff and the internal AI verification model have visibility during disputes.
- **Role-Based Access Control**: Strict client and server-side authorization separating Students, Campus Dispatch Staff, and Administrators.
- **Fail-Safe Simulation Engine**: The system operates with 100% functionality even during internet or AI API outages, preventing student report loss.
- **Audit Logging**: Every report creation, claim decision, and physical item handover is permanently linked to an authenticated actor ID, timestamp, and audit metadata.

---

## 📄 License
Academic / Hackathon Project — Built with pride by **Team Zentrix** (October 2026).
