/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#C9F31D", // Neon Lime
          light: "#D8F753",
          dark: "#A3C710",
        },
        background: {
          DEFAULT: "#FFFFFF", // Pure White
          light: "#FFFFFF",
          lighter: "#F5F5F5",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          light: "#F5F5F5",
        },
        text: {
          primary: "#000000", // Pure Black
          secondary: "#666666",
          tertiary: "#999999",
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
