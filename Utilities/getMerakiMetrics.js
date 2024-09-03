// Import necessary modules
import axios from 'axios';
import fs from 'fs';

const merakiApiUrl = 'https://api.meraki.com/api/v1';  // Base URL for the Meraki API
const apiKey = process.env.MERAKI_API_KEY;  // API key for authentication, stored in environment variables
const userAgent = 'StatDash/1.0.0 MyCompanyName';  // User-Agent string for requests

// Common headers for Meraki API requests, including the API key and user agent
const axiosConfig = {
  headers: {
    'X-Cisco-Meraki-API-Key': apiKey,
    'User-Agent': userAgent,
  },
};

// Helper function to handle API requests with retries and detailed logging
const axiosRequestWithRetry = async (config, retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios(config);
      console.log(`Request succeeded on attempt ${attempt}:`, response.data);
      return response;
    } catch (error) {
      const errorMessage = error.response ? error.response.data : error.message;
      console.error(`Attempt ${attempt} failed:`, errorMessage);

      if (attempt === retries) {
        // Log error details to a file after the final failed attempt
        fs.appendFileSync(
          'request_errors.log',
          JSON.stringify({
            timestamp: new Date().toISOString(),
            attempt,
            error: errorMessage,
            config: config.url,
          }) + ',\n'
        );
        throw new Error(`Request failed after ${retries} attempts: ${errorMessage}`);
      }
    }
  }
};

// Fetch devices for a given network
const fetchDevices = async (networkId) => {
  try {
    console.log(`Fetching devices for network ${networkId}`);
    const response = await axiosRequestWithRetry({
      ...axiosConfig,
      method: 'get',
      url: `${merakiApiUrl}/networks/${networkId}/devices`,
    });
    console.log('Devices fetched successfully:', response.data);
    return response.data;  // Return the list of devices
  } catch (error) {
    console.error(`Error fetching devices for network ${networkId}:`, error.message);
    return [];  // Return an empty array in case of error
  }
};

// Fetch device statuses for an organization
const fetchDeviceStatuses = async (organizationId) => {
  try {
    console.log(`Fetching device statuses for organization ${organizationId}`);
    const response = await axiosRequestWithRetry({
      ...axiosConfig,
      method: 'get',
      url: `${merakiApiUrl}/organizations/${organizationId}/devices/statuses`,
    });
    console.log('Device statuses fetched successfully:', response.data);
    return response.data;  // Return the device statuses
  } catch (error) {
    console.error(`Error fetching device statuses for organization ${organizationId}:`, error.message);
    return [];  // Return an empty array in case of error
  }
};

// Main function to gather and organize all metrics
export const getMerakiMetrics = async () => {
  try {
    // Fetch all networks for the given organization
    const networksResponse = await axiosRequestWithRetry({
      ...axiosConfig,
      method: 'get',
      url: `${merakiApiUrl}/organizations/${process.env.MERAKI_ORG_ID}/networks`,
    });

    // Fetch device statuses for the organization
    const deviceStatusesResponse = await fetchDeviceStatuses(process.env.MERAKI_ORG_ID);
    const deviceStatuses = deviceStatusesResponse.reduce((acc, status) => {
      acc[status.serial] = status.status;  // Map device serial numbers to their statuses
      return acc;
    }, {});

    const networks = networksResponse.data;  // Get the list of networks
    const groupedMetrics = {};  // Initialize an object to store metrics grouped by device type

    // Iterate over each network to fetch and organize device metrics
    await Promise.all(networks.map(async (network) => {
      console.log(`Fetching devices for network: ${network.id} - ${network.name}`);
      
      const devices = await fetchDevices(network.id);  // Fetch devices for the current network

      await Promise.all(devices.map(async (device) => {
        const deviceType = device.model.slice(0, 3);  // Adjust slicing to capture VMX devices (first 3 characters)

        console.log(`Processing device: ${device.model} - ${device.name} (Serial: ${device.serial})`);

        if (!groupedMetrics[deviceType]) {
          groupedMetrics[deviceType] = [];  // Initialize an array for this device type if it doesn't exist
        }

        // Organize the device metrics into a structured object
        let deviceMetrics = {
          networkName: network.name,
          deviceName: device.name || device.model,
          mac: device.mac,
          ip: device.lanIp || device.wan1Ip || device.wan2Ip || 'N/A',  // Prefer LAN IP, then WAN1 IP, then WAN2 IP, or 'N/A' if none are available
          status: deviceStatuses[device.serial] || 'N/A',  // Get the device status or default to 'N/A'
        };

        groupedMetrics[deviceType].push(deviceMetrics);  // Add the device metrics to the appropriate group
      }));
    }));

    return groupedMetrics;  // Return the organized metrics grouped by device type
  } catch (error) {
    console.error('Error fetching Meraki metrics:', error.message);
    throw error;  // Re-throw the error after logging it
  }
};
