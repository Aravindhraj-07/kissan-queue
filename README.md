# ProcureX — Smart Mandi Queue & Digital Procurement Management Platform 🌾🚀

[![SIH 2026](https://img.shields.io/badge/SIH%202026-Problem%20Statement%2026032-15803D.svg)](https://www.sih.gov.in)
[![Domain](https://img.shields.io/badge/Domain-Agriculture%20%26%20Rural%20Development-166534.svg)](#)
[![Stack](https://img.shields.io/badge/Stack-React%20%7C%20Node.js%20%7C%20MongoDB%20%7C%20Socket.IO-0284C7.svg)](#)
[![Multilingual](https://img.shields.io/badge/Languages-English%20%7C%20%E0%AE%A4%E0%AE%AE%E0%AE%BF%E0%AE%B4%E0%AF%8D%20%7C%20%E0%A4%B9%E0%A4%BF%E0%A4%A8%E0%A5%8D%E0%A4%A6%E0%A5%80-15803D.svg)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict%20Mode-3178C6.svg)](#)
[![License](https://img.shields.io/badge/License-Government%20Open%20Access-EAB308.svg)](#)

> **Smart India Hackathon (SIH) 2026 — Problem Statement 26032**  
> **Domain:** Agriculture, Food Processing & Rural Development  
> **Platform:** Enterprise-Grade Web Application (Zero Mock Data • 100% Real Full-Stack Data Flow • Multilingual i18n)

---

## 🌾 Table of Contents
1. [Executive Summary & Problem Statement](#-executive-summary--problem-statement)
2. [Key Value Propositions](#-key-value-propositions)
3. [End-to-End System Workflow](#-end-to-end-system-workflow)
4. [Role-Based Portals & Core Modules](#-role-based-portals--core-modules)
5. [🌐 Full-Site Multilingual Support (English, Tamil, Hindi)](#-full-site-multilingual-support-english-tamil-hindi)
6. [🎨 UI/UX Government Design System & Navigation](#-uiux-government-design-system--navigation)
7. [Tech Stack Architecture](#-tech-stack-architecture)
8. [Repository Structure](#-repository-structure)
9. [Database Schema & Data Flow](#-database-schema--data-flow)
10. [Complete REST API Specification](#-complete-rest-api-specification)
11. [Installation & Setup Guide](#-installation--setup-guide)
12. [Default Demo Credentials & Role Routing](#-default-demo-credentials--role-routing)
13. [Automated Verification & 10/10 Test Suite](#-automated-verification--1010-test-suite)
14. [Offline Multi-Channel Feature (SMS & USSD)](#-offline-multi-channel-feature-sms--ussd)
15. [📄 Executive Pitching Guide & PDF Manual](#-executive-pitching-guide--pdf-manual)

---

## 📌 Executive Summary & Problem Statement

In traditional agricultural procurement markets (*Mandis* / APMCs), farmers face severe structural challenges:
- **Long physical waiting lines** lasting 18–48 hours outside Mandi gates with loaded tractors.
- **Yard bottlenecks & traffic congestion**, causing crop degradation, grain weight loss, and distress selling to middlemen.
- **Opaque procurement schedules**, leaving farmers uncertain about when their harvest will be weighed.
- **Manual token slips**, vulnerable to queue jumping, corruption, and record tampering.
- **Disjointed logistics**, leaving procured grains sitting in open Mandi yards exposed to rain before transport to state silos.

### 💡 The ProcureX Solution
**ProcureX** is a unified digital procurement and queue synchronization ecosystem designed for national scale:
1. **Atomic Concurrency Slot Booking:** Farmers book 2-hour procurement windows in advance, regulating physical gate traffic.
2. **Real-Time Digital Token Display:** Socket.IO pushes live queue updates so farmers only leave their village when their turn approaches.
3. **Electronic Weighbridge & Quality Grading:** Net scale weight and moisture % logged directly with automated MSP payout calculation.
4. **Direct Benefit Transfer (DBT) Logging:** Instant calculation and Aadhaar bank credit transaction vouchers with QR verification.
5. **Automated State Grain Logistics:** Weighment completion automatically dispatches grain transport tasks to state silos.
6. **2G Offline Feature Phone Access:** GSM SMS and interactive USSD (*999*26032#) gateways for non-smartphone farmers.
7. **Full-Site Multilingual Inclusivity:** Instant live switching across **English**, **Tamil (தமிழ்)**, and **Hindi (हिन्दी)**.
8. **Multi-Role Governance & Audit Trail:** Cryptographically logged immutable compliance trail for state directors.

---

## 🚀 Key Value Propositions

| Feature | Traditional Mandi Process | ProcureX Digital System |
| :--- | :--- | :--- |
| **Arrival Timing** | Unscheduled rush, days of waiting | Scheduled 2-hour window with confirmed token |
| **Queue Visibility** | Physical queue, standing in lines | Live digital display on phone, SMS broadcasts, WebSocket sync |
| **No-Show Handling** | Dead capacity & blocked slots | Automatic dynamic slot reallocation to waitlisted farmers |
| **Weighment & Payout** | Paper receipts, manual calculation | Digital e-slip with QR code & automated MSP DBT calculation |
| **Grain Logistics** | Delayed manual transport booking | Instant automated transport task creation upon weighment |
| **Offline Inclusivity** | Excluded from digital solutions | Full SMS & interactive USSD menu support (`*999*26032#`) |
| **Language Access** | English/Single-language barriers | Multi-language across every portal (**English, Tamil, Hindi**) |

---

## 🔄 End-to-End System Workflow

```mermaid
flowchart TD
    subgraph 1_Farmer_Lifecycle["1. Farmer Slot Booking"]
        A[Farmer Signs In / Registers] --> B[Discovers Nearest Mandi via GPS]
        B --> C[Selects Crop, Qty & 2-Hour Slot Window]
        C --> D[Atomic Slot Allocation & Token Issued]
    end

    subgraph 2_Live_Queue["2. Gate Arrival & Live Queue"]
        D --> E[Farmer Monitors Real-Time Live Queue]
        E --> F[Farmer Arrives at Gate & Checks In]
        F --> G[Mandi Operator Calls Next Token]
    end

    subgraph 3_Procurement_Scale["3. Weighbridge & Quality Inspection"]
        G --> H[Vehicle Drives onto Weighbridge]
        H --> I[Staff Records Net Weight & Moisture Level]
        I --> J[System Generates Digital e-Slip & QR Code]
        J --> K[Direct Benefit Transfer DBT Logged]
    end

    subgraph 4_Logistics_Transport["4. State Grain Logistics"]
        J --> L[Auto-Trigger: Transport Task Created in DB]
        L --> M[Logistics Dispatch Assigns Truck & Driver]
        M --> N[Status: In Transit to State Godown]
        N --> O[Delivery Verified at State Silo Hub]
    end

    subgraph 5_Admin_Oversight["5. State Oversight & Audit"]
        D -.-> P[Admin Live Analytics & Recharts]
        J -.-> P
        O -.-> P
        P --> Q[Cryptographic Immutable Audit Log Trail]
    end
```

---

## 🏢 Role-Based Portals & Core Modules

### 1. 👨‍🌾 Farmer Portal (`/farmer`)
- **Dashboard Overview:** Displays today's active token, live multi-step procurement timeline, total DBT earnings, and recent receipts.
- **Slot Booking Wizard (`/farmer/book`):** 3-step wizard with crop variety selection (Wheat, Paddy, Mustard, Maize, Cotton, Soybean), GPS nearest Mandi discovery, and real-time slot capacity meters.
- **Live Digital Queue (`/farmer/live-queue`):** Real-time Mandi gate display board showing currently serving tokens, arrived farmer list, and pulsating alert banner when the farmer's token is called.
- **Tokens & Receipts (`/farmer/history`):** Complete history of booked slots, cancel options, and official digital slips with QR codes.
- **Farmer Profile & DBT (`/farmer/profile`):** Aadhaar-linked bank details for DBT payments, village, district, state, and farm land area.

### 2. 🏢 Mandi Storage Authority Portal (`/storage`)
- **Operations Overview:** Daily throughput statistics, active scale tokens, gate arrival counts, and completed weighments.
- **Live Queue Operator Desk (`/storage/queue-desk`):** High-priority **"Call Next Farmer"** action button, gate arrival check-ins, and one-click no-show dynamic slot reallocation.
- **Weighbridge & Quality Inspection (`/storage/procurement`):** Weighbridge scale net quintals reading, moisture level inspection (FAQ standard < 12%), automated MSP total payout calculator, and digital e-slip issuance.
- **Slot Capacity Setup (`/storage/slots`):** Daily operating capacity configuration, custom time window creation, and live slot capacity adjusters (`+`/`-`).

### 3. 🚚 State Grain Logistics Portal (`/logistics`)
- **Real-Time Dispatches Board:** Automatically receives transport tasks triggered when Mandi operators complete farmer weighments.
- **Status Filter Tabs & Interactive Stat Cards:** Filter tasks by `ALL`, `READY FOR PICKUP`, `ASSIGNED`, `IN TRANSIT`, and `DELIVERED`.
- **Milestone Timeline:** Visual progress bar (`Ready for Pickup` $\to$ `Fleet Assigned` $\to$ `In Transit` $\to$ `Silo Delivered`).
- **Fleet Assignment & Modification Modal:** Input validation for truck registration number (e.g. `HR-05-CD-9988`), driver name, driver phone number, and destination godown with **"Edit Fleet"** capability.

### 4. 🏛️ State Administrator Command Centre (`/admin`)
- **Ecosystem Analytics (`/admin`):** High-contrast Recharts bar chart of crop volume distribution, state-wide total metric tons procured, total DBT disbursed, and slot utilization ratios.
- **Procurement Centres Management (`/admin/centres`):** Register and configure physical Mandi yards, GPS coordinates, and daily limits.
- **User Directory (`/admin/users`):** Stakeholder directory with search, role filters, and instant account activation/suspension toggles.
- **Immutable Audit Trail (`/admin/audit-logs`):** Paginated chronological audit logs capturing every user action, timestamp, role, and metadata snapshot.

---

## 🌐 Full-Site Multilingual Support (English, Tamil, Hindi)

Every section, form, modal, table header, button, status badge, and alert throughout ProcureX is localized via `react-i18next`:

* **English (`en`):** Default administrative language.
* **Tamil (`ta` - தமிழ்):** Authentic agricultural terminology (*கொள்முதல், எடை மேடை, நேர ஒதுக்கீடு, நேரடி வரிசை, DBT*).
* **Hindi (`hi` - हिन्दी):** Natural Hindi procurement terms (*ई-खरीद, धर्मकांटा, समय स्लॉट, लाइव कतार, समर्थन मूल्य*).
* **Language Switcher:** Accessible on top navbar, mobile drawer, login, registration, and landing pages with `localStorage` persistence (`procurex_lang`).

---

## 🎨 UI/UX Government Design System & Navigation

- **Color Hierarchy:** Conforms to a clean **Green + White + Yellow** government visual identity:
  - **Primary Green:** `#15803D` (Buttons, active states, key headers)
  - **Dark Green:** `#14532D` / `#166534` (Top government header bar, Mandi yard screens)
  - **Light Green Surface:** `#DCFCE7` / `#86EFAC` (Active step badges, verified indicators)
  - **Main Surface:** `#FFFFFF` (Cards, forms, tables, modals)
  - **Accent Yellow:** `#EAB308` / `#FEF9C3` (Alert callouts, token turn banners, used sparingly)
- **Collapsible Desktop Sidebar:** Smooth `w-64` $\leftrightarrow$ `w-20` transition with floating tooltips and `localStorage` persistence (`procurex_sidebar_state`).
- **Mobile Drawer:** Touch-friendly off-canvas drawer with backdrop dismiss.
- **Standardized Vector Icons:** Powered by **Lucide React** SVG icons with zero raw emojis.
- **Smart Role Routing:** 
  - Logging in immediately routes to the user's specific portal (`/farmer`, `/storage`, `/logistics`, `/admin`).
  - Logging out immediately redirects to the public home page (`/`).

---

## 🛠️ Tech Stack Architecture

```
┌────────────────────────────────────────────────────────┐
│                   CLIENT (React 18)                    │
│  • Vite 6 + TypeScript (Strict Mode)                   │
│  • Tailwind CSS (High-Contrast Gov Palette)            │
│  • react-i18next (English, Tamil, Hindi)               │
│  • Lucide React Icons (Zero Raw Emojis)                │
│  • Socket.IO Client (Real-time Queue & Notifications)  │
│  • Recharts (Crop Analytics & Metrics)                 │
│  • QRCode.React (Cryptographic e-Slip Validation)      │
└───────────────────────────┬────────────────────────────┘
                            │ REST APIs & WebSockets
┌───────────────────────────▼────────────────────────────┐
│                  SERVER (Node.js + Express)            │
│  • TypeScript + Express 4.19                           │
│  • Socket.IO 4.8 (Broadcast Room Queues)               │
│  • JWT Authentication + Bcrypt Hashing                 │
│  • Concurrency Slot Engine (Atomic Counter Updates)    │
│  • Immutable Compliance Audit Logger                   │
└───────────────────────────┬────────────────────────────┘
                            │ Mongoose ODM
┌───────────────────────────▼────────────────────────────┐
│                  DATABASE (MongoDB Atlas)              │
│  • Users, Centres, Slots, Bookings, Produce            │
│  • Procurements, TransportTasks, AuditLogs             │
└────────────────────────────────────────────────────────┘
```

---

## 📁 Repository Structure

```
kissan-queue/
├── client/                                 # Frontend React 18 + Vite Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/                     # Standardized Component Library
│   │   │   │   ├── Badge.tsx               # Status badge with Lucide vector icons
│   │   │   │   ├── Button.tsx              # Reusable button with active press feedback
│   │   │   │   ├── DigitalSlipModal.tsx    # Printable e-Procurement receipt modal
│   │   │   │   ├── EmptyState.tsx          # High-contrast empty states
│   │   │   │   ├── ErrorState.tsx          # Error boundary with retry handler
│   │   │   │   ├── LanguageSelector.tsx    # Language switcher component
│   │   │   │   ├── LoadingState.tsx        # Skeleton loaders & spinners
│   │   │   │   ├── MobileDrawer.tsx        # Responsive mobile off-canvas drawer
│   │   │   │   ├── Navbar.tsx              # Gov header strip, notifications, IST clock
│   │   │   │   ├── PageHeader.tsx          # Consistent page headers
│   │   │   │   ├── Sidebar.tsx             # Role-based collapsible sidebar
│   │   │   │   ├── StatCard.tsx            # High-contrast metric cards
│   │   │   │   └── Timeline.tsx            # Multi-step progress timeline
│   │   │   ├── simulator/
│   │   │   │   └── SmsUssdSimulatorModal.tsx # Offline feature phone simulator
│   │   ├── context/
│   │   │   ├── AuthContext.tsx             # JWT auth & role-based redirection
│   │   │   └── SocketContext.tsx           # Real-time WebSocket subscriptions
│   │   ├── i18n/
│   │   │   ├── index.ts                    # i18n configuration
│   │   │   └── locales/                    # English, Tamil, Hindi dictionaries
│   │   │       ├── en.json
│   │   │       ├── ta.json
│   │   │       └── hi.json
│   │   ├── pages/
│   │   │   ├── admin/                      # State Admin Portal Pages
│   │   │   ├── auth/                       # Login & Registration Pages
│   │   │   ├── farmer/                     # Farmer Portal Pages
│   │   │   ├── landing/                    # Public Landing & Token Lookup
│   │   │   ├── logistics/                  # Logistics Fleet Management Page
│   │   │   └── storage/                    # Storage Authority / Mandi Desk Pages
│   │   ├── services/
│   │   │   └── api.ts                      # Axios API service client
│   │   ├── types/
│   │   │   └── index.ts                    # TypeScript data definitions
│   │   ├── App.tsx                         # Router with Protected Routes
│   │   ├── index.css                       # Tailwind directives & micro-interactions
│   │   └── main.tsx                        # Entry point
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── server/                                 # Backend Node.js + Express Application
│   ├── src/
│   │   ├── config/                         # MongoDB connection & environment loader
│   │   ├── controllers/                    # Route handlers (Auth, Bookings, Queue, etc.)
│   │   ├── middleware/                     # JWT auth & role-based access control
│   │   ├── models/                         # Mongoose Models (9 Schema Definitions)
│   │   ├── routes/                         # Express API route declarations
│   │   ├── scripts/
│   │   │   ├── seed.ts                     # Database seeder with realistic Punjab/Haryana Mandis
│   │   │   └── test-real-flow.ts           # 10-step automated end-to-end integration test
│   │   ├── services/                       # Business logic (Slots, Queue, Logistics, DBT)
│   │   ├── types/                          # Backend TypeScript interfaces
│   │   └── index.ts                        # Server entry point & Socket.IO server
│   ├── package.json
│   └── tsconfig.json
│
├── scripts/
│   └── generate_pitch_pdf.py               # Python ReportLab pitch manual generator
├── ProcureX_Pitching_Guide_and_Platform_Manual.pdf # Official Pitch Deck & Guide
├── .env                                    # MongoDB URI & JWT Secret Configuration
└── README.md                               # Project documentation
```

---

## 🗄️ Database Schema & Data Flow

| Model | Collection | Key Fields | Description |
| :--- | :--- | :--- | :--- |
| **`User`** | `users` | `name`, `phone`, `role`, `password`, `status` | Stores Farmers, Mandi Authorities, Logistics, and Admins |
| **`ProcurementCentre`** | `procurementcentres` | `name`, `centreCode`, `location`, `capacityPerDay` | Physical Mandi yards and geographic coordinates |
| **`Slot`** | `slots` | `centreId`, `date`, `startTime`, `endTime`, `capacity`, `bookedCount` | Atomic time slot windows regulating gate intake |
| **`Booking`** | `bookings` | `tokenNumber`, `farmerId`, `centreId`, `slotId`, `status` | Digital booking records with queue states |
| **`Produce`** | `produces` | `farmerId`, `cropType`, `quantity`, `qualityGrade` | Produce declarations tied to bookings |
| **`Procurement`** | `procurements` | `digitalSlipNumber`, `actualQuantity`, `moisturePercent`, `mspPricePerQuintal`, `totalPayout` | Weighbridge transaction records with MSP DBT calculation |
| **`TransportTask`** | `transporttasks` | `procurementId`, `vehicleNumber`, `driverName`, `status`, `destinationWarehouse` | Logistics dispatches from Mandi to State Silos |
| **`AuditLog`** | `auditlogs` | `action`, `actorId`, `actorRole`, `entityType`, `metadata`, `timestamp` | Cryptographically logged immutable compliance trail |
| **`Notification`** | `notifications` | `recipientId`, `title`, `message`, `type`, `read` | In-app alerts and SMS message logs |

---

## 📡 Complete REST API Specification

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new farmer account.
- `POST /api/auth/login` — Authenticate user, receive JWT token, and route by role.
- `GET /api/auth/me` — Retrieve current authenticated user profile.

### Procurement Centres (`/api/centres`)
- `GET /api/centres` — List all Mandi centres (supports GPS coordinate distance sorting).
- `GET /api/centres/:id` — Retrieve specific centre details and operating hours.
- `POST /api/centres` — Create a new procurement centre (*Admin only*).

### Slots & Capacity (`/api/slots`)
- `GET /api/slots/centre/:centreId?date=YYYY-MM-DD` — Retrieve available time slot windows.
- `POST /api/slots` — Create custom time slots (*Storage Authority / Admin*).
- `PATCH /api/slots/:id` — Update slot capacity.

### Bookings & Tokens (`/api/bookings`)
- `POST /api/bookings` — Atomically book a slot, generate digital token, and record produce.
- `GET /api/bookings/my` — Retrieve authenticated farmer's booking history.
- `GET /api/bookings/centre/:centreId` — Retrieve all bookings for a Mandi yard.
- `GET /api/bookings/token/:tokenNumber` — Public live token lookup.
- `PATCH /api/bookings/:id/cancel` — Cancel a booking and release slot capacity.

### Live Queue Engine (`/api/queue`)
- `GET /api/queue/:centreId` — Fetch real-time live queue board for a Mandi.
- `POST /api/queue/call-next` — Broadcast next token call to Weighbridge Scale 1.
- `PATCH /api/queue/mark-arrived/:bookingId` — Mark farmer as arrived at the gate.
- `PATCH /api/queue/mark-no-show/:bookingId` — Mark farmer as no-show and reallocate slot.

### Procurement & Weighbridge (`/api/procurement`)
- `POST /api/procurement` — Record net weighbridge weight, moisture %, issue digital slip, and trigger logistics.
- `GET /api/procurement/:id` — Retrieve digital slip details.
- `GET /api/procurement/farmer/:farmerId` — Retrieve all digital slips for a farmer.

### Logistics & Fleet (`/api/logistics`)
- `GET /api/logistics/tasks` — Retrieve live transport dispatch tasks.
- `PATCH /api/logistics/tasks/:id/assign` — Assign/Edit vehicle registration number and driver.
- `PATCH /api/logistics/tasks/:id/status` — Update transport status (`IN_TRANSIT`, `DELIVERED`).

### State Administration (`/api/admin`)
- `GET /api/admin/stats` — Retrieve aggregated state metrics and crop distribution data.
- `GET /api/admin/users` — Retrieve paginated user directory with role filters.
- `PATCH /api/admin/users/:id/status` — Suspend or activate a user account.
- `GET /api/admin/audit-logs` — Retrieve chronological immutable system audit logs.

### Offline Simulator (`/api/simulator`)
- `POST /api/simulator/sms` — Simulate 2G SMS booking gateway.
- `POST /api/simulator/ussd` — Simulate interactive USSD session (`*999*26032#`).

---

## 💻 Installation & Setup Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) or local MongoDB instance (v6.0+)
- `npm` or `yarn`

### 1. Clone the Repository
```bash
git clone https://github.com/Aravindhraj-07/kissan-queue.git
cd kissan-queue
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/procurex?retryWrites=true&w=majority
JWT_SECRET=procurex_sih2026_super_secret_jwt_key_production_grade
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

### 3. Install Dependencies
```bash
# Install root, client, and server dependencies
npm run install:all
```

### 4. Seed the Database
Populate initial Mandis (Karnal, Panipat, Kurukshetra, Ambala), produce types, slot schedules, and verified accounts:
```bash
npm run seed:server
```

### 5. Run the Application
Start both the Express backend and Vite frontend concurrently:
```bash
npm run dev
```

- **Frontend Client:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000](http://localhost:5000)
- **Render Cloud Backend:** `https://kissan-queue.onrender.com`

---

## 🔑 Default Demo Credentials & Role Routing

The system includes pre-configured stakeholder accounts that automatically route to their dedicated portal:

| Role | Name | Login Phone / Email | Password | Direct Portal Route |
| :--- | :--- | :--- | :--- | :--- |
| **👨‍🌾 Farmer** | Sardar Gurpreet Singh | `9876500001` or `farmer@procurex.gov.in` | `Password@123` | ➡️ **`/farmer`** |
| **🏢 Mandi Authority** | Shri Om Prakash (Secretary) | `9999900002` or `authority@procurex.gov.in` | `Password@123` | ➡️ **`/storage`** |
| **🚚 Logistics Fleet** | State Grain Fleet Cell | `9999900004` or `logistics@procurex.gov.in` | `Password@123` | ➡️ **`/logistics`** |
| **🏛️ State Admin** | Dr. Rajiv Malhotra (IAS) | `9999900001` or `admin@procurex.gov.in` | `Admin@123` | ➡️ **`/admin`** |
| **✨ New Registration** | *Any Farmer* | *Direct registration at `/register`* | *Custom* | ➡️ **`/farmer`** |

---

## 🧪 Automated Verification & 10/10 Test Suite

ProcureX includes a comprehensive automated test script (`server/src/scripts/test-real-flow.ts`) that executes an entire 10-step lifecycle against live MongoDB collections:

```bash
cd server
npx tsx src/scripts/test-real-flow.ts
```

```
================================================================
  🌾 PROCUREX REAL END-TO-END DATA FLOW VERIFICATION
  (Farmer -> Produce -> Booking -> Queue -> Procurement -> Logistics -> Silo)
================================================================

1️⃣ Checking API Health ................................... ✅ PASSED (Status: OK)
2️⃣ [FARMER] Registering new farmer in MongoDB .......... ✅ PASSED (Harbhajan Singh)
3️⃣ [FARMER] Locating nearest Mandi & fetching slots .... ✅ PASSED (Karnal Grain Market PC-KNL-01)
4️⃣ [FARMER] Atomic Booking & Produce Declaration ....... ✅ PASSED (Token: TK-PCK-0021)
5️⃣ [STORAGE] Mandi Secretary logs in & views queue ..... ✅ PASSED (Token verified in live DB)
6️⃣ [STORAGE] Gate check-in & token callout ............. ✅ PASSED (Called to Weighbridge Scale 1)
7️⃣ [STORAGE] Electronic Weighbridge & DBT Slip ......... ✅ PASSED (Slip: PRC-307295-644, ₹1,05,787.5)
8️⃣ [LOGISTICS] Retrieving live dispatch tasks .......... ✅ PASSED (18 Real Tasks in DB)
9️⃣ [LOGISTICS] Fleet Assignment & Milestone Transitions . ✅ PASSED (ASSIGNED -> IN_TRANSIT -> DELIVERED)
🔟 [ADMIN] State Administrator verifies audit logs ...... ✅ PASSED (67.3 MT & Audit Trail verified)

================================================================
  🎉 100% REAL END-TO-END DATA FLOW VERIFIED ACROSS ALL ROLES!
================================================================
```

---

## 📱 Offline Multi-Channel Feature (SMS & USSD)

Recognizing that many rural farmers use basic 2G feature phones without 4G mobile internet, ProcureX incorporates an offline interaction gateway:

### SMS Commands
- **Book Slot:** `BOOK <CENTRE_CODE> <CROP> <QTY_IN_QUINTALS>`
  - *Example:* `BOOK PC-KNL-01 Wheat 25`
- **Check Status:** `STATUS <TOKEN_NUMBER>`
  - *Example:* `STATUS TK-KNL-0002`

### USSD Navigation (`*999*26032#`)
- **Step 1:** Dial `*999*26032#`
- **Step 2:** Select Option `1. Book Procurement Slot` or `2. Check Live Queue Status`
- **Step 3:** Enter Mandi Centre Code & Harvest Quantity
- **Step 4:** Instant SMS confirmation containing Token Number & time window is dispatched.

---

## 📄 Executive Pitching Guide & PDF Manual

A complete presentation-ready PDF manual has been compiled and is included in the root directory:
* 📄 **File:** [`ProcureX_Pitching_Guide_and_Platform_Manual.pdf`](./ProcureX_Pitching_Guide_and_Platform_Manual.pdf)
* **Includes:**
  - 5-Minute Pitch Deck narrative for Hackathon Finalists & Government Panels
  - 10 Pro-Tips for Jury Q&A and technical defense
  - Step-by-step live demo sequence across all 4 roles
  - Architectural differentiator breakdowns
* **Re-generation:** Generated via `python scripts/generate_pitch_pdf.py`.

---

## 📜 Government Compliance & Standards

- **SIH 2026 Problem Statement 26032 Compliance:** Directly targets Mandi queue management, slot booking, digital tokens, live alerts, and dynamic reallocation.
- **Accessibility & Usability:** High-contrast color hierarchy conforming to WCAG AA guidelines with zero low-contrast text.
- **Security & Data Integrity:** Passwords encrypted using Bcrypt with salt rounds, JWT session tokens, and immutable audit trails for complete government transparency.

---

**Developed for Smart India Hackathon 2026** • *Ministry of Agriculture & Farmers Welfare, Government of India*