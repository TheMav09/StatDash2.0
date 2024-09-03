// routes/index.js

import express from 'express';
import { fetchVMsMetrics } from '../Utilities/azureService.js';

const router = express.Router();

router.get('/api/vmMetrics', async (req, res) => {
    try {
        const vmMetrics = await fetchVMsMetrics();
        res.json(vmMetrics);
    } catch (error) {
        console.error('Error fetching VM metrics:', error);
        res.status(500).send('Internal Server Error');
    }
});

export default router;
