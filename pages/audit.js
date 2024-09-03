import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../styles/Metrics.module.css';
import withAuth from '../components/withAuth';

const Audit = () => {
  const [logs, setLogs] = useState([]);

  // Fetch audit logs on component mount
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/audit-logs');
        setLogs(response.data);
      } catch (error) {
        console.error('Error fetching audit logs:', error);
      }
    };

    fetchLogs();
  }, []);

  // Clear audit logs
  const clearLogs = async () => {
    try {
      await axios.delete('http://localhost:3001/api/clear-audit-logs');
      setLogs([]);
    } catch (error) {
      console.error('Error clearing audit logs:', error);
    }
  };

  // Download audit logs as a CSV file
  const downloadLogs = () => {
    const csvContent = [
      ['VM', 'CPU (%)', 'Memory (%)', 'Disk Utilization (%)', 'Acknowledged By', 'Acknowledged At'],
      ...logs.map(log => [
        log.vmName,
        log.cpu || 'N/A',
        log.memory || 'N/A',
        log.diskUtilization || 'N/A',
        log.acknowledgedBy || 'N/A',
        log.acknowledgedAt || 'N/A'
      ])
    ].map(e => e.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'audit_logs.csv';
    document.body.appendChild(a); // Append to DOM
    a.click();
    document.body.removeChild(a); // Remove from DOM
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Audit Logs</h1>
      <div className={styles.buttonContainer}>
        <button onClick={clearLogs} className={styles.clearButton}>Clear Logs</button>
        <button onClick={downloadLogs} className={styles.downloadButton}>Download Logs</button>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>VM</th>
            <th>CPU (%)</th>
            <th>Memory (%)</th>
            <th>Disk Utilization (%)</th>
            <th>Acknowledged By</th>
            <th>Acknowledged At</th>
          </tr>
        </thead>
        <tbody>
          {logs.length > 0 ? (
            logs.map((log, index) => (
              <tr key={index}>
                <td>{log.vmName}</td>
                <td>{log.cpu || 'N/A'}</td>
                <td>{log.memory || 'N/A'}</td>
                <td>{log.diskUtilization || 'N/A'}</td>
                <td>{log.acknowledgedBy || 'N/A'}</td>
                <td>{log.acknowledgedAt || 'N/A'}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7">No logs available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default withAuth(Audit);
