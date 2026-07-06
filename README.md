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

To run the frontend locally:
```bash
# Navigate to the client folder:
cd client
npm install
npm run dev
```
The client compiles and serves on `http://localhost:3000`.

---

### 2. Backend Server Workspace (Flask)
To boot up the Python REST API server locally, perform the following steps:

```bash
# Navigate to the server folder
cd server

# Create and activate a clean Python virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Flask, MongoDB, and machine learning libraries
pip install -r requirements.txt

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

## ☁️ Production Deployment on Render

You can easily deploy your connected GitHub repository to Render. You have two excellent options depending on your preference for cost, performance, and architecture:

### 🌟 Option A: Decoupled Deployments (Recommended & Free-Tier Friendly)
This is the standard industry practice. By separating the static frontend from the dynamic API server, you leverage Render's **Free Static Sites** (which are served via ultra-fast global CDNs and never sleep) and only spin up a single Python Web Service for the backend.

#### 📦 Service 1: React Frontend (Static Site)
* **Service Type:** Static Site
* **Build Command:** `npm install && npm run build`
* **Publish Directory:** `client/dist`
* **Root Directory:** `client`
* **Environment Variables:**
  * `VITE_API_BASE_URL`: Set this to your Backend Web Service URL (e.g., `https://attrisense-api.onrender.com`)

#### ⚙️ Service 2: Flask Backend (Web Service)
* **Service Type:** Web Service
* **Language/Runtime:** `Python`
* **Build Command:** `pip install -r requirements.txt`
* **Start Command:** `gunicorn "app:create_app()"`
* **Root Directory:** `server`
* **Environment Variables:**
  * `SECRET_KEY`: *[Your secret JWT key string]*
  * `MONGO_URI`: *[Your MongoDB Atlas Connection URI]*
  * `JWT_SECRET_KEY`: *[Your secret JWT signing key]*
  * `FLASK_ENV`: `production`

---

### 🐳 Option B: Unified Full-Stack Service (Monolith via Docker)
If you prefer to deploy everything under **one single URL and service**, you can use a unified Docker-based Render service. This compiles your React assets and serves them directly through Flask's static assets router (configured inside `server/app.py`).

To deploy as a single service, simply choose the **Docker** runtime on Render:
* **Service Type:** Web Service
* **Language/Runtime:** `Docker`
* **Root Directory:** Leave empty (root `/` of repo)
* **Environment Variables:**
  * `SECRET_KEY`: *[Your secret JWT key string]*
  * `MONGO_URI`: *[Your MongoDB Atlas Connection URI]*
  * `JWT_SECRET_KEY`: *[Your secret JWT signing key]*
  * `FLASK_ENV`: `production`

Render will automatically detect the root `Dockerfile` and build both the React frontend and Python backend into a single consolidated image, running the entire application on one single port!

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
