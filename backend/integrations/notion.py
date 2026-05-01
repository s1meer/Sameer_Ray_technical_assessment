import json
import secrets
from fastapi import Request, HTTPException
from fastapi.responses import HTMLResponse
import httpx
import asyncio
import base64
from integrations.integration_item import IntegrationItem
from redis_client import add_key_value_redis, get_value_redis, delete_key_redis

CLIENT_ID = '353d872b-594c-81d3-9a0d-0037282a5936'
CLIENT_SECRET = 'secret_Vso6wCKCfjOCH9PMgv2yZtaKNiFC6jN2dQyB7uqDmXO'
encoded_client_id_secret = base64.b64encode(f'{CLIENT_ID}:{CLIENT_SECRET}'.encode()).decode()

REDIRECT_URI = 'http://localhost:8000/integrations/notion/oauth2callback'

async def authorize_notion(user_id, org_id):
    state_data = {
        'state': secrets.token_urlsafe(32),
        'user_id': user_id,
        'org_id': org_id
    }
    encoded_state = json.dumps(state_data)
    await add_key_value_redis(f'notion_state:{org_id}:{user_id}', encoded_state, expire=600)

    # Use a dynamic authorization URL to ensure parameters are clean
    params = {
        "client_id": CLIENT_ID,
        "response_type": "code",
        "owner": "user",
        "redirect_uri": REDIRECT_URI,
        "state": encoded_state
    }
    base_url = "https://api.notion.com/v1/oauth/authorize"
    import urllib.parse
    return f"{base_url}?{urllib.parse.urlencode(params)}"

async def oauth2callback_notion(request: Request):
    """Handles the redirect from Notion and exchanges the code for tokens."""
    code = request.query_params.get('code')
    encoded_state = request.query_params.get('state')
    
    if not code or not encoded_state:
        raise HTTPException(status_code=400, detail="Missing code or state")

    try:
        # 1. Decode the state (use urllib.parse.unquote if you applied my previous fix)
        import urllib.parse
        state_data = json.loads(urllib.parse.unquote(encoded_state))
        user_id = state_data.get('user_id')
        org_id = state_data.get('org_id')

        # 2. Token exchange with a LONGER TIMEOUT
        # We set timeout=30.0 to give the network plenty of time
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                'https://api.notion.com/v1/oauth/token',
                json={
                    'grant_type': 'authorization_code',
                    'code': code,
                    'redirect_uri': REDIRECT_URI
                }, 
                headers={
                    'Authorization': f'Basic {encoded_client_id_secret}',
                    'Content-Type': 'application/json',
                }
            )
            
        # 3. Check for errors from Notion
        if response.status_code != 200:
            print(f"Notion Token Error: {response.status_code} - {response.text}")
            raise HTTPException(status_code=400, detail="Failed to exchange token")

        # 4. Save and Cleanup
        await add_key_value_redis(f'notion_credentials:{org_id}:{user_id}', json.dumps(response.json()), expire=600)
        await delete_key_redis(f'notion_state:{org_id}:{user_id}')

        return HTMLResponse(content="<html><script>window.close();</script></html>")
        
    except Exception as e:
        print(f"Callback Crash: {str(e)}")
        # If it still times out, we'll see exactly where in the terminal
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

async def get_notion_credentials(user_id, org_id):
    credentials = await get_value_redis(f'notion_credentials:{org_id}:{user_id}')
    if not credentials:
        raise HTTPException(status_code=400, detail='No credentials found.')
    return json.loads(credentials)

def create_integration_item_metadata_object(response_json: dict) -> IntegrationItem:
    """Extracts the real title from Notion pages or databases."""
    name = "Untitled"
    
    # 1. Handle Pages
    if response_json.get('object') == 'page':
        properties = response_json.get('properties', {})
        # Look for any property that contains a 'title' list
        for prop_data in properties.values():
            if prop_data.get('type') == 'title':
                title_list = prop_data.get('title', [])
                if title_list:
                    name = title_list[0].get('plain_text', 'Untitled')
                    break
                    
    # 2. Handle Databases
    elif response_json.get('object') == 'database':
        title_list = response_json.get('title', [])
        if title_list:
            name = title_list[0].get('plain_text', 'Untitled')

    # Standardize metadata for VectorShift's IntegrationItem
    return IntegrationItem(
        id=response_json.get('id'),
        type=response_json.get('object'),
        name=name,
        creation_time=response_json.get('created_time'),
        last_modified_time=response_json.get('last_edited_time'),
        parent_id=response_json.get('parent', {}).get('page_id') or response_json.get('parent', {}).get('database_id')
    )
    return IntegrationItem(
        id=response_json.get('id'),
        type=response_json.get('object'),
        name=name,
        creation_time=response_json.get('created_time'),
        last_modified_time=response_json.get('last_edited_time'),
        parent_id=parent_id,
    )

async def get_items_notion(credentials) -> list[IntegrationItem]:
    """Fetches all pages and databases accessible to the integration."""
    # Robustly parse credentials
    if isinstance(credentials, str):
        credentials = json.loads(credentials)
    
    access_token = credentials.get("access_token")

    async with httpx.AsyncClient() as client:
        # Search endpoint requires a POST with a body (even if empty)
        response = await client.post(
            'https://api.notion.com/v1/search',
            headers={
                'Authorization': f'Bearer {access_token}',
                'Notion-Version': '2022-06-28',
                'Content-Type': 'application/json',
            },
            json={} 
        )

    if response.status_code == 200:
        results = response.json().get('results', [])
        return [create_integration_item_metadata_object(result) for result in results]
    
    return []