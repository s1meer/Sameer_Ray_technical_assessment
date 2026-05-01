import { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    CircularProgress
} from '@mui/material';
import axios from 'axios';

const endpointMapping = {
    'Notion': 'notion',
    'Airtable': 'airtable',
    'HubSpot': 'hubspot', // Added HubSpot to the mapping
};

export const DataForm = ({ integrationType, credentials }) => {
    const [loadedData, setLoadedData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleLoad = async () => {
        try {
            setIsLoading(true);
            const formData = new FormData();
            formData.append('credentials', JSON.stringify(credentials));

            // Determine the endpoint, defaulting to lowercase integrationType if mapping fails
            const endpoint = endpointMapping[integrationType] || integrationType?.toLowerCase();

            const response = await axios.post(`http://localhost:8000/integrations/${endpoint}/load`, formData);

            // Format the data as a string so it can be displayed in the TextField
            setLoadedData(JSON.stringify(response.data, null, 2));
            setIsLoading(false);
        } catch (e) {
            setIsLoading(false);
            alert(e?.response?.data?.detail || "Failed to load data. Ensure backend is running.");
        }
    }

    return (
        <Box display='flex' justifyContent='center' alignItems='center' flexDirection='column' width='100%'>
            <Box display='flex' flexDirection='column' width='100%'>
                <TextField
                    label="Loaded Data"
                    multiline
                    rows={6}
                    value={loadedData || ''}
                    sx={{ mt: 2 }}
                    InputLabelProps={{ shrink: true }}
                    disabled
                />
                <Button
                    onClick={handleLoad}
                    sx={{ mt: 2 }}
                    variant='contained'
                    disabled={isLoading}
                >
                    {isLoading ? <CircularProgress size={24} /> : 'Load Data'}
                </Button>
                <Button
                    onClick={() => setLoadedData(null)}
                    sx={{ mt: 1 }}
                    variant='outlined'
                    color='secondary'
                >
                    Clear Data
                </Button>
            </Box>
        </Box>
    );
}