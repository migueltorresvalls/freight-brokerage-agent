import requests

class FMCSAClient:  
    def __init__(self, web_key): 
        self.web_key = web_key
        self.session = requests.Session()

    def get_carrier_info(self, mc_number: str) -> dict:
        url = f"https://mobile.fmcsa.dot.gov/qc/services/carriers/{mc_number}?webKey={self.web_key}"
        response = self.session.get(url)
        response.raise_for_status()
        
        return response.json()

    def is_allowed_to_operate(self, carrier_info: dict) -> bool:
        content = carrier_info.get("content") or {}
        carrier_allowed = content.get("carrier", {}).get("allowedToOperate", "n")
        return carrier_allowed.lower() == "y"

    def get_carrier_name(self, carrier_info: str) -> str:
        content = carrier_info.get("content") or {}
        carrier = content.get("carrier", {})

        return carrier.get("dbaName") or carrier.get("legalName")
        
        