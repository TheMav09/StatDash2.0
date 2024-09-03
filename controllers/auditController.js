import express from 'express';
import { loadAuditLogs, saveAuditLogs } from '../services/auditService.js';

const router = express.Router();

router.post('/acknowledge', (req, res) => {
  const { vmName, adminDetails } = req.body;
  const logs = loadAuditLogs();

  const simplifiedAdminDetails = {
    username: adminDetails.username,
    name: adminDetails.name,
    tenantId: adminDetails.tenantId,
    oid: adminDetails.oid
  };

  logs.push({
    vmName,
    acknowledgedAt: new Date().toISOString(),
    acknowledgedBy: simplifiedAdminDetails.name || simplifiedAdminDetails.username || 'Unknown Admin',
    adminDetails: simplifiedAdminDetails
  });

  saveAuditLogs(logs);

  res.status(200).json({ message: 'Acknowledgment logged' });
});

router.post('/clear-acknowledgment', (req, res) => {
  const { vmName, adminDetails } = req.body;
  let logs = loadAuditLogs();

  const simplifiedAdminDetails = {
    username: adminDetails.username,
    name: adminDetails.name,
    tenantId: adminDetails.tenantId,
    oid: adminDetails.oid
  };

  logs.push({
    vmName,
    action: 'Acknowledgment cleared',
    clearedBy: simplifiedAdminDetails.name || simplifiedAdminDetails.username || 'Unknown Admin',
    clearedAt: new Date().toISOString(),
    adminDetails: simplifiedAdminDetails
  });

  logs = logs.filter(log => !(log.vmName === vmName && !log.action));

  saveAuditLogs(logs);

  res.status(200).json({ message: 'Acknowledgment cleared' });
});

router.get('/acknowledgments', (req, res) => {
  const logs = loadAuditLogs();
  res.json(logs);
});

router.get('/audit-logs', (req, res) => {
  const logs = loadAuditLogs();
  res.json(logs);
});

export default router;
