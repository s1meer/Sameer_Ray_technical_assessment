import { useState, useEffect } from 'react';
import { Box, Button, CircularProgress } from '@mui/material';
import axios from 'axios';

export const HubspotIntegration = ({ user, org, integrationParams, setIntegrationParams }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);

    // 1. Function to trigger the OAuth Popup
    const handleConnectClick = async () => {
        try {
            setIsConnecting(true);
            const formData = new FormData();
            formData.append('user_id', user);
            formData.append('org_id', org);

            const response = await axios.post(`http://localhost:8000/integrations/hubspot/authorize`, formData);
            const authURL = response?.data;

            const newWindow = window.open(authURL, 'HubSpot Authorization', 'width=600, height=600');

            const pollTimer = window.setInterval(() => {
                if (newWindow?.closed !== false) {
                    window.clearInterval(pollTimer);
                    handleWindowClosed();
                }
            }, 500);
        } catch (e) {
            setIsConnecting(false);
            alert(e?.response?.data?.detail || "Authorization failed to start");
        }
    }

    // 2. Function to fetch saved credentials once the popup closes
    const handleWindowClosed = async () => {
        try {
            const formData = new FormData();
            formData.append('user_id', user);
            formData.append('org_id', org);

            const response = await axios.post(`http://localhost:8000/integrations/hubspot/credentials`, formData);
            const credentials = response.data;

            if (credentials) {
                setIsConnecting(false);
                setIsConnected(true);
                // We use a clean object here to ensure 'type' is set before the Load button is clicked
                setIntegrationParams({
                    credentials: credentials,
                    type: 'HubSpot' // MUST match the backend route /integrations/HubSpot/load
                });
            } else {
                setIsConnecting(false);
            }
        } catch (e) {
            setIsConnecting(false);
            console.error("Error fetching credentials:", e);
        }
    }

    useEffect(() => {
        setIsConnected(!!(integrationParams?.credentials && integrationParams?.type === 'HubSpot'));
    }, [integrationParams]);

    return (
        <Box sx={{ mt: 2 }}>
            <Box display='flex' alignItems='center' justifyContent='center' flexDirection='column'>
                <Box sx={{ mb: 1, fontWeight: 'bold', color: '#555' }}>HubSpot Settings</Box>
                <Button
                    variant='contained'
                    onClick={isConnected ? null : handleConnectClick}
                    color={isConnected ? 'success' : 'primary'}
                    disabled={isConnecting}
                    fullWidth
                    sx={{
                        ...(isConnected && {
                            pointerEvents: 'none',
                            cursor: 'default',
                            boxShadow: 'none'
                        })
                    }}
                >
                    {isConnecting ? (
                        <CircularProgress size={24} color="inherit" />
                    ) : isConnected ? (
                        'HubSpot Connected'
                    ) : (
                        'Connect to HubSpot'
                    )}
                </Button>
            </Box>
        </Box>
    );
}