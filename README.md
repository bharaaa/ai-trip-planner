# Collaborative AI Trip Planner

An intelligent, multi-player travel planning application that helps groups organize, discover, and plan their perfect trip together. 

Built with React, TypeScript, Vite, Zustand, and Supabase. Powered by AI to generate tailored itineraries based on group consensus.

## ✨ Features

### 🔐 Authentication & Profiles
* Secure Email & Password sign up/login powered by Supabase Auth.
* Automatic user profile creation with Row Level Security (RLS) to ensure data privacy.

### 👥 Collaborative Trip Management
* **Create Trips:** Start a new trip, specify travel style, flexible dates, and budget.
* **Invite Friends:** Search for registered users by name or email and invite them to collaborate.
* **Real-time Access Control:** Trips are instantly accessible to all invited members securely via database joins and Row Level Security.

### 🧠 AI-Powered Discovery Phase (Coming Soon)
* The AI analyzes the group's constraints (budget, dates, origin) and generates beautiful, curated destination ideas.
* **Tinder-style Voting:** Group members can swipe/react to destinations (`Love`, `Maybe`, `Nope`) to build consensus.
* **Group Preference Aggregation:** Everyone inputs their pace, budget, and style preferences, and the app visualizes the group's "vibe".

### 📅 AI Itinerary Generation (Coming Soon)
* Once a destination is selected, the AI builds a detailed, day-by-day itinerary tailored to the group's aggregate preferences.
* **Flexible Edits:** Drag and drop itinerary items, adjust times, or ask the AI to regenerate specific days.

## 🛠 Tech Stack

* **Frontend:** React 19, TypeScript, Vite
* **Styling:** Tailwind CSS (Warm & Coral themes, Plus Jakarta Sans)
* **State Management:** Zustand
* **Animation:** Framer Motion (page transitions)
* **Backend & Database:** Supabase (PostgreSQL, PostgREST, GoTrue Auth)

## 🚀 Getting Started

### Prerequisites
* Node.js
* A Supabase Project

### 1. Installation
Clone the repo and install dependencies:
```bash
npm install
```

### 2. Environment Setup
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Database Setup
The database schema must be initialized in your Supabase project.
You can find the complete SQL schema required to run this application inside the `/supabase_schema.sql.md` (or equivalent) documentation file. It includes:
* Enums
* Tables (Users, Trips, Members, Decisions, Itineraries, etc.)
* Row Level Security (RLS) Policies
* Database Triggers (e.g., syncing Auth to Public Users)

### 4. Running Locally
Start the Vite development server:
```bash
npm run dev
```

## 🔒 Security Architecture
This app implements **Defense in Depth**:
1. **Database Level (RLS):** Supabase strictly enforces `is_trip_member()` policies, meaning the database physically will not return trip data to users who are not invited.
2. **Client Level (Zustand & Queries):** State is immediately cleared upon logout, and database queries proactively filter by `user_id` membership to prevent data leakage even if RLS is temporarily disabled.
