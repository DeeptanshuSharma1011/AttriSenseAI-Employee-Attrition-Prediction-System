<h1 align="center">🔮 AttriSense AI</h1>

<p align="center">
  <strong>Advanced Employee Attrition Prediction & Proactive Risk Mitigation System</strong>
</p>

<p align="center">
  A production-ready, full-stack machine learning web application that empowers People Operations and HR executives to identify flight risks, simulate "What-If" retention strategies, and make data-driven, preemptive workforce decisions.
</p>

<p align="center">
  <a href="https://github.com/DeeptanshuSharma1011/AttriSenseAI-Employee-Attrition-Prediction-System">
    <img src="https://img.shields.io/github/stars/DeeptanshuSharma1011/AttriSenseAI-Employee-Attrition-Prediction-System?style=for-the-badge&logo=github&color=gold" alt="GitHub Stars" />
  </a>
  <a href="https://github.com/DeeptanshuSharma1011/AttriSenseAI-Employee-Attrition-Prediction-System/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/DeeptanshuSharma1011/AttriSenseAI-Employee-Attrition-Prediction-System?style=for-the-badge&color=blue" alt="License" />
  </a>
  <a href="https://github.com/DeeptanshuSharma1011/AttriSenseAI-Employee-Attrition-Prediction-System/commits/main">
    <img src="https://img.shields.io/github/last-commit/DeeptanshuSharma1011/AttriSenseAI-Employee-Attrition-Prediction-System?style=for-the-badge" alt="Last Commit" />
  </a>
  <a href="https://render.com">
    <img src="https://img.shields.io/badge/Render-Deployed-brightgreen?style=for-the-badge&logo=render" alt="Deployment Status" />
  </a>
</p>

---

## 📖 Table of Contents

