# Synapse Analytics Engine

Synapse Analytics Engine is a full-stack, AI-augmented business intelligence platform. It transitions the standard "data dashboard" into an **Active Business Deployment Engine** by scraping live competitor intelligence, analyzing market sentiment, and computing deterministic launch strategies.

## Key Features

- **Live Competitor Intelligence**: Uses DuckDuckGo HTML scraping to find real competitors for any business niche in real-time, bypassing the need for third-party API keys.
- **Automated Pricing Tier Extraction**: Asynchronously extracts minimum and maximum pricing tiers directly from competitor websites.
- **Rule-Based SWOT Engine**: Analyzes market sentiment (via NLTK VADER) and pricing (via Scikit-Learn/Linear Regression) to generate a deterministic 2x2 SWOT matrix without relying on expensive LLMs.
- **Financial Simulator**: An interactive tool to calculate break-even volumes based on dynamic pricing thresholds.
- **Supabase Integration**: Uses Supabase Postgres database and Realtime websockets to sync data instantly to the dashboard.

## Tech Stack

- **Frontend**: React (Vite), TailwindCSS, Recharts for visualizations.
- **Backend**: Python (FastAPI), BeautifulSoup4, NLTK, Scikit-Learn.
- **Database**: Supabase (PostgreSQL).

---

## How to Run the Project Locally

### 1. Database Setup (Supabase)
1. Ensure you have a Supabase project created.
2. Run the SQL migrations found in the `supabase/` folder (`migration_01.sql` through `migration_04.sql`) in your Supabase SQL Editor.
3. Obtain your Supabase Project URL and Anon Key.

### 2. Backend Setup (FastAPI)
The backend requires Python 3.10+ and a virtual environment.

```bash
cd backend
python -m venv venv

# Activate the virtual environment:
# On Windows:
.\venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Environment variables
# Ensure you have a .env file in the backend directory with:
# SUPABASE_URL=your_url
# SUPABASE_KEY=your_key

# Run the backend server
uvicorn main:app --reload --port 8000
```
*The backend will be running at `http://127.0.0.1:8000`*

### 3. Frontend Setup (React/Vite)
The frontend requires Node.js (v16+ recommended).

```bash
cd frontend

# Install dependencies
npm install

# Environment variables
# Ensure you have a .env file in the frontend directory with:
# VITE_SUPABASE_URL=your_url
# VITE_SUPABASE_ANON_KEY=your_key

# Run the frontend development server
npm run dev
```
*The frontend will be running at `http://localhost:5173`*

---

## Usage

1. Open `http://localhost:5173` in your browser.
2. In the "Competitor Intelligence" section on the Dashboard, enter a business niche (e.g., "CRM Software" or "Email Marketing") and click **Analyze Niche**.
3. The backend will scrape the web, extract pricing tiers, run sentiment analysis, and populate your dashboard with competitive insights.
4. Navigate to the **Niche Launchpad Engine** tab to see your generated SWOT analysis and Execution Roadmap!
