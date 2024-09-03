import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const AzureServerHealth = () => {
  const [vmMetrics, setVmMetrics] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3001'); // Connect to WebSocket server

    ws.onopen = () => {
      console.log('WebSocket connection opened');
      setLoading(false);
    };

    ws.onmessage = (event) => {
      try {
        const { data } = event;

        if (data instanceof Blob) {
          const reader = new FileReader();
          reader.onload = function() {
            try {
              if (reader.result) {
                const parsedData = JSON.parse(reader.result);
                setVmMetrics(parsedData);
              } else {
                throw new Error("Empty Blob received");
              }
            } catch (err) {
              console.error('Error parsing JSON from Blob:', err);
              setError('Error parsing WebSocket message from Blob.');
            }
          };
          reader.onerror = function() {
            console.error('FileReader error:', reader.error);
            setError('Error reading Blob data.');
          };
          reader.readAsText(data);
        } else {
          const parsedData = JSON.parse(data);
          setVmMetrics(parsedData);
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
        setError('Error parsing WebSocket message.');
      }
    };

    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
      setError('WebSocket connection error');
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => {
      ws.close();
    };
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <Header />
      <main>
        <h1>Azure Server Health</h1>
        <section>
          {vmMetrics.length > 0 ? (
            <ul>
              {vmMetrics.map((vm, index) => (
                <li key={index}>
                  <h2>{vm.vmName}</h2>
                  <p>Current CPU Usage: {vm.cpuUsage ? `${parseFloat(vm.cpuUsage).toFixed(1)}%` : 'N/A'}</p>
                  <p>Available Memory: {vm.totalMemoryBytes && vm.availableMemoryBytes ? 
                    `${((vm.availableMemoryBytes / vm.totalMemoryBytes) * 100).toFixed(2)}%` : 'N/A'}</p>
                  <p>Power State: {vm.powerState || 'Unknown'}</p>
                  <p>OS Type: {vm.osType || 'Unknown'}</p>
                  <p>Memory Usage: {vm.memory || 'N/A'}</p>
                  <p>Disk Utilization: {vm.diskUtilization && vm.diskUtilization.length > 0 ? vm.diskUtilization.map((disk, i) => (
                    <span key={i}>{disk.drive}: {disk.total && disk.used ? `${((disk.used / disk.total) * 100).toFixed(2)}%` : 'N/A'}</span>
                  )) : 'No Data Available'}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No VMs found</p>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AzureServerHealth;
