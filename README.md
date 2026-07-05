# AttriSense AI — Employee Attrition Prediction System

[![License](https://img.shields.95460.svg/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![Phase](https://img.shields.io/badge/Status-Phase%201%20Completed-emerald.svg)](ROADMAP.md)
[![Stack](https://img.shields.io/badge/Stack-React%20%7C%20Flask%20%7C%20MongoDB%20%7C%20Scikit--Learn-indigo.svg)](#tech-stack)

AttriSense AI is an enterprise-grade **Employee Attrition Prediction System** that translates organizational, financial, and occupational factors into predictive retention-risk evaluations. Designed for HR analysts and people operations managers, it helps companies proactively detect turnover trends and model cost-effective retention paths using production-quality Machine Learning.

This system is built from the ground up using **Clean Architecture** patterns, ensuring proper separation of concerns, comprehensive static typing, and modular folder separation. Phase 1 establishes the fully validated frontend client, Flask Blueprint services, database configuration layer, and standard directory workspaces for future model training pipelines.

---

## 📌 Architectural Blueprint (Phase 1)

AttriSense AI utilizes a decoupled, three-tier architecture ensuring that frontend delivery, backend RESTful controllers, and machine learning pipelines operate independently.

```
                         +-----------------------------------+
                         |         React Client (SPA)        |
                         |  (Vite @ Port 3000 / HashRouter)  |
                         +-----------------+-----------------+
                                           |
                                  JSON RESTful APIs
                                           |
                                           v
                         +-----------------+-----------------+
                         |        Flask REST APIs            |
                         |     (Blueprints @ Port 5000)      |
                         +--------+-----------------+--------+
                                  |                 |
                         PyMongo Client          Joblib Loader
                                  |                 |
                                  v                 v
                       +----------+------+   +------+----------+
                       |  MongoDB Server |   |  Scikit-Learn   |
                       |  (Collections)  |   |   Pickles       |
                       +-----------------+   +-----------------+
```

---

## 🛠️ Tech Stack & Dependencies

### Frontend (Client-Side)
* **Framework:** React 19 (Vite-based Single-Page Application)
* **Routing:** React Router (configured with HashRouter for sandboxed iframe-safe navigation)
* **Styling:** Tailwind CSS v4 (fully customized typography and modern slate themes)
* **HTTP Client:** Axios (configured with request token interceptors)
* **State Management:** Functional React Hooks & Custom `useAuth` security context
* **Icons:** Lucide React

### Backend (REST API Service)
* **Framework:** Python (Flask REST API utilizing the Application Factory Pattern)
* **Blueprints:** Modular routing files separating authentication (`auth_bp`) and model predictions (`prediction_bp`)
* **Security:** JSON Web Tokens (PyJWT) and Passlib (secure salted password hashes)
* **Database Driver:** PyMongo (configured with robust connection health checkers)

### Database Layer
* **Storage Engine:** MongoDB (durable, unstructured NoSQL storage mapping historical risk predictions and administrator configurations)

### Machine Learning Workspace
* **Libraries:** Scikit-Learn, Pandas, NumPy, Matplotlib, Seaborn
* **Format:** Joblib / Pickle serialization for inference integration

---

## 📂 Repository Directory Layout

The repository is organized following clean-code guidelines to promote horizontal scalability, maintainability, and readability:

```
AttriSense-AI/
├── client/                     # React Frontend Workspace (Vite Root)
│   ├── public/                 # Static public assets
│   ├── src/                    # TypeScript Source Tree
│   │   ├── assets/             # Vector icons, design assets
│   │   ├── components/         # Reusable structural UI elements
│   │   ├── hooks/              # Custom React hooks (e.g., useAuth session hooks)
│   │   ├── layouts/            # Page templates and navigation frames
│   │   ├── pages/              # Individual screens (Landing, Login, Signup, Profile)
│   │   ├── services/           # Api service clients (Axios connection + simulated endpoints)
│   │   ├── types.ts            # Global TypeScript model definitions
│   │   ├── index.css           # Global Tailwind stylesheet
│   │   └── main.tsx            # DOM initialization and mounting
│   ├── index.html              # Frontend DOM template
│   ├── vite.config.ts          # Client compilation parameters
│   └── tsconfig.json           # Client strict TypeScript rules
├── server/                     # Flask REST API Backend Workspace
│   ├── config/                 # Secret key and DB connection properties
│   ├── controllers/            # Controller layer computing business logic
│   ├── database/               # MongoDB driver connection pools and hooks
│   ├── middleware/             # JWT auth validation filters and decorators
│   ├── models/                 # MongoDB collections mapping schemas
│   ├── routes/                 # Flask Blueprints routing API requests
│   ├── utils/                  # Helper modules and logger formatting
│   └── app.py                  # Backend application factory
├── ml/                         # Machine Learning Development Pipeline
│   ├── training/               # Python model optimization scripts
│   ├── preprocessing/          # Data cleansing, label encoding, and scaling
│   ├── evaluation/             # Model scoring and cross-validation scripts
│   ├── pipelines/              # Unified inference pipelines
│   └── saved_models/           # Serialized model pickles (.joblib / .pkl)
├── datasets/                   # Corporate Retention Repositories
│   ├── raw/                    # Uncleaned raw CSV sheets (e.g., IBM Attrition Dataset)
│   └── processed/              # Normalized datasets ready for model ingestion
├── docs/                       # Design specifications and architecture charts
├── package.json                # Project root dependency definitions
├── tsconfig.json               # Root TypeScript compiler rules
├── vite.config.ts              # Root bundler setup
└── README.md                   # Enterprise system documentation
```

---

## 🚀 Execution & Setup Instructions

### 1. Frontend Client Workspace (React)
The frontend contains an interactive local-storage API simulator. This ensures that the Live Preview is fully responsive, validating the user journey even if local python processes or databases are not running on your container environment.

To run the frontend:
```bash
# From the root directory:
npm install
npm run dev
```
The client compiles and serves on `http://localhost:3000`.

---

### 2. Backend Server Workspace (Flask)
To boot up the Python REST API server, perform the following steps:

```bash
# Navigate to the server folder
cd server

# Create and activate a clean Python virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Flask, MongoDB, and cryptography libraries
pip install flask flask-cors pymongo pyjwt passlib

# Set environment variables for local testing
export FLASK_ENV=development
export SECRET_KEY="your_custom_development_secret"
export MONGO_URI="mongodb://localhost:27017/attrisense"

# Boot the API server
python app.py
```
The server starts up on `http://localhost:5000`. It features health indicators at `/api/health`.

---

### 3. Database Standby Mode
The server includes **Database Standby Fallbacks**. If a local MongoDB instance is not detected, the Flask console displays a clean warning and initiates an in-memory session proxy. This prevents critical system failure, making the application extremely robust during multi-tier testing.

To boot MongoDB locally:
```bash
# Using Docker
docker run -d -p 27017:27017 --name attrisense-mongo mongo:latest
```

---

## 📈 Phase-by-Phase Development Roadmap

### ✅ Phase 1: Clean Project Architecture (Completed)
* Multi-module directories established for ML pipelines, dataset storage, frontend client, and Flask server.
* Reconfigured Vite system to resolve paths within `/client` natively on port 3000.
* Designed modular Flask Blueprint pipelines for `/api/auth` and prediction stubs.
* Implemented an interactive client-side sandbox engine on `/profile` evaluating "What-If" retention probability.

### ⏳ Phase 2: ML Model Training & Pipeline Integration
* Obtain and register historical employee datasets (e.g., IBM HR Analytics Employee Attrition) inside `datasets/raw/`.
* Write preprocessing scripts in `ml/preprocessing/` using Pandas and Scikit-Learn (`MinMaxScaler`, `OneHotEncoder`).
* Optimize random forest classification models inside `ml/training/` and serialize output to `ml/saved_models/attrition_model.joblib`.
* Integrate the pipeline loader into `/server/routes/prediction_routes.py` to process real-time request payloads.

### ⏳ Phase 3: Interactive Dashboards & Analytical HUDs
* Integrate Recharts/D3 libraries inside `/client/` to draw attrition heatmaps, department averages, and feature weight charts.
* Implement real-time dashboard analytics displaying overall organizational turnover probabilities.
