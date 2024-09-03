import axios from 'axios';
import dotenv from 'dotenv';
import qs from 'qs';

dotenv.config();

let cachedToken = null;
let tokenExpiry = null;

export async function getAccessToken() {
  // Check if the token is cached and not expired
  if (cachedToken && tokenExpiry && new Date() < tokenExpiry) {
    console.log('Using cached access token:', cachedToken);
    console.log('Token expiry:', tokenExpiry);
    return cachedToken;
  }

  // Load environment variables
  const tenantId = process.env.AZURE_TENANT_ID;
  const clientId = process.env.AZURE_CLIENT_ID;
  const clientSecret = process.env.AZURE_CLIENT_SECRET;

  if (!tenantId || !clientId || !clientSecret) {
    throw new Error('Missing required environment variables (AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET).');
  }

  const scope = 'https://management.azure.com/.default'; // Set the scope for Azure Management API
  const url = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

  // Prepare the data for the token request
  const data = qs.stringify({
    client_id: clientId,
    scope: scope,
    client_secret: clientSecret,
    grant_type: 'client_credentials'
  });

  try {
    // Request a new access token
    const response = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const { access_token, expires_in } = response.data;

    console.log('Received new access token:', access_token);
    console.log('Token expires in (seconds):', expires_in);

    // Cache the token and set the expiry time
    cachedToken = access_token;
    tokenExpiry = new Date(new Date().getTime() + expires_in * 1000);
    console.log('Token will expire at:', tokenExpiry);

    return access_token;
  } catch (error) {
    // Enhanced error logging
    console.error('Error fetching access token:', error.response ? error.response.data : error.message);
    console.error('Status code:', error.response ? error.response.status : 'N/A');
    console.error('Full error response:', error.response ? error.response : 'No response data');
    throw error;
  }
}
