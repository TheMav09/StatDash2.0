import axios from 'axios';
import dotenv from 'dotenv';
import { getAccessToken } from './tokenManager.js';

dotenv.config();  // Load the .env file

export async function getVMsByTag() {
    const tagName = process.env.AZURE_VM_TAG_NAME;
    const tagValue = process.env.AZURE_VM_TAG_VALUE;

    // Log the environment variables to ensure they are loaded correctly
    console.log('Tag Name:', tagName);
    console.log('Tag Value:', tagValue);

    // Validate that all required environment variables are present
    if (!tagName || !tagValue) {
        console.error('Missing required environment variables. Please ensure AZURE_VM_TAG_NAME and AZURE_VM_TAG_VALUE are set.');
        return [];
    }

    let vms = [];
    try {
        const query = `
            Resources
            | where type == 'microsoft.compute/virtualmachines'
            | where tags['${tagName}'] == '${tagValue}'
            | project name, resourceGroup
        `;

        const options = {
            method: 'POST',
            url: `https://management.azure.com/providers/Microsoft.ResourceGraph/resources?api-version=2021-03-01`,
            headers: {
                Authorization: `Bearer ${await getAccessToken()}`,
                'Content-Type': 'application/json',
            },
            data: JSON.stringify({ query })
        };

        const response = await axios(options);
        if (response.data && response.data.data) {
            vms = response.data.data; // The list of VMs is stored in the `vms` array
            console.log('VMs retrieved:', vms);
        } else {
            console.warn('No VMs retrieved. Response:', response.data);
        }
    } catch (error) {
        if (error.response) {
            console.error('Error retrieving VMs by tag:', error.response.data);
            console.error('Error status code:', error.response.status);
            console.error('Error headers:', error.response.headers);
        } else if (error.request) {
            console.error('Error retrieving VMs by tag: No response received.');
            console.error('Error request:', error.request);
        } else {
            console.error('Error setting up request to retrieve VMs by tag:', error.message);
        }
        console.error('Error config:', error.config);
        return [];
    }

    return vms; // Return the list of VMs
}
