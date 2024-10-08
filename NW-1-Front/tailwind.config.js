/** @type {import('tailwindcss').Config} */
export default {
	content: [
		"./index.html",
		"./src/**/*.{vue,js,ts,jsx,tsx}",
		"./node_modules/flowbite/**/*.js",
	],
	plugins: [require("daisyui"), require("flowbite/plugin")],
	// darkMode: "class",
	// darkMode: "media",
};
