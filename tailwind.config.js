/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#8B5CF6", // Vivid Purple
          light: "#A78BFA",
          dark: "#7C3AED",
        },
        background: {
          DEFAULT: "#F9F5FF", // Very light lavender/off-white background
          light: "#FFFFFF",
          lighter: "#F3E8FF",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          light: "#F5F3FF",
        },
        text: {
          primary: "#1F2937",   // Dark grey
          secondary: "#6B7280", // Medium grey
          tertiary: "#9CA3AF",  // Light grey
        },
        accent: {
          DEFAULT: "#0EA5E9", // Sky Blue 500
          red: "#EF4444",     // Red 500
          yellow: "#F59E0B",  // Amber 500
        },
      },
    },
  },
  plugins: [],
};
