import os
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import HTTPException
from app.api.endpoints import router as api_router
from app.database.manager import LogisticsDB
from app.services.fmcsa_client import FMCSAClient
from fastapi.responses import HTMLResponse


DB_PATH = "data/logistics.db"
LOADS_CSV_PATH = "data/loads.csv"
CALLS_CSV_PATH = "data/calls.csv"

FMCSA_KEY = os.environ.get("TF_VAR_fmcsa_api_key")
EXPECTED_TOKEN = os.environ.get("TF_VAR_authorization_bearer")

db_file = os.path.exists(DB_PATH)
db = LogisticsDB(DB_PATH)

if not db_file:
    with db as database:
        database.populate_from_csv(LOADS_CSV_PATH, CALLS_CSV_PATH)

fmcsa_client = FMCSAClient(web_key=FMCSA_KEY)

app = FastAPI()
app.state.db = db
app.state.fmcsa_client = fmcsa_client
app.state.bearer_token = EXPECTED_TOKEN
app.include_router(api_router, prefix="/api/v1")

@app.get("/", response_class=HTMLResponse)
async def serve_dashboard(request: Request):
    token = request.app.state.bearer_token
    
    file_path = os.path.join("frontend", "index.html")
    if not os.path.exists(file_path): raise HTTPException(status_code=404, detail="Frontend file not found")

    with open(file_path, "r", encoding="utf-8") as f:
        html_content = f.read()
    
    dynamic_html = html_content.replace("YOUR_BEARER_TOKEN_HERE", token)
    return HTMLResponse(content=dynamic_html)


