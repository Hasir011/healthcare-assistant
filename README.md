# 🩺 Healthcare Assistant

> **Your simple companion for managing everyday health routines.**  
> A modern, clean, and responsive single-page healthcare assistant web application built with vanilla web technologies for a college mini-project.

[![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)](LICENSE)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Storage](https://img.shields.io/badge/Storage-LocalStorage-0D9488?style=flat)](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
[![Deployment](https://img.shields.io/badge/Deploy-GitHub_Pages-22c55e?style=flat&logo=github)](https://pages.github.com/)

---

## 🌐 Live Demo

🔗 **Live Deployment:** `https://hasir011.github.io/healthcare-assistant/`  
*(Replace `<your-username>` with your GitHub username once deployed)*

---

## 📌 Project Overview

**Healthcare Assistant** seamlessly bridges two key aspects of digital personal healthcare:
1. **Interactive Routine Management Tools:** Medication reminders with in-app audio-visual notifications, countdown timers for hydration and exercise, a BMI calculator with visual spectrum indicators, and an automated daily health dashboard.
2. **Educational & Awareness Resources:** Well-structured, read-only healthcare guides covering nutrition, sleep, physical activity, common conditions, first-aid techniques, and verified emergency helpline contacts.

All user data stays private and persists directly on the user's browser using `localStorage` without requiring third-party databases or mandatory login barriers.

---

## ✨ Features Breakdown

### 🛠️ Interactive Health Management (Functional Tools)

| Feature | Capabilities |
| :--- | :--- |
| **💊 Medicine Reminder** | • Add, edit, and delete medications with dosages and scheduled times<br>• Real-time scheduled alert system with Web Audio API sound alerts<br>• Mark doses as **Taken** or **Missed** with instant schedule updates<br>• Modal with Snooze, Taken, and Dismiss actions |
| **💧 Hydration Tracker** | • Customizable intervals (15 min to 2 hours) with countdown timer<br>• Dynamic daily glass goal tracking (6 to 12 glasses)<br>• One-click increment/decrement with visual animated progress bar |
| **🏃 Exercise Timer & Log** | • Activity selector (Walking, Yoga, Cardio, etc.) with custom durations<br>• Real-time countdown timer with Pause/Resume/Reset controls<br>• Completed activity logs synced with daily target minutes |
| **⚖️ BMI Calculator** | • Instant Body Mass Index calculation based on height (cm) and weight (kg)<br>• Classification into Underweight, Normal, Overweight, or Obese<br>• Dynamic visual spectrum gradient indicator bar with pointer |
| **📊 Daily Health Dashboard** | • Real-time dynamic greeting (Morning, Afternoon, Evening, Night)<br>• 4 live summary cards (Meds, Water, Exercise, BMI)<br>• Chronological unified daily schedule with visual status pills<br>• Overall daily health routine completion percentage indicator |

### 📖 Educational & Emergency Awareness (Read-Only Guides)

| Section | Content Highlights |
| :--- | :--- |
| **🥗 Health Tips** | Evidence-based lifestyle guidelines for nutrition, hydration, exercise, sleep hygiene, and stress management. |
| **🩺 Common Health Conditions** | Educational overviews of Diabetes, Hypertension, Obesity, Vitamin Deficiencies, and lifestyle factors. |
| **🚨 Emergency Information** | Verified emergency contact directory for India (112, 100, 101, 102/108, 1091, 1098, iCALL) and step-by-step first-aid protocols (Cuts, Burns, Fainting, Choking). |
| **ℹ️ About the Project** | Scope, academic objectives, architecture details, and open-source licensing. |

---

## 🎨 Design System & UI/UX

Inspired by modern clinical and wellness user interfaces:

- **Primary Brand Color:** `#0D9488` (Medical Teal) & `#14B8A6` (Light Teal Gradient)
- **Emergency Accent:** `#E76F51` (Coral Alert)
- **Status Indicators:** 
  - ✅ Success / Taken: `#10B981` (Emerald Green)
  - ⏳ Pending / Upcoming: `#F59E0B` (Amber)
  - ⚠️ Missed: `#EF4444` (Rose Red)
- **Typography:** `Inter`, system fallback sans-serif stack
- **Components:** Card-based layouts with `16px` border radii, subtle shadows (`0 1px 3px rgba(0,0,0,0.08)`), and responsive CSS grid/flexbox.

---

## 📁 Repository Structure

```plaintext
healthcare-assistant/
│
├── index.html          # Core Single-Page Application (SPA) structure & modals
├── .gitignore          # Excludes OS and editor cache files
├── LICENSE             # MIT Open-Source License
├── README.md           # Professional project documentation & setup guide
│
├── css/
│   └── styles.css      # CSS3 custom properties, design system & media queries
│
└── js/
    └── app.js          # Client-side routing, LocalStorage manager, timers & alarms
```

---

## 🚀 Getting Started Locally

No complex dependencies, package managers, or build steps required!

### Option 1: Direct Browser Launch
1. Clone or download the repository.
2. Double-click `index.html` or open it in any modern browser (Chrome, Edge, Firefox, Safari).

### Option 2: Local Development Server (Recommended)
If using VS Code:
1. Install the **Live Server** extension.
2. Right-click `index.html` and select **"Open with Live Server"**.

Or via Python:
```bash
# Python 3
python -m http.server 8000
```
Then visit `http://localhost:8000` in your browser.

---

## 🚢 Deploying to GitHub Pages (Step-by-Step)

1. Create a new repository on GitHub named `healthcare-assistant`.
2. Push or upload all repository files (`index.html`, `css/`, `js/`, `README.md`, `LICENSE`, `.gitignore`).
3. In your GitHub repository, click **Settings** (top tabs).
4. Navigate to **Pages** in the left sidebar (under "Code and automation").
5. Under **Build and deployment > Branch**:
   - Source: **Deploy from a branch**
   - Branch: select `main` (or `master`)
   - Folder: `/ (root)`
   - Click **Save**.
6. Wait 1–2 minutes. GitHub will display:
   > *"Your site is live at `https://<username>.github.io/healthcare-assistant/`"*

---

## 🔒 Privacy & Architecture Highlights

- **Zero-Cloud Dependency:** 100% of user entries stay on the client's device using HTML5 `localStorage`.
- **Lightweight & Fast:** Zero heavy JavaScript frameworks or bloated bundles — loads in sub-seconds.
- **Web Audio Synthesis:** Sound reminders generated via the native Web Audio API (`AudioContext`) — no external MP3 dependencies.
- **Responsive Layout:** Optimized for mobile phones, tablets, and desktop displays.

---

## ⚠️ Academic & Medical Disclaimer

> **IMPORTANT:**  
> This Healthcare Assistant web application is developed strictly as an **educational college mini-project** to demonstrate frontend software development, client-side routing, local data persistence, and interactive user interface design.  
> 
> **It does not provide medical diagnoses, treatment recommendations, or clinical advice.**  
> Users experiencing serious symptoms or medical emergencies should contact qualified healthcare professionals and emergency response services immediately.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) - see the LICENSE file for details.
