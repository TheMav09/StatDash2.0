import dotenv from 'dotenv';
dotenv.config(); 

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import vmController from './controllers/vmController.js';
import { getVMsByTag } from './Utilities/AzureVmsByTag.js'; 
import { fetchVMsMetrics } from './Utilities/fetchVMsMetrics.js'; // Import the fetchVMsMetrics function

// Create an Express application instance
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

const auditLogDir = path.join(process.cwd(), 'logs');
const auditLogPath = path.join(auditLogDir, 'audit-log.json');

if (!fs.existsSync(auditLogDir)) {
  fs.mkdirSync(auditLogDir, { recursive: true });
}

const loadAuditLogs = () => {
  try {
    if (fs.existsSync(auditLogPath)) {
      return JSON.parse(fs.readFileSync(auditLogPath, 'utf-8'));
    } else {
      console.warn(`Audit log file not found at ${auditLogPath}`);
      return [];
    }
  } catch (error) {
    console.error('Error reading audit log file:', error.message);
    return [];
  }
};

const saveAuditLogs = (logs) => {
  try {
    fs.writeFileSync(auditLogPath, JSON.stringify(logs, null, 2));
    console.log('Audit logs successfully saved');
  } catch (error) {
    console.error('Error writing to audit log file:', error.message);
  }
};

// API routes
app.post('/api/acknowledge', (req, res) => {
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

app.post('/api/clear-acknowledgment', (req, res) => {
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

app.get('/api/acknowledgments', (req, res) => {
  const logs = loadAuditLogs();
  res.json(logs);
});

app.get('/api/audit-logs', (req, res) => {
  const logs = loadAuditLogs();
  res.json(logs);
});

// Use vmController for VM metrics route
app.use('/api/vmMetrics', vmController);

// WebSocket setup
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('Client connected via WebSocket');

  ws.on('message', async (message) => {
    const { tagName, tagValue } = JSON.parse(message);
    try {
      const vms = await getVMsByTag(tagName, tagValue);
      const metrics = await fetchVMsMetrics(vms); // Fetch metrics for the VMs
      console.log('Sending the following data to WebSocket clients:', JSON.stringify(metrics, null, 2));
      ws.send(JSON.stringify(metrics)); // Send metrics to the client
    } catch (error) {
      ws.send(JSON.stringify({ error: 'Failed to fetch VMs or metrics' }));
    }
  });

  // Send updated VM metrics periodically
  const interval = setInterval(async () => {
    try {
      const vms = await getVMsByTag(process.env.AZURE_VM_TAG_NAME, process.env.AZURE_VM_TAG_VALUE);
      const metrics = await fetchVMsMetrics(vms); // Fetch metrics for the VMs
      ws.send(JSON.stringify(metrics)); // Send metrics to the client
    } catch (error) {
      console.error('Error fetching VM metrics:', error);
    }
  }, 5000); // Poll every 5 seconds

  ws.on('close', () => {
    clearInterval(interval); // Clear the interval when the client disconnects
  });
});

server.listen(3001, () => {
  console.log('listening on *:3001');
});
