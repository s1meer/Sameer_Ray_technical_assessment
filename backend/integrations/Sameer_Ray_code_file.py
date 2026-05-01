import urllib.parse
import httpx
import json
from fastapi import Request, HTTPException
from fastapi.responses import HTMLResponse
from redis_client import add_key_value_redis, get_value_redis

# HubSpot App Credentials
CLIENT_ID = '4be9a990-b8eb-4f36-8c3a-889553567b39'
CLIENT_SECRET = 'd2a0b899-195b-4d55-9f2b-57f72b027f4e'
REDIRECT_URI = 'http://localhost:8000/integrations/hubspot/oauth2callback'
SCOPE = 'crm.objects.contacts.read'

async def authorize_hubspot(user_id, org_id):
    """Generates the HubSpot OAuth URL."""
    base_url = "https://app.hubspot.com/oauth/authorize"
    params = {
        "client_id": CLIENT_ID,
        "redirect_uri": REDIRECT_URI,
        "scope": SCOPE,
        "state": f"{user_id}::{org_id}" 
    }
    return f"{base_url}?{urllib.parse.urlencode(params)}"

async def oauth2callback_hubspot(request: Request):
    """Handles the redirect from HubSpot and exchanges the code for tokens."""
    code = request.query_params.get('code')
    state = request.query_params.get('state')
    
    if not code or not state:
        raise HTTPException(status_code=400, detail="Missing code or state")
        
    user_id, org_id = state.split('::')
    
    token_url = "https://api.hubapi.com/oauth/v1/token"
    data = {
        "grant_type": "authorization_code",
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "redirect_uri": REDIRECT_URI,
        "code": code
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(token_url, data=data)
        
    if response.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed to exchange token")
        
    # Store the entire token response in Redis for later use
    await add_key_value_redis(f'hubspot_credentials_{org_id}_{user_id}', json.dumps(response.json()), expire=600)
    
    # Automatically close the popup window
    return HTMLResponse(content="<script>window.close();</script>")

async def get_hubspot_credentials(user_id, org_id):
    """Retrieves credentials from Redis."""
    credentials_json = await get_value_redis(f'hubspot_credentials_{org_id}_{user_id}')
    if credentials_json:
        return json.loads(credentials_json)
    return None

async def create_integration_item_metadata_object(response_json):
    """Formats HubSpot API contact objects for the frontend."""
    props = response_json.get('properties', {})
    first = props.get('firstname', '')
    last = props.get('lastname', '')
    
    return {
        'id': response_json.get('id'),
        'name': f"{first} {last}".strip() or "Unnamed Contact"
    }

async def get_items_hubspot(credentials):
    """Fetches contacts from HubSpot using the stored access token."""
    try:
        # FIX: Ensure credentials is a dictionary
        if isinstance(credentials, str):
            credentials_dict = json.loads(credentials)
        else:
            credentials_dict = credentials
            
        access_token = credentials_dict.get('access_token')
        
        if not access_token:
            return []

        url = "https://api.hubapi.com/crm/v3/objects/contacts"
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers)
            
        if response.status_code == 200:
            results = response.json().get('results', [])
            return [await create_integration_item_metadata_object(item) for item in results]
        
        return []
    except Exception as e:
        print(f"Error fetching HubSpot items: {e}")
        return []