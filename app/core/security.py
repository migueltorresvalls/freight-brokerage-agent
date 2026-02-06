from fastapi import Request

def check_authorization_bearer(request: Request) -> bool:
    expected_token = request.app.state.bearer_token

    authorization = request.headers.get("authorization")
    if not authorization: return False  
    
    request_bearer = authorization.lower().replace("bearer ", "").strip()
    return request_bearer == expected_token