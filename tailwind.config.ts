import type { Config } from "tailwindcss";

// Tailwind CSS configuration object
const config: Config = {
  // Specify the paths to all of the template files in your project
  content: [
    // Include all JavaScript, TypeScript, JSX, TSX, and MDX files in the pages directory
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    
    // Include all JavaScript, TypeScript, JSX, TSX, and MDX files in the components directory
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    
    // Include all JavaScript, TypeScript, JSX, TSX, and MDX files in the app directory
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  // Extend the default theme with custom configurations
  theme: {
    extend: {
      // Custom background image utilities using CSS gradients
      backgroundImage: {
        // Radial gradient with custom stops defined via CSS variables
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        
        // Conic gradient starting at the center and rotating from 180 degrees
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },

  // Specify any Tailwind CSS plugins you want to use
  plugins: [],
};

// Export the configuration to be used by Tailwind CSS
export default config;
