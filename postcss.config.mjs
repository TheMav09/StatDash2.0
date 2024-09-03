/** 
 * PostCSS configuration file 
 * @type {import('postcss-load-config').Config} 
 */
const config = {
  // Define the PostCSS plugins to be used
  plugins: {
    // Include Tailwind CSS as a PostCSS plugin
    // This processes your CSS files with Tailwind's utilities, components, and directives
    tailwindcss: {},
  },
};

// Export the configuration to be used by PostCSS
export default config;
