// config/azure.js

import { DefaultAzureCredential } from '@azure/identity';
import dotenv from 'dotenv';

// Import the needed packages
import armMonitor from '@azure/arm-monitor';
import armCompute from '@azure/arm-compute';
import armResourceGraph from '@azure/arm-resourcegraph';

dotenv.config();

const credential = new DefaultAzureCredential();

const createMonitorClient = (subscriptionId) => {
  if (!subscriptionId) {
    throw new Error("'subscriptionId' cannot be null");
  }
  return new armMonitor.MonitorClient(credential, subscriptionId);
};

const computeClient = new armCompute.ComputeManagementClient(credential, process.env.AZURE_SUBSCRIPTION_ID);
const resourceGraphClient = new armResourceGraph.ResourceGraphClient(credential);

export { createMonitorClient, computeClient, resourceGraphClient };
