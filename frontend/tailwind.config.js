/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          background: "#f8fafc",
          sidebar: "#ffffff",
          primary: "#742370",
          "primary-light": "#F9F5FF",
          text: "#0f172a",
          "text-secondary": "#475569",
          "text-muted": "#64748b",
          border: "#e2e8f0",
          "border-medium": "#cbd5e1",
        },
      },
      borderRadius: {
        xl: "12px",
        lg: "8px",
      },
      boxShadow: {
        card: "0px 1px 2px rgba(16, 24, 40, 0.06), 0px 1px 3px rgba(16, 24, 40, 0.1)",
      },
      keyframes: {
        modalIn: {
          "0%": { opacity: 0, transform: "translateY(20px) scale(0.98)" },
          "100%": { opacity: 1, transform: "translateY(0) scale(1)" },
        },
      },
      animation: {
        "modal-in": "modalIn 300ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
