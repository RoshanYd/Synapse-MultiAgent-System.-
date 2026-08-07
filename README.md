# Synapse Analytics Engine

Synapse Analytics Engine is a deterministic, AI-augmented business intelligence platform that transforms raw web data into actionable launch strategies. Built for modern competitive reconnaissance, it allows users to mine real-time pricing and sentiment metrics from live search engines to confidently position products and launch in new niches.

## Core Features
- **Live Reconnaissance**: Direct parsing of DuckDuckGo results for fast, real-time competitor tracking.
- **Lexical Sentiment (NLTK)**: Objective polarity scoring of competitor web messaging using VADER sentiment analysis.
- **Predictive Pricing (ML)**: Forecasts competitor pricing trajectories based on simulated historical time-series data using Scikit-Learn linear regression.
- **Rule-Based Strategy**: Formulates precise market entry recommendations using an internal deterministic SWOT engine.
- **Data Persistence**: Backed by a high-performance PostgreSQL (Supabase) database with real-time UI synchronization.

## Architecture & Tech Stack
**Frontend:** React (Vite), TailwindCSS, custom UI components.
**Backend:** FastAPI (Python), NLTK, Scikit-learn, BeautifulSoup4.
**Database:** Supabase (PostgreSQL).

## Project Setup & How to Run

### 1. Prerequisites
- Python 3.10+
- Node.js (v18+)
- Supabase account (or local instance)

### 2. Environment Variables
You will need `.env` files in both the frontend and backend directories.

**Frontend (`frontend/.env`)**:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Backend (`backend/.env`)**:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
```

### 3. Running the Backend Server
The backend leverages Python's FastAPI framework and provides the scraping/analytics engine.

```bash
# 1. Navigate to backend directory
cd backend

# 2. Create and activate a virtual environment (Windows)
python -m venv venv
.\venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run the Uvicorn dev server
uvicorn main:app --reload --port 8000
```
> The API will now be available at `http://localhost:8000`

### 4. Running the Frontend Server
The frontend is a fast React Single Page Application built with Vite.

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install node modules
npm install

# 3. Start the Vite dev server
npm run dev
```
> The application will now be available at `http://localhost:5173`

### 5. Accessing the Platform
With both servers running, open your browser and navigate to `http://localhost:5173` to access the Synapse Analytics Engine dashboard.
