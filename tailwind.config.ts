import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#202124",
        paper: "#f7f5f0",
        line: "#dedbd2",
        teal: {
          50: "#ecfdf7",
          100: "#d1faef",
          600: "#0f8f7e",
          700: "#0a7469"
        },
        coral: {
          50: "#fff1ed",
          100: "#ffded5",
          600: "#e05a42"
        },
        gold: {
          50: "#fff8db",
          100: "#ffefad",
          600: "#b98116"
        }
      },
      boxShadow: {
        panel: "0 18px 48px rgba(32, 33, 36, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
