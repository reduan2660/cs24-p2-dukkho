/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        xblue: "#1A73E8",
        xgray: "#555555",
        xlightgray: "#A1A1A1",
        xdark: "#151515",
        xlightergray: "#F0F0F0",
        xlightestgray: "#FAFAFA",
        xred: "#EC3232",
        xyellow: "#EED36E",
      },
    },
  },
  plugins: [],
};
