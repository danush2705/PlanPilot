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
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Running the Application](#-running-the-application)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Configuration](#-configuration)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**LyzrFlow** is an intelligent project planning application that revolutionizes how teams create project plans. Instead of manually filling out forms and spreadsheets, simply have a conversation with our AI assistant. LyzrFlow extracts key project details, generates structured plans, and visualizes them with professional Gantt charts—all in minutes.

### How It Works

1. **Chat**: Describe your project in natural language
2. **Extract**: AI identifies goals, timelines, resources, and tasks
3. **Generate**: Structured project plan with dependencies
4. **Visualize**: Interactive Gantt chart and comprehensive dashboard
5. **Export**: Download professional PDF reports

---

## ✨ Features

### Core Functionality

- **🤖 Intelligent Chat Interface**
  - Conversational AI guides you through project planning
  - Asks targeted questions to gather essential information
  - Provides helpful examples for each question
  - Supports message editing and corrections

- **📊 Professional Dashboards**
  - Auto-generated Gantt charts with task dependencies
  - Executive summary and key milestones
  - Technology stack recommendations
  - Resource allocation suggestions

- **📈 Real-time Progress Tracking**
  - Visual progress indicator (0-100%)
  - Shows information gathering status
  - Automatic report readiness detection
  - Loop detection prevents stuck conversations

- **📄 Comprehensive Reports**
  - Structured project plans with timelines
  - Task breakdown with owners and durations
  - Professional PDF export functionality
  - Industry-standard formatting

### User Experience

- **🎨 Modern UI/UX**
  - Clean monochromatic design with blue accents
  - Dark/Light mode with persistent preferences
  - Responsive design for all devices
  - Smooth animations and transitions

- **⚡ Performance**
  - Fast Vite-powered development
  - Optimized production builds
  - Efficient API communication
  - Real-time updates

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
| **Python** | 3.9+ | Runtime |
| **Uvicorn** | 0.32.1 | ASGI server |
| **Pydantic** | 2.10.3 | Data validation |
| **Groq** | 0.11.0 | LLM API client (Llama 3.3 70B) |
| **xhtml2pdf** | 0.2.16 | PDF generation |
| **Jinja2** | 3.1.4 | Template engine |
| **python-dotenv** | 1.0.1 | Environment management |

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software

- **Node.js**: Version 18.0.0 or higher
  - Download: [nodejs.org](https://nodejs.org/)
  - Verify: `node --version`

- **npm**: Version 9.0.0 or higher (comes with Node.js)
  - Verify: `npm --version`

- **Python**: Version 3.9 or higher
  - Download: [python.org](https://www.python.org/downloads/)
  - Verify: `python --version` or `python3 --version`

- **pip**: Python package installer (comes with Python)
  - Verify: `pip --version` or `pip3 --version`

### API Keys

- **Groq API Key**: Required for AI functionality
  - Sign up at: [console.groq.com](https://console.groq.com)
  - Free tier available with generous limits

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
- UI component libraries
- Gantt chart library
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
- Uvicorn ASGI server
- Pydantic for data validation
- Groq API client
- PDF generation libraries
- Template engine and utilities

### 4. Environment Configuration

Create a `.env` file in the `backend/` directory:

```bash
cd backend
touch .env  # On Windows: type nul > .env
```

Add your Groq API key to the `.env` file:

```env
GROQ_API_KEY=your_groq_api_key_here
```

**Important**: Never commit the `.env` file to version control. It's already included in `.gitignore`.

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

**Built with ❤️ using React, FastAPI, and Groq AI**

</div>
