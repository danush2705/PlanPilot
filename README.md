# LyzrFlow

<div align="center">

![LyzrFlow Logo](public/LyzrFlow_Icon.svg)

**AI-Powered Project Planning Dashboard**

Transform conversations into professional project plans with AI-driven insights, interactive Gantt charts, and comprehensive documentation.

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115.5-green.svg)](https://fastapi.tiangolo.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.9+-yellow.svg)](https://www.python.org/)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [How It Works](#how-it-works)
- [Features](#-features)
- [User Experience](#user-experience)
- [Technology Stack](#-technology-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Running the Application](#-running-the-application)
- [Deployment](#-deployment)
- [License](#-license)

---

## 🎯 Overview

**LyzrFlow** is an intelligent project planning application that revolutionizes how teams create project plans. Instead of manually filling out forms and spreadsheets, simply have a conversation with our AI assistant. LyzrFlow extracts key project details, generates structured plans, and visualizes them with professional Gantt charts—all in minutes.

### How It Works

LyzrFlow uses a streamlined single-shot approach to project planning:

1. **Describe**: Provide a comprehensive project description in one go
   - Include goals, timeline, features, and team size
   - Use suggestion chips for quick examples
   - Input validation ensures quality requirements

2. **AI Processing**: Intelligent 4-tier model fallback system
   - Primary: Llama 3.3 70B (highest quality)
   - Fallback 1: Llama 3.1 8B (faster alternative)
   - Fallback 2: Mixtral 8x7b (reliable backup)
   - Fallback 3: Smart mock data (keyword-based templates)

3. **Generate**: Professional project plan created instantly
   - Executive summary and key milestones
   - Technology stack recommendations with rationale
   - Resource allocation suggestions
   - Interactive Gantt chart with task dependencies

4. **Review**: Comprehensive dashboard view
   - Visual timeline with progress tracking
   - Detailed task breakdown with owners
   - Technology decisions explained
   - Resource requirements outlined

5. **Export**: Download professional PDF reports
   - Industry-standard formatting
   - Complete project documentation
   - Ready to share with stakeholders

---

## ✨ Features

### Core Functionality

- **🚀 Single-Shot Project Planning**
  - Describe your entire project in one comprehensive input
  - No back-and-forth conversation required
  - Suggestion chips provide quick examples
  - Rule-based input validation ensures quality

- **🤖 Intelligent AI Processing**
  - 4-tier model fallback system for 99.9% uptime
  - Llama 3.3 70B for highest quality plans
  - Automatic fallback to alternative models on rate limits
  - Smart mock data generation based on project keywords

- **� Profetssional Dashboards**
  - Auto-generated Gantt charts with task dependencies
  - Executive summary tailored to your project
  - Technology stack recommendations with detailed rationale
  - Resource allocation based on project scope and timeline

- **📄 Comprehensive Reports**
  - Structured project plans with realistic timelines
  - Task breakdown with owners and durations
  - Professional PDF export with dynamic naming
  - Industry-standard formatting ready for stakeholders

- **🛡️ Robust Error Handling**
  - Input validation prevents meaningless queries
  - Graceful degradation with smart fallbacks
  - Clear error messages guide users
  - Health check endpoints for deployment stability

## 💫 User Experience

- **🎨 Modern, Professional UI**
  - Clean three-panel layout (home, input, dashboard)
  - Dark/Light mode with persistent preferences
  - Responsive design for desktop, laptop, and mobile
  - Smooth loading states and transitions

- **⚡ Optimized Performance**
  - Fast Vite-powered development and builds
  - Efficient API communication with proper error handling
  - Loading guards prevent crashes during data fetch
  - Environment-based configuration for dev and production

- **🎯 Intuitive Workflow**
  - Clear call-to-action buttons
  - Helpful pro tips and guidance
  - Suggestion chips for quick start
  - One-click PDF download with smart naming

- **🌐 Production-Ready**
  - Deployed on Netlify (frontend) and Render (backend)
  - Environment variable configuration
  - CORS properly configured
  - Health checks for service monitoring

---

## 🛠 Technology Stack

### Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 18.3.1 | UI framework |
| **TypeScript** | 5.8.3 | Type safety |
| **Vite** | 5.4.19 | Build tool & dev server |
| **Tailwind CSS** | 3.4.17 | Styling framework |
| **Radix UI** | Latest | Accessible components |
| **dhtmlx-gantt** | 8.0.10 | Gantt chart visualization |
| **Axios** | 1.7.7 | HTTP client |
| **React Router** | 6.30.1 | Navigation |
| **Zod** | 3.25.76 | Schema validation |
| **date-fns** | 3.6.0 | Date utilities |
| **file-saver** | 2.0.5 | File downloads |

### Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| **FastAPI** | 0.115.5 | Web framework |
| **Python** | 3.11.0 | Runtime (Render deployment) |
| **Uvicorn** | 0.32.1 | ASGI server |
| **Pydantic** | 2.10.3 | Data validation |
| **Groq** | 0.9.0 | LLM API client (4-tier fallback) |
| **httpx** | 0.27.0 | HTTP client for Groq |
| **xhtml2pdf** | 0.2.16 | PDF generation (Windows-compatible) |
| **Jinja2** | 3.1.4 | Template engine |
| **python-dotenv** | 1.0.1 | Environment management |

### Deployment

| Platform | Purpose | Configuration |
|----------|---------|---------------|
| **Netlify** | Frontend hosting | Auto-deploy from GitHub |
| **Render** | Backend hosting | Free tier with auto-sleep |
| **GitHub** | Version control | Source repository |

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software

- **Node.js**: Version 18.0.0 or higher
  - Download: [nodejs.org](https://nodejs.org/)
  - Verify: `node --version`

- **npm**: Version 9.0.0 or higher (comes with Node.js)
  - Verify: `npm --version`

- **Python**: Version 3.11.0 recommended (3.9+ supported)
  - Download: [python.org](https://www.python.org/downloads/)
  - Verify: `python --version` or `python3 --version`
  - Note: Python 3.11 recommended for Render deployment compatibility

- **pip**: Python package installer (comes with Python)
  - Verify: `pip --version` or `pip3 --version`

### API Keys & Accounts

- **Groq API Key**: Required for AI functionality
  - Sign up at: [console.groq.com](https://console.groq.com)
  - Free tier available with generous limits
  - Supports multiple models (Llama 3.3 70B, Llama 3.1 8B, Mixtral)

### Optional (For Deployment)

- **GitHub Account**: For version control and auto-deployment
- **Netlify Account**: For frontend hosting (free tier available)
- **Render Account**: For backend hosting (free tier available)

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/lyzrflow.git
cd lyzrflow
```

### 2. Frontend Setup

Install all frontend dependencies:

```bash
npm install
```

This will install:
- React and React DOM
- TypeScript and type definitions
- Vite and build tools
- Tailwind CSS and plugins
- UI component libraries (Radix UI)
- dhtmlx-gantt for Gantt charts
- Axios for API communication
- All other dependencies listed in `package.json`

### 3. Backend Setup

Navigate to the backend directory and install Python dependencies:

```bash
cd backend
pip install -r requirements.txt
```

Or using pip3:

```bash
pip3 install -r requirements.txt
```

This will install:
- FastAPI web framework
- Uvicorn ASGI server with standard extras
- Pydantic for data validation
- Groq API client (v0.9.0 for Python 3.11 compatibility)
- httpx for HTTP requests
- xhtml2pdf for PDF generation (Windows-compatible)
- Jinja2 template engine
- python-dotenv for environment management

### 4. Environment Configuration

#### Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
cd backend
touch .env  # On Windows: type nul > .env
```

Add your Groq API key:

```env
GROQ_API_KEY=your_groq_api_key_here
```

#### Frontend Environment Variables (Optional for Local Development)

Create a `.env` file in the root directory:

```bash
touch .env  # On Windows: type nul > .env
```

Add your backend URL (defaults to localhost if not set):

```env
VITE_BACKEND_URL=http://127.0.0.1:8000
```

**Important**: 
- Never commit `.env` files to version control (already in `.gitignore`)
- For production deployment, set environment variables in your hosting platform (Netlify/Render)
- Frontend `.env` is only read during build time, not at runtime

---

## 🏃 Running the Application

### Development Mode

#### Start Backend Server

From the backend directory:

```bash
cd backend
uvicorn main:app --reload
```

Or specify host and port explicitly:

```bash
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

The backend will start on `http://127.0.0.1:8000` (default uvicorn port)

**Note**: The `--reload` flag enables auto-restart on code changes during development.

#### Start Frontend Development Server

In a new terminal, from the project root:

```bash
npm run dev
```

The frontend will start on `http://localhost:8080` (configured in `vite.config.ts`)

**Note**: The frontend is configured to connect to `http://127.0.0.1:8000` by default. If your backend runs on a different port, set the `VITE_BACKEND_URL` environment variable.

### Production Build

#### Build Frontend

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

#### Preview Production Build

```bash
npm run preview
```

---

## 🚀 Deployment

### Backend Deployment (Render)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Create Render Web Service**
   - Go to [render.com](https://render.com) and sign in with GitHub
   - Click "New +" → "Web Service"
   - Connect your repository
   - Configure:
     - **Name**: `lyzrflow-backend`
     - **Language**: Python 3
     - **Root Directory**: `backend`
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `python -m uvicorn main:app --host 0.0.0.0 --port $PORT`
     - **Instance Type**: Free

3. **Add Environment Variables**
   - In Render dashboard, go to Environment
   - Add: `GROQ_API_KEY` = your_groq_api_key
   - Optionally add: `PYTHON_VERSION` = 3.11.0

4. **Deploy**
   - Render will automatically build and deploy
   - Copy your backend URL (e.g., `https://lyzrflow-backend.onrender.com`)

### Frontend Deployment (Netlify)

1. **Create Netlify Site**
   - Go to [netlify.com](https://netlify.com) and sign in
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository
   - Configure:
     - **Build command**: `npm run build`
     - **Publish directory**: `dist`

2. **Add Environment Variables**
   - Go to Site settings → Environment variables
   - Add: `VITE_BACKEND_URL` = your_render_backend_url
   - Example: `https://lyzrflow-backend.onrender.com`

3. **Deploy**
   - Click "Deploy site"
   - Netlify will build and deploy automatically
   - Your site will be live at `https://your-site-name.netlify.app`

### Important Notes

- **Render Free Tier Cold Start**: Since the backend is hosted on a free tier, the initial request after 15 minutes of inactivity may take up to 45 seconds to process due to "cold start" behavior. Subsequent requests will be much faster.
- **Environment Variables**: Must be set in hosting platform dashboards, not in `.env` files
- **CORS**: Already configured to allow all origins (update in production for security)
- **Health Checks**: Backend includes `/` endpoint for Render health monitoring

---

## 📄 License

MIT License

Copyright (c) 2025 LyzrFlow

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

<div align="center">

**Built with using React, FastAPI, and Groq AI**

</div>
