/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        arabic: ["PNU", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          background: "#F7F8FA", // Light grey background
          sidebar: "#FFFFFF",
          primary: "#5B2A86", // Main purple
          "primary-light": "#F4F3FF", // Light purple for active states
          text: "#101828", // Dark text
          "text-secondary": "#667085", // Lighter text
          border: "#EAECF0", // Light border color
        },
      },
      borderRadius: {
        20: "20px",
      },
      boxShadow: {
        card: "0px 1px 2px rgba(16, 24, 40, 0.06), 0px 1px 3px rgba(16, 24, 40, 0.1)", // Softer shadow for light theme
        insetSoft: "inset 0 0 0 1px rgba(0,0,0,0.06)",
      },
      keyframes: {
        modalIn: {
          "0%": { opacity: 0, transform: "translateY(20px) scale(0.98)" },
          "100%": { opacity: 1, transform: "translateY(0) scale(1)" },
        },
        fadeOut: {
          "100%": { opacity: 0, transform: "scale(0.95)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        "modal-in": "modalIn 300ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-out": "fadeOut 300ms ease-out forwards",
        float: "float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'),
  ],
};
