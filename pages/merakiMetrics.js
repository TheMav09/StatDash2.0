import React, { useState, useEffect } from 'react';
import axios from 'axios';
import withAuth from '../components/withAuth';
import styles from '../styles/Metrics.module.css';

// Define available metrics for different device types including VMX
const AVAILABLE_METRICS = {
  MR: [
    { id: 'networkName', label: 'Network Name' },
    { id: 'deviceName', label: 'Device Name' },
    { id: 'mac', label: 'MAC Address' },
    { id: 'ip', label: 'IP Address' },
    { id: 'status', label: 'Status' },
  ],
  MX: [
    { id: 'networkName', label: 'Network Name' },
    { id: 'deviceName', label: 'Device Name' },
    { id: 'mac', label: 'MAC Address' },
    { id: 'ip', label: 'IP Address' },
    { id: 'status', label: 'Status' },
  ],
  MS: [
    { id: 'networkName', label: 'Network Name' },
    { id: 'deviceName', label: 'Device Name' },
    { id: 'mac', label: 'MAC Address' },
    { id: 'ip', label: 'IP Address' },
    { id: 'status', label: 'Status' },
  ],
  VMX: [  // Add VMX device metrics
    { id: 'networkName', label: 'Network Name' },
    { id: 'deviceName', label: 'Device Name' },
    { id: 'mac', label: 'MAC Address' },
    { id: 'ip', label: 'IP Address' },
    { id: 'status', label: 'Status' },
  ],
};

const MerakiMetrics = () => {
  const [metrics, setMetrics] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMetrics, setSelectedMetrics] = useState({
    MR: AVAILABLE_METRICS.MR.map(m => m.id),
    MX: AVAILABLE_METRICS.MX.map(m => m.id),
    MS: AVAILABLE_METRICS.MS.map(m => m.id),
    VMX: AVAILABLE_METRICS.VMX.map(m => m.id), 
  });
  const [isMenuOpen, setIsMenuOpen] = useState({ MR: false, MX: false, MS: false, VMX: false });

  // Toggle metrics selection
  const handleMetricToggle = (metricId, deviceType) => {
    setSelectedMetrics(prevSelected => ({
      ...prevSelected,
      [deviceType]: prevSelected[deviceType].includes(metricId)
        ? prevSelected[deviceType].filter(id => id !== metricId)
        : [...prevSelected[deviceType], metricId],
    }));
  };

  // Toggle menu for filtering metrics
  const toggleMenu = (deviceType) => {
    setIsMenuOpen(prevMenuOpen => ({
      ...prevMenuOpen,
      [deviceType]: !prevMenuOpen[deviceType],
    }));
  };

  // Fetch metrics on component mount
  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:3001/api/merakiMetrics');
        console.log('Fetched metrics:', response.data);
        setMetrics(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching Meraki metrics:', error);
        setError('Failed to fetch Meraki metrics');
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  // Render table header based on selected metrics
  const renderTableHeader = (deviceType) => (
    <thead>
      <tr>
        {AVAILABLE_METRICS[deviceType].map(metric =>
          selectedMetrics[deviceType].includes(metric.id) && <th key={metric.id}>{metric.label}</th>
        )}
      </tr>
    </thead>
  );

  // Render table body with data from API
  const renderTableBody = (deviceType) => (
    <tbody>
      {metrics[deviceType]?.map((device, index) => {
        console.log(`Processing device: ${device.model} - ${device.name} (Serial: ${device.serial})`); // Log the processing of each device
        return (
          <tr key={index}>
            {AVAILABLE_METRICS[deviceType].map(metric =>
              selectedMetrics[deviceType].includes(metric.id) && (
                <td
                  key={metric.id}
                  className={
                    metric.id === 'status'
                      ? `${styles.statusCell} ${styles[device[metric.id].toLowerCase()] || styles.defaultStatus}`
                      : ''
                  }
                >
                  {device[metric.id] || 'N/A'}
                </td>
              )
            )}
          </tr>
        );
      })}
    </tbody>
  );

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Network Metrics Dashboard</h1>

      {/* Iterate over each device type to render tables */}
      {['MR', 'MX', 'MS', 'VMX'].map(deviceType => ( 
        <div key={deviceType}>
          <h2>{deviceType} Devices</h2>

          <div className={styles.hamburgerMenu}>
            <button className={styles.hamburgerButton} onClick={() => toggleMenu(deviceType)}>
              &#9776; {/* This is the hamburger icon */}
            </button>
            {isMenuOpen[deviceType] && (
              <div className={styles.metricSelector}>
                {AVAILABLE_METRICS[deviceType].map(metric => (
                  <label key={metric.id} className={styles.metricCheckbox}>
                    <input
                      type="checkbox"
                      checked={selectedMetrics[deviceType].includes(metric.id)}
                      onChange={() => handleMetricToggle(metric.id, deviceType)}
                    />
                    {metric.label}
                  </label>
                ))}
              </div>
            )}
          </div>

          <table className={styles.table}>
            {renderTableHeader(deviceType)}
            {renderTableBody(deviceType)}
          </table>
        </div>
      ))}

      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
    </div>
  );
};

export default withAuth(MerakiMetrics);
