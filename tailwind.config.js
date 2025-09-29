/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./app/**/*.{js,jsx,ts,tsx}"],
	presets: [require("nativewind/preset")],
	theme: {
		extend: {
			fontFamily: {
				lexend: ["Lexend-Regular", "sans-serif"],
				lexendMedium: ["Lexend-Medium", "sans-serif"],
				lexendSemiBold: ["Lexend-SemiBold", "sans-serif"],
				lexendBold: ["Lexend-Bold", "sans-serif"],
				lexendExtraBold: ["Lexend-ExtraBold", "sans-serif"],
				lexendLight: ["Lexend-Light", "sans-serif"],
				lexendExtraLight: ["Lexend-ExtraLight", "sans-serif"],

				figtree: ["Figtree-Regular", "sans-serif"],
				figtreeMedium: ["Figtree-Medium", "sans-serif"],
				figtreeSemiBold: ["Figtree-SemiBold", "sans-serif"],
				figtreeBold: ["Figtree-Bold", "sans-serif"],
				figtreeExtraBold: ["Figtree-ExtraBold", "sans-serif"],
				figtreeLight: ["Figtree-Light", "sans-serif"],
			},
			colors: {
				subtletext: "#777",
			},
		},
	},
	plugins: [],
};