- [Project Overview](#-project-overview)
- [Key Features](#-key-features)
- [System Architecture](#%EF%B8%8F-system-architecture)
- [Repository Directory Structure](#-repository-directory-structure)
- [Tech Stack](#-tech-stack)
- [Installation & Local Setup](#-installation--local-setup)
- [Environment Variables](#-environment-variables)
- [Usage Walkthrough](#-usage-walkthrough)
- [Machine Learning Pipeline](#-machine-learning-pipeline)
  - [Algorithms Comparison](#-algorithms-used)
  - [Evaluation Metrics](#-evaluation-metrics)
- [API Documentation](#-api-documentation)
- [Production Deployment](#-production-deployment-on-render)
- [Roadmap](#-development-roadmap)
- [Contributing](#-contributing)
- [Acknowledgements](#-acknowledgements)
- [License](#-license)
- [Contact](#-contact)

---

## 📌 Project Overview

**AttriSense AI** is an enterprise-grade AI solution that addresses one of the most expensive challenges in corporate management: **Employee Attrition**. Losing top-tier talent disrupts operations, drains institutional knowledge, and incurs substantial financial re-hiring costs.

Traditional HR models are reactive—conducting exit interviews when it is already too late. **AttriSense AI** shifts the paradigm to a proactive model by utilizing supervised machine learning classification algorithms. By processing organizational, financial, occupational, and qualitative work-life factors, the system:
1. Calculates individual employee turnover probabilities.
2. Identifies key global and local drivers of attrition (e.g., overtime, compensation distance, work-life balance).
3. Provides interactive simulators allowing HR analysts to conduct "What-If" scenarios to find optimal retention paths (e.g., "Will adjusting compensation by 10% and reducing overtime lower John's flight risk?").

### Target Users
- **HR Analysts & People Operations Managers:** To gain aggregate analytics and high-risk alerts across departments.
- **C-Suite & Executives:** To monitor overall organizational turnover trends and model budgetary impacts of retention programs.

---

## ✨ Key Features

- [x] **Secure Authentication:** Robust User sign-up and log-in with encrypted session management powered by JWT (JSON Web Tokens) and secure password hashing (`bcrypt`).
- [x] **Real-time Attrition Predictor:** High-fidelity machine learning inference running live predictions on structured employee input attributes.
- [x] **"What-If" Simulation Playground:** An interactive sandbox allowing analysts to adjust occupational parameters on the fly and immediately observe real-time risk delta updates.
- [x] **CSV Upload & Batch Processing:** Ability to upload bulk corporate datasets, perform on-the-fly preprocessing, and receive batch predictions.
- [x] **Robust ML Pipelines:** Built-in modular preprocessing pipelines implementing scaling (`MinMaxScaler`), encoding (`OneHotEncoder`), and class imbalance handling.
- [x] **Model Comparison Sandbox:** Compares metrics, ROC Curves, and Confusion Matrices across a diverse array of classifiers.
- [x] **Durable Cloud Database Storage:** Full history tracking, user profiles, and logs securely stored in MongoDB collections.
- [x] **Database Standby Fallback:** Zero-configuration local startup with in-memory fallback sessions if a remote MongoDB is not reachable.

---

## 🏗️ System Architecture

AttriSense AI is designed using a decoupled, multi-tier clean architecture:

```
                      +------------------------------------------+
                      |           React Client (SPA)             |
                      |  (Vite Dev Port: 3000 | Production dist) |
                      +--------------------+---------------------+
                                           |
                              Secured JSON RESTful API
                                           |
                                           v
                      +--------------------+---------------------+
                      |           Flask REST APIs                |
                      |     (Modular Blueprints / JWT Auth)     |
                      +----------+--------------------+----------+
                                 |                    |
                         PyMongo Client         Joblib Inference
                                 |                    |
                                 v                    v
                      +----------+---------+  +-------+----------+
                      |   MongoDB Atlas    |  |  XGBoost/Random  |
                      |  (NoSQL Database)  |  |  Forest Pipeline |
                      +--------------------+  +------------------+
```

---

## 📂 Repository Directory Structure

The repository is structured logically to separate machine learning development, backend API servers, and frontend clients, facilitating collaborative workflows:

```
AttriSense-AI/
├── client/                     # React Frontend Workspace (Vite Root)
│   ├── public/                 # Static assets & public vectors
│   ├── src/                    # TypeScript Source Tree
│   │   ├── assets/             # Branding icons, images
│   │   ├── components/         # Reusable atomic UI elements (Buttons, Inputs, Cards)
│   │   ├── hooks/              # Custom React hooks (useAuth session state)
│   │   ├── layouts/            # Page layouts, Sidebar, Navigation frames
│   │   ├── pages/              # Screens (Dashboard, Predictor, Analytics, Authentication)
│   │   ├── services/           # Axios API connectors & endpoint wrappers
│   │   ├── types.ts            # Global TypeScript model definitions
│   │   ├── index.css           # Tailwind CSS Entry Point
│   │   └── main.tsx            # DOM initialization & React Mounting
│   ├── index.html              # Frontend entry point template
│   ├── vite.config.ts          # Vite configuration
│   └── tsconfig.json           # Frontend strict compiler parameters
├── server/                     # Flask REST API Backend Workspace
│   ├── config/                 # Secret key and DB connection pooling
│   ├── controllers/            # Controller layer executing core business logic
│   ├── database/               # MongoDB connections and fallback brokers
│   ├── middleware/             # Route guards & JWT authentication filters
│   ├── models/                 # MongoDB schemas and models representation
│   ├── routes/                 # Flask Blueprints for clean routing
│   │   ├── auth_routes.py      # Authentication endpoint handlers
│   │   ├── dataset_routes.py   # Dataset ingestion handlers
│   │   └── prediction_routes.py# ML prediction pipeline controllers
│   ├── utils/                  # General-purpose loggers and helpers
│   └── app.py                  # Backend application factory
├── ml/                         # Machine Learning Research & Pipelines
│   ├── training/               # Python training and hyperparameter tuning scripts
│   ├── preprocessing/          # Data cleaning, outlier handling, label encoders
│   ├── evaluation/             # Model evaluation (ROC Curves, Confusion Matrices)
│   ├── pipelines/              # Consolidated production inference wrappers
│   └── saved_models/           # Serialized models (.joblib files)
├── datasets/                   # Corporate Retention Storage
│   ├── raw/                    # Unprocessed reference sheets (e.g. IBM HR Dataset)
│   └── processed/              # Formatted datasets used for training
├── docs/                       # Project documentation, UML charts, and diagrams
├── Dockerfile                  # Multi-stage production container setup
├── package.json                # Project root dependency definitions
├── tsconfig.json               # Shared root TypeScript compiler parameters
└── README.md                   # Enterprise system documentation
```

---

## 🛠️ Tech Stack

<details open>
<summary><b>Frontend Client</b></summary>

* ![React](https://img.shields.io/badge/react-%2320232a.svg?style=flat-square&logo=react&logoColor=%2361DAFB) **Framework:** React 18+ with TypeScript
* ![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=flat-square&logo=vite&logoColor=white) **Build Tool:** Vite
* ![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=flat-square&logo=tailwind-css&logoColor=white) **Styling:** Tailwind CSS (fully customized responsive layouts)
* ![React Router](https://img.shields.io/badge/React_Router-CA4245?style=flat-square&logo=react-router&logoColor=white) **Routing:** React Router v6
* ![Axios](https://img.shields.io/badge/Axios-5A29E4?style=flat-square&logo=axios&logoColor=white) **API Agent:** Axios (with modular interceptors)
</details>

<details open>
<summary><b>Backend API Server</b></summary>

* ![Python](https://img.shields.io/badge/python-3670A0?style=flat-square&logo=python&logoColor=ffdd54) **Language:** Python 3.10+
* ![Flask](https://img.shields.io/badge/flask-%23000.svg?style=flat-square&logo=flask&logoColor=white) **Framework:** Flask (utilizing the Application Factory Pattern)
* ![JWT](https://img.shields.io/badge/JWT-black?style=flat-square&logo=JSON%20web%20tokens) **Auth Strategy:** PyJWT & Flask-JWT-Extended
* **Encryption:** Passlib & Bcrypt (salted password hashing)
</details>

<details open>
<summary><b>Data Science & Machine Learning</b></summary>

* ![scikit-learn](https://img.shields.io/badge/scikit--learn-%23F7931E.svg?style=flat-square&logo=scikit-learn&logoColor=white) **Library:** Scikit-Learn
* ![Pandas](https://img.shields.io/badge/pandas-%23150458.svg?style=flat-square&logo=pandas&logoColor=white) **Data Processing:** Pandas & NumPy
* ![Matplotlib](https://img.shields.io/badge/Matplotlib-%23ffffff.svg?style=flat-square&logo=matplotlib&logoColor=black) **Data Visualization:** Matplotlib & Seaborn
* **Serialization:** Joblib for production pipeline storage
</details>

<details open>
<summary><b>Database & Hosting</b></summary>

* ![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=flat-square&logo=mongodb&logoColor=white) **Database:** MongoDB Atlas (NoSQL cloud persistence)
* ![Render](https://img.shields.io/badge/Render-%2346E3B7.svg?style=flat-square&logo=render&logoColor=white) **Hosting Platform:** Render Cloud Platform
* ![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=flat-square&logo=docker&logoColor=white) **Containerization:** Multi-stage Docker deployment
</details>

---

## 🚀 Installation & Local Setup

Ensure you have [Python 3.10+](https://www.python.org/downloads/) and [Node.js v18+](https://nodejs.org/) installed locally.

### 1. Clone the Repository
```bash
git clone https://github.com/DeeptanshuSharma1011/AttriSenseAI-Employee-Attrition-Prediction-System.git
cd AttriSenseAI-Employee-Attrition-Prediction-System
```

### 2. Configure Backend Environment
```bash
# Navigate to backend server
cd server

# Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Start Database Service
```bash
# If running MongoDB locally via Docker:
docker run -d -p 27017:27017 --name attrisense-mongo mongo:latest
```
*(Note: If MongoDB is unavailable, the application gracefully activates an **in-memory standby proxy session** to facilitate testing without crashes!)*

### 4. Run Flask Server
```bash
# From the server/ directory:
export FLASK_ENV=development
export SECRET_KEY="local_dev_secret_key"
export MONGO_URI="mongodb://localhost:27017/attrisense"

python app.py
```
The server will start on `http://localhost:5000` with APIs running at `/api/*` and health checks available at `/api/health`.

### 5. Setup and Run React Frontend
Open a new terminal window in the root directory:
```bash
# Navigate to the client directory
cd client

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```
The Vite client compiles and boots on `http://localhost:3000`.

---

## ⚙️ Environment Variables

The application relies on these essential environment variables. Create a `.env` file in the root and configure:

| Variable Name | Required | Default Value | Description |
|---|---|---|---|
| `FLASK_ENV` | Yes | `development` | Set to `production` in live environments to activate security settings. |
| `SECRET_KEY` | Yes | `your_secret_key` | Secret key used by Flask for session cookie signing. |
| `JWT_SECRET_KEY` | Yes | `jwt_secret_key` | Secret key used to sign and verify JSON Web Tokens. |
| `MONGO_URI` | Yes | `mongodb://localhost:27017/attrisense` | The connection string for the MongoDB instance/Atlas cluster. |
| `MODEL_PATH` | No | `ml/saved_models/attrition_model.joblib` | Target filesystem path for active pipeline prediction models. |
| `UPLOAD_FOLDER` | No | `server/uploads/` | Filesystem location for raw batch CSV processing uploads. |

---

## 💡 Usage Walkthrough

### 🔒 Authentic Security Journey
1. Open the application. You are greeted by a beautiful **Dashboard Gatekeeper**.
2. Create an analyst profile on `/signup` or log in on `/login` to acquire a cryptographically secured Bearer Token.

### 📊 Exploratory HUD & Analysis
* Once logged in, navigate to the **Main Hub**.
* The home screen displays historical prediction tracking, current average flight risks, and distribution charts of key occupational variables.

### 🎯 Predict Risk & Simulate "What-If"
1. Head to the **Predictor Tab**.
2. Enter the employee's variables (e.g., Department: Sales, Monthly Income: $5,000, Overtime: Yes, Years At Company: 4).
3. Click **Analyze Attrition Probability**.
4. The system communicates with the Flask server, runs the features through the ML model, and displays the **turnover risk percentage** with clear risk metrics.
5. In the interactive simulation panel, adjust sliders (e.g. "Simulated Income Increase") and check/uncheck overtime to instantly recalculate and plot the risk trajectory delta.

---

## 🧠 Machine Learning Pipeline

```
+-----------+     +-----------+     +-------------------+     +--------------------+     +-------------+
| Raw Data  | --> | Data Prep | --> | Feature Eng.      | --> | Hyperparameter     | --> | Production  |
| (IBM CSV) |     | & Scaling |     | (One-Hot, Scaler) |     | Grid Tuning (Grid) |     | Serialization|
+-----------+     +-----------+     +-------------------+     +--------------------+     +-------------+
```

### Data Pipeline Overview
1. **Exploratory Data Analysis (EDA):** Deep analysis of high-correlation vectors (such as `OverTime`, `JobLevel`, `MonthlyIncome`, `WorkLifeBalance`) to handle collinearity.
2. **Feature Engineering:** 
   - Encoding categorical variables cleanly via `OneHotEncoder`.
   - Normalizing continuous attributes via `MinMaxScaler` or `StandardScaler`.
3. **Imbalance Redress:** Incorporating class weight balancers to combat typical enterprise dataset target disparities.

---

### 📊 Algorithms Used

To deliver optimal prediction metrics, multiple classification models are trained, tuned, and compared in the development sandbox:

| Algorithm | Primary Purpose | Optimization Status | Expected Performance (AUC-ROC) |
|---|---|---|---|
| **Logistic Regression** | Linear classification baseline & interpretability | Optimized with L2 regularization | ~76% - 80% |
| **K-Nearest Neighbors (KNN)** | Instance-based similarity clustering | Distance metrics optimized | ~70% - 74% |
| **Naive Bayes** | Probabilistic baseline prediction | Standard Gaussian tuned | ~72% - 75% |
| **Support Vector Machine (SVM)** | High-dimensional margin classification | RBF kernel optimized | ~80% - 83% |
| **Decision Tree** | Interpretable conditional logic structure | Max-depth constrained to prevent overfitting | ~78% - 81% |
| **Random Forest** | High-performance ensemble bagger | N-estimators and max-features tuned | **~85% - 88% (High)** |
| **Gradient Boosting** | Sequential additive ensemble tree model | Learning-rate and subsampling tuned | ~84% - 87% |
| **AdaBoost** | Weight-based boosting | Estimator counts optimized | ~81% - 84% |
| **XGBoost** | High-efficiency gradient boosted trees | Regularization hyperparameters tuned | **~86% - 89% (Optimal)** |
| **CatBoost** | Automated categorical optimized boosting | Default parameters active | ~85% - 88% |
| **LightGBM** | Lightweight, high-velocity leafy boosting | Leaf parameters configured | ~84% - 88% |

---

### 📈 Evaluation Metrics

The production pipeline enforces strict performance validations before serialization:

- **Accuracy:** General evaluation, kept in check with stratifications.
- **Precision (Positive Predictive Value):** Mitigates false alarms so the HR department does not focus resources on employees who have zero intention of leaving.
- **Recall (Sensitivity):** Critical metric—ensures that actual high-risk flight profiles are not missed by the algorithm.
- **F1-Score:** Harmonic mean of Precision and Recall, optimizing robust balanced performance.
- **ROC-AUC (Area Under the Curve):** Evaluates overall model capacity to distinguish between positive (attrition) and negative (retention) classes across variable classification thresholds.
- **Confusion Matrix:** Evaluates specific distribution counts of True Negatives, False Positives, False Negatives, and True Positives.
- **K-Fold Cross-Validation:** Running $K=5$ stratified folds to verify model consistency across unseen evaluation sets.

---

## 🔌 API Documentation

All API requests accept and return JSON payloads and require a valid Bearer token (`Authorization: Bearer <token>`) except authentication endpoints.

### Authentication Endpoints

#### 🔑 `POST /api/auth/signup`
Creates a new analyst account.
* **Payload:** `{"email": "analyst@company.com", "password": "secure_password"}`
* **Response:** `{"msg": "User created successfully", "status": 201}`

#### 🔓 `POST /api/auth/login`
Authenticates user and returns JWT token credentials.
* **Payload:** `{"email": "analyst@company.com", "password": "secure_password"}`
* **Response:** `{"token": "<access_token>", "email": "analyst@company.com", "status": 200}`

---

### Model & Prediction Endpoints

#### 🔮 `POST /api/predict`
Calculates attrition risk for an employee based on incoming structural parameters.
* **Headers:** `Authorization: Bearer <token>`
* **Payload:**
  ```json
  {
    "Age": 34,
    "Department": "Research & Development",
    "MonthlyIncome": 6080,
    "OverTime": "Yes",
    "WorkLifeBalance": 3,
    "YearsAtCompany": 5
  }
  ```
* **Response:**
  ```json
  {
    "attrition_probability": 0.384,
    "risk_level": "Medium",
    "recommendations": ["Limit monthly overtime", "Schedule a performance review"]
  }
  ```

#### 🔄 `POST /api/train`
Triggers the model training run using newly updated CSV uploads.
* **Response:** `{"status": "success", "accuracy": 0.88, "auc_roc": 0.89}`

#### 📊 `GET /api/metrics`
Retrieves model validation logs including Precision, Recall, and ROC coordinates for the dashboard visualizer charts.

---

## ☁️ Production Deployment on Render

You can easily deploy AttriSense AI to Render. Choose the deployment architecture that best fits your requirements:

### 🌟 Option A: Decoupled Deployments (Recommended & Free-Tier Friendly)
Separates the static client from the dynamic Flask server. This ensures that the static React client is served via fast global CDNs, leaving the backend Python Web Service to process API requests.

#### 📦 Service 1: React Frontend (Static Site)
* **Service Type:** Static Site
* **Build Command:** `npm install && npm run build`
* **Publish Directory:** `dist`
* **Root Directory:** *[Leave empty]* (Do NOT use `client` as Root Directory because `package.json` is at the repository root)
* **Environment Variables:**
  * `VITE_API_URL`: Set this to your Backend Web Service URL (e.g., `https://attrisense-api.onrender.com`)

#### ⚙️ Service 2: Flask Backend (Web Service)
* **Service Type:** Web Service
* **Language/Runtime:** `Python`
* **Build Command:** `pip install -r requirements.txt`
* **Start Command:** `gunicorn --chdir server "app:create_app()"`
* **Root Directory:** *[Leave empty]*
* **Environment Variables:**
  * `SECRET_KEY`: *[Your secure Flask secret]*
  * `MONGO_URI`: *[Your cloud MongoDB Atlas connection string]*
  * `JWT_SECRET_KEY`: *[Your secure JWT signing key]*
  * `FLASK_ENV`: `production`

---

### 🐳 Option B: Unified Monolith (Docker Container Service)
If you prefer a single service running under one URL, Render will automatically detect the root `Dockerfile` and build a multi-stage container that compiles the React app and serves it directly through Flask's static assets router.

* **Service Type:** Web Service
* **Language/Runtime:** `Docker`
* **Root Directory:** *[Leave empty]*
* **Environment Variables:** Configure the exact environment parameters shown above.

---

## 📈 Development Roadmap

- [x] **Phase 1: Project Architecture & API Blueprints** — Modular repository setup, clean API layouts, and fallback database interfaces completed.
- [x] **Phase 2: Live Predictive Model & Simulators** — Real-time inference pipelines, "What-If" simulator widgets, and JWT authentication completed.
- [ ] **Phase 3: Deep Analytical Dashboards** — Integration of interactive D3/Recharts heatmaps, aggregate department metrics, and global visual features.
- [ ] **Phase 4: Real-time HR Collaboration Hub** — Shared notebook threads allowing HR teams to cross-reference flight risks and tag managers.

---

## 🤝 Contributing

Contributions are what make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 🏆 Acknowledgements

- **IBM HR Analytics Employee Attrition Dataset:** The core reference foundation for the predictive model schema.
- **Scikit-Learn Community:** For providing the stellar library backing our model ensemble optimization.
- **Flask & React Teams:** For the robust framework blueprints making full-stack development accessible.
- **Summer Analytics 2026:** For inspiring this comprehensive, recruiter-ready capstone project.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## ✉️ Contact

<p align="left">
  <strong>Deeptanshu Sharma</strong><br/>
  📧 Email: <a href="mailto:deepusteam1011@gmail.com">deepusteam1011@gmail.com</a><br/>
  🔗 LinkedIn: <a href="https://www.linkedin.com/in/deeptanshu-sharma-5814672b2" target="_blank">linkedin.com/in/deeptanshu-sharma-5814672b2</a><br/>
  💻 GitHub: <a href="https://github.com/DeeptanshuSharma1011/AttriSenseAI-Employee-Attrition-Prediction-System" target="_blank">DeeptanshuSharma1011/AttriSenseAI</a>
</p>

<p align="center">
  <sub>Developed with 💜 to empower modern People Operations.</sub>
</p>
