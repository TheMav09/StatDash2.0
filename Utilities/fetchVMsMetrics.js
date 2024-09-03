import axios from 'axios';
import { getAccessToken } from './tokenManager.js';

export async function fetchVMsMetrics(vms) {
    const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID;
    const metricsAPIversion = process.env.METRICS_API_VERSION || '2021-05-01'; 
    const accessToken = await getAccessToken();

    const vmMetricsPromises = vms.map(async (vm) => {
        const vmName = vm.name;
        const resourceGroup = vm.resourceGroup;
        const url = `https://management.azure.com/subscriptions/${subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.Compute/virtualMachines/${vmName}/providers/microsoft.insights/metrics?api-version=${metricsAPIversion}&metricnames=Percentage CPU,Available Memory Bytes`;

        try {
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });

            if (response.data && response.data.value && response.data.value.length > 0) {
                const cpuUsage = response.data.value.find(metric => metric.name.value === "Percentage CPU")?.timeseries[0]?.data[0]?.average || null;
                const availableMemoryBytes = response.data.value.find(metric => metric.name.value === "Available Memory Bytes")?.timeseries[0]?.data[0]?.average || null;

                const vmDetails = await getVMDetails(vmName, resourceGroup, subscriptionId, accessToken);

                return {
                    vmName,
                    cpuUsage: cpuUsage ? parseFloat(cpuUsage).toFixed(1) : 'N/A',
                    availableMemoryBytes, 
                    totalMemoryBytes: vmDetails.totalMemoryBytes, 
                    powerState: vmDetails?.powerState || 'Unknown',
                    osType: vmDetails?.osType || 'Unknown',
                    memory: vmDetails?.memory || 'N/A',
                    diskUtilization: vmDetails?.diskUtilization || [{ drive: 'N/A', total: null, used: null }]
                };
            } else {
                console.warn(`No metrics found for VM ${vmName}. Response:`, response.data);
                return null;
            }
        } catch (error) {
            if (error.response && error.response.data.error.code === 'ResourceGroupNotFound') {
                console.error(`Resource group '${resourceGroup}' not found for VM '${vmName}'. Skipping.`);
            } else {
                console.error(`Error fetching metrics for VM ${vmName}:`, error.response ? error.response.data : error.message);
            }
            return null;
        }
    });

    const vmMetrics = await Promise.all(vmMetricsPromises);
    return vmMetrics.filter(metric => metric !== null);
}

async function getVMDetails(vmName, resourceGroup, subscriptionId, accessToken) {
    const url = `https://management.azure.com/subscriptions/${subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.Compute/virtualMachines/${vmName}/instanceView?api-version=2021-07-01`;

    try {
        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        const vm = response.data;

        const powerState = vm?.statuses?.find(status => status.code.startsWith('PowerState/'))?.displayStatus || 'Unknown';
        const osType = vm?.osName || vm?.osType || 'Unknown';
        const totalMemoryBytes = vm?.hardwareProfile?.memorySizeMB ? vm.hardwareProfile.memorySizeMB * 1024 * 1024 : null;
        const diskUtilization = vm?.disks?.map(disk => ({
            drive: disk.name || 'N/A',
            total: disk.totalSizeMB ? disk.totalSizeMB * 1024 * 1024 : null,
            used: disk.usedSizeMB ? disk.usedSizeMB * 1024 * 1024 : null 
        })) || [{ drive: 'N/A', total: null, used: null }];

        return {
            powerState,
            osType,
            totalMemoryBytes,
            diskUtilization
        };
    } catch (error) {
        console.error(`Error fetching VM details for ${vmName}:`, error.response ? error.response.data : error.message);
        return {
            powerState: 'Unknown',
            osType: 'Unknown',
            totalMemoryBytes: null,
            diskUtilization: [{ drive: 'N/A', total: null, used: null }]
        };
    }
}
