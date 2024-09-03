import express from 'express';
import { getVMsByTag } from '../Utilities/AzureVmsByTag.js'; 
import { fetchVMsMetrics } from '../Utilities/fetchVMsMetrics.js'; 

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        // Fetch VMs by tag
        const vms = await getVMsByTag();

        if (vms.length === 0) {
            return res.status(404).json({ message: 'No VMs found' });
        }

        // Fetch metrics for each VM
        const vmsMetrics = await fetchVMsMetrics(vms);

        // Format the data to be returned
        const formattedData = vmsMetrics.map(vm => ({
            vmName: vm.vmName,
            cpu: vm.cpuUsage ? [{ timeStamp: new Date().toISOString(), average: vm.cpuUsage }] : [],
            powerState: vm.powerState || 'Unknown', // Replace with actual data if available
            osType: vm.osType || 'Unknown', // Replace with actual data if available
            memory: vm.memory || 'N/A', // Replace with actual data if available
            diskUtilization: vm.diskUtilization || [{ drive: 'N/A', usage: 'N/A' }], // Replace with actual data if available
        }));

        res.json(formattedData);
    } catch (error) {
        console.error('Error fetching VMs data:', error.message);
        res.status(500).json({ error: 'Failed to fetch VMs data' });
    }
});

export default router;
