/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: "class",
    // darkMode: ["class", ":global(html.dark-mode)"],
    content: ["./src/**/*.{html,js,svelte,ts}"],
    theme: {
        extend: {
            colors: {
                svelte: "#F2440D",
                svelte_dark: "#f25929",
            },
        },
    },
    plugins: [require("@tailwindcss/forms")],
};
