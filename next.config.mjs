// Next.js configuration file
const nextConfig = {
  // Environment variables to be used in the application
  env: {
    AZURE_SUBSCRIPTION_ID: process.env.AZURE_SUBSCRIPTION_ID,  // Azure Subscription ID for API requests
    AZURE_VM_RESOURCE_IDS: process.env.AZURE_VM_RESOURCE_IDS,  // Resource IDs for Azure VMs to be monitored
    AZURE_TENANT_ID: process.env.AZURE_TENANT_ID,  // Azure Tenant ID for authentication
    AZURE_CLIENT_ID: process.env.AZURE_CLIENT_ID,  // Client ID for Azure AD application
    AZURE_SECRET_ID: process.env.AZURE_SECRET_ID,  // Client Secret for Azure AD application
  },

  // Rewrites API requests to an external authentication endpoint
  async rewrites() {
    return [
      {
        source: '/api/authenticate',  // The path in your application
        destination: 'https://login.microsoftonline.com/a03379ca-3d63-49cf-a6b8-6a84704c5efc/oauth2/v2.0/token',  // External Microsoft OAuth2 endpoint
      },
    ];
  },

  // Webpack configuration adjustments
  webpack: (config, { isServer }) => {
    // Modify the configuration only for client-side builds
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,  // Prevent Webpack from bundling 'fs' module on the client-side
      };
    }
    return config;  // Return the modified configuration
  },
};

export default nextConfig;  // Export the configuration for Next.js to use
