from fastapi import APIRouter, Request, HTTPException
from app.models.schemas import LoadsListResponse, ClassifierRequest, CallsListResponse
from app.core.config import format_location
from app.core.security import check_authorization_bearer
from datetime import datetime

import os

router = APIRouter() 

@router.get("/authorize/{mc_number}", status_code=200)
async def validate_mc(mc_number: str, request: Request):
    if not check_authorization_bearer(request): raise HTTPException(status_code=401, detail="Invalid Token")
    
    fmcsa_client = request.app.state.fmcsa_client    
    carrier_info = fmcsa_client.get_carrier_info(mc_number)
    
    is_allowed = fmcsa_client.is_allowed_to_operate(carrier_info)
    if not is_allowed: raise HTTPException(status_code=401, detail="Carrier is not allowed to operate")
    
    return {"carrier": fmcsa_client.get_carrier_name(carrier_info)}


@router.get("/loads", response_model=LoadsListResponse)
async def find_loads(origin_state: str, origin_city: str, destination_state: str, destination_city: str, request: Request):
    if not check_authorization_bearer(request): raise HTTPException(status_code=401, detail="Invalid token")

    o_state = origin_state.strip() or "Any"
    o_city = origin_city.strip() or "Any"
    d_state = destination_state.strip() or "Any"
    d_city = destination_city.strip() or "Any"

    db = request.app.state.db

    origin_query = format_location(o_city, o_state)
    destination_query = format_location(d_city, d_state)
    results = db.search_loads_by_location(origin_query, destination_query)
    
    return {"loads": results}

@router.post("/classifier", status_code=200)
async def classify(data: ClassifierRequest, request: Request):
    if not check_authorization_bearer(request): raise HTTPException(status_code=401, detail="Invalid token")

    db = request.app.state.db

    now = datetime.now()
    formatted_date = now.strftime("%b %d %I:%M").lower() 
    am_pm = now.strftime("%p").lower().replace("am", "a.m.").replace("pm", "p.m.")
    call_datetime = f"{formatted_date}{am_pm}"

    call_data = {"outcome": data.call_outcome, "load_id": int(data.load_id), "agreed_rate": float(data.agreed_rate), "sentiment": data.sentiment, "call_datetime": call_datetime}

    new_id = db.insert_call(call_data)
    return {"status": "success", "call_id": new_id}

@router.get("/calls", response_model=CallsListResponse)
async def list_calls(request: Request):
    if not check_authorization_bearer(request): raise HTTPException(status_code=401, detail="Invalid token")

    db = request.app.state.db
    results = db.get_all_calls()
    
    return {"calls": results}