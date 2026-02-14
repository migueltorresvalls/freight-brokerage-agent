from pydantic import BaseModel, field_validator
from typing import List, Optional, Union


class LoginRequest(BaseModel):
    username: str
    password: str


class AccountUpdateRequest(BaseModel):
    username: str
    email: Optional[str] = None
    new_password: Optional[str] = None
    current_password: str

class LoadResponse(BaseModel):
    load_id: int
    origin: str
    destination: str
    loadboard_rate: float

    @field_validator('origin', 'destination', mode='before')
    @classmethod
    def extract_city_only(cls, value: str) -> str:
        if isinstance(value, str) and "," in value:
            return value.split(",")[0].strip()
        return value
    
class LoadsListResponse(BaseModel):
    loads: List[LoadResponse]

class ClassifierRequest(BaseModel):
    load_id: Optional[Union[int, str]] = -1 
    agreed_rate: Optional[Union[float, str]] = 0.0
    call_outcome: str
    sentiment: str
    mc_number: str

    @field_validator('load_id', mode='before')
    @classmethod
    def transform_load_id(cls, v):
        if v == "" or v is None:
            return -1
        try:
            return int(v)
        except ValueError:
            return -1

    @field_validator('agreed_rate', mode='before')
    @classmethod
    def transform_agreed_rate(cls, v):
        if v == "" or v is None:
            return 0.0
        try:
            return float(v)
        except ValueError:
            return 0.0

class CallResponse(BaseModel):
    call_id: int
    outcome: str
    load_id: int
    agreed_rate: float
    sentiment: str
    timestamp: str
    mc_number: Optional[str] = None
    origin: Optional[str] = None
    destination: Optional[str] = None
    pickup_datetime: Optional[str] = None
    delivery_datetime: Optional[str] = None
    loadboard_rate: Optional[float] = None
    weight: Optional[float] = None
    miles: Optional[float] = None
    call_datetime: str

class CallsListResponse(BaseModel):
    calls: List[CallResponse]