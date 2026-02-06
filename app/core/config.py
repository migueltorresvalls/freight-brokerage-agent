STATE_MAP = {
    "Alabama": "AL", "Alaska": "AK", "Arizona": "AZ", "Arkansas": "AR", "California": "CA",
    "Colorado": "CO", "Connecticut": "CT", "Delaware": "DE", "Florida": "FL", "Georgia": "GA",
    "Illinois": "IL", "Texas": "TX", "New York": "NY", "Washington": "WA"
}

def format_location(city, state):
    state_code = STATE_MAP.get(state, state)
    
    city_part = "%" if city.lower() == "any" else city
    state_part = "%" if state.lower() == "any" else state_code
    
    return f"{city_part}, {state_part}"