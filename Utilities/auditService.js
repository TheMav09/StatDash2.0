import fs from 'fs';
import path from 'path';

const auditLogDir = path.join(process.cwd(), 'logs');
const auditLogPath = path.join(auditLogDir, 'audit-log.json');

if (!fs.existsSync(auditLogDir)) {
  fs.mkdirSync(auditLogDir, { recursive: true });
}

export const loadAuditLogs = () => {
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

export const saveAuditLogs = (logs) => {
  try {
    fs.writeFileSync(auditLogPath, JSON.stringify(logs, null, 2));
    console.log('Audit logs successfully saved');
  } catch (error) {
    console.error('Error writing to audit log file:', error.message);
  }
};
