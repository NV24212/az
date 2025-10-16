# AzharStore Monorepo

- ackend: FastAPI (Dokploy-ready)vtr
- rontend: React/Vite/TS (Cloudflare Workers capable)

## Backend
`
cd backends
python -m venv .venv
. .venv/Scripts/Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
`I
- Health: http://localhost:8000/health
- Status: http://localhost:8000/

## Frontend
`
cd frontend
npm install
npm run dev
`
Set VITE_API_BASE_URL in rontend/.env when pointing to remote API.
