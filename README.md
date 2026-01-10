# FinTracker & Rituals 🚀
**A Premium Personal Finance & Habit Optimization Dashboard.**

FinTracker is a high-performance mobile application built with React Native and Expo. It is designed to bridge the gap between financial health and daily habit tracking, featuring a "Secure Vault" interface that allows users to track liquidity, manage loans/debts, and maintain ritual consistency with a professional fintech aesthetic.

---

## 🛠 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React Native (Expo SDK 50+) |
| **State Management** | Zustand |
| **Backend** | Node.js (Express) |
| **Database** | MongoDB (Mongoose) |
| **Authentication** | Firebase Auth & JWT |
| **Date Logic** | Date-fns |

---

## ✨ Key Features

### 🏦 Financial Secure Vault
* **Liquidity Tracking:** Real-time visibility of total available balance with currency support (KES).
* **Exposure Management:** Integrated tracking for **Loans** (Assets out) and **Debts** (Liabilities) directly on the dashboard.
* **Privacy Mode:** One-tap "Eye" toggle to mask sensitive amounts instantly for safe use in public.
* **Purge Protocols:** Batch selection mode for financial goals to delete or archive multiple records without interruptions.

### 📅 Habit & Ritual Tracker
* **Frequency Scaling:** Intelligent progress tracking and percentages for **Daily, Weekly, and Monthly** habits.
* **Consistency Streaks:** Automatic "Fire" streak calculation based on completion logs.
* **Category Logic:** Specialized color-coding and icons for Career, Spiritual, Health, Financial, and Social rituals.
* **Instant Batch Actions:** Long-press to enter selection mode; mark multiple habits as "Completed" or "Active" (Undo) with a single tap.

---

## 🚀 Getting Started

### 1. Backend Setup
```bash
cd backend
npm install
# Create a .env file (see template below)
npm start
```


###2. Frontend Setup
```Bash

cd frontend
npm install
npx expo start
```


###3. Build & Optimization (APK Generation)
To build a production-ready APK with reduced size (optimizing the ~93MB baseline):

ProGuard: Enabled for code shrinking and obfuscation.

Asset Optimization: WebP image support for card backgrounds.

```Bash

eas build --platform android --profile preview
```
## 🔧 Critical Fixes & Stability
UI Bug Fix: Resolved the "white card" issue on deselection by implementing a ternary background color logic.

State Sync: Optimized FlatList with extraData props to ensure smooth UI updates during batch selection.

API Reliability: Corrected JSON parsing errors by ensuring proper Express route registration and JSON response headers.

## 🛡 License
Distributed under the MIT License.
