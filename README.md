<h1 align="center">GeoLash</h1>

<div align="center">

![GeoLash Status](https://img.shields.io/badge/status-active-success.svg?style=for-the-badge)
![Tech](https://img.shields.io/badge/stack-React%20%7C%20Vite%20%7C%20Supabase-blue?style=for-the-badge)

**A Modern Location-Based Web Application for Interactive Mapping and Real-Time Data Visualization**

</div>

---

## 🌍 About the Project

**GeoLash** is a modern, high-performance web application focused on **interactive geospatial visualization** and **real-time data-driven interfaces**.  
It is designed to provide a clean, responsive, and scalable frontend architecture suitable for mapping, dashboards, and location-based analytics.

The project is built using **Vite, React, Tailwind CSS, and Supabase**, and was initially scaffolded using **Lovable.dev**, allowing both prompt-based development and full local control.

---

## 🎯 Problem Statement

Modern web-based geospatial applications often suffer from:

- Slow load times with large datasets  
- Poor UI responsiveness on different devices  
- Complex state management for real-time data  
- Difficult backend integration for authentication and storage  

GeoLash addresses these challenges by combining a fast build system, modular UI design, and seamless backend services.

---

## 💡 Solution Overview

GeoLash provides:

- A fast and lightweight frontend using Vite  
- Modular, reusable React components  
- Real-time-ready backend integration using Supabase  
- Responsive UI with Tailwind CSS  
- Clean project architecture for scalability  

---

## ✨ Key Features

- 🌍 Interactive map-based UI  
- ⚡ Ultra-fast development and build times (Vite)  
- 🎨 Fully responsive design using Tailwind CSS  
- 🔐 Authentication, database & storage via Supabase  
- 🧩 Component-based React architecture  
- 🧪 Integrated testing setup with Vitest  

---

## 🛠 Technology Stack

### Frontend
- React (TypeScript)
- Vite
- Tailwind CSS
- ShadCN UI

### Backend / Services
- Supabase (Authentication, Database, Storage)

### Tooling
- Lovable.dev
- ESLint
- Vitest

---

## 🏗 System Architecture

```mermaid
flowchart TD
    A[User Opens GeoLash Web App] --> B[React Frontend UI]
    
    B --> C[User Location Input and Map Interaction]
    C --> D[Client Side Validation and Formatting]
    
    D --> E[REST API Request]
    
    E --> F[Node JS Express Backend]
    F --> G[Request Sanitization Layer]
    
    G --> H[Geo Processing Engine]
    
    H --> I[Geolocation Resolver]
    H --> J[Coordinate Processing Module]
    H --> K[Distance and Mapping Logic]
    
    I --> L[External Geo API Services]
    J --> M[Geo Data Formatter]
    K --> M
    
    M --> N[Structured Geo Response]
    
    N --> O[Database Layer]
    O --> P[Geo Metadata Storage]
    
    N --> Q[JSON Response to Frontend]
    
    Q --> R[Map Visualization Layer]
    R --> S[Live Location Markers]
    R --> T[Geo Analytics Panels]
    R --> U[Interactive Map Rendering]
```

---

## 📁 Project Folder Structure

```
GeoLash-main/
│
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   ├── hooks/              # Custom React hooks
│   ├── pages/              # Page-level components
│   ├── lib/                # Utilities & helpers
│   ├── App.tsx             # Root component
│   └── main.tsx            # Application entry point
│
├── supabase/               # Supabase configuration
├── index.html              # HTML entry file
├── package.json            # Project dependencies
├── tailwind.config.ts      # Tailwind configuration
├── vite.config.ts          # Vite configuration
└── README.md               # Project documentation
```

---

## 💻 Important Source Code

### 🔹 Application Entry (main.tsx)

```ts
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

### 🔹 Root Component (App.tsx)

```ts
function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <h1 className="text-2xl font-bold">GeoLash Dashboard</h1>
    </div>
  );
}

export default App;
```

---

## 🚀 Installation

### Prerequisites
- Node.js 18+
- npm or yarn

---

### Setup Steps

```bash
git clone <your-repository-url>
cd GeoLash-main
npm install
npm run dev
```

The application will be available at:

```
http://localhost:8081/
```

---

## 📖 Usage

1. Start the development server  
2. Open the application in the browser  
3. Interact with the map/dashboard UI  
4. Connect Supabase for real-time data features  

---

## 🗺 Roadmap

- Interactive map enhancements  
- Real-time data streaming  
- Advanced UI components  
- Performance optimizations  
- Production deployment  


</div>
