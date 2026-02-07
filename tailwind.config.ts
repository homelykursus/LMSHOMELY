import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
    darkMode: "class",
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'slide-in-left': {
  				'0%': { opacity: '0', transform: 'translateX(-100%)' },
  				'100%': { opacity: '1', transform: 'translateX(0)' }
  			},
  			'slide-out-left': {
  				'0%': { opacity: '1', transform: 'translateX(0)' },
  				'100%': { opacity: '0', transform: 'translateX(-100%)' }
  			},
  			'slide-in-right': {
  				'0%': { opacity: '0', transform: 'translateX(100%)' },
  				'100%': { opacity: '1', transform: 'translateX(0)' }
  			},
  			'slide-out-right': {
  				'0%': { opacity: '1', transform: 'translateX(0)' },
  				'100%': { opacity: '0', transform: 'translateX(100%)' }
  			},
  			'float-continuous': {
  				'0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
  				'25%': { transform: 'translateY(-15px) rotate(2deg)' },
  				'50%': { transform: 'translateY(-25px) rotate(0deg)' },
  				'75%': { transform: 'translateY(-15px) rotate(-2deg)' }
  			}
  		},
  		animation: {
  			'slide-in-left': 'slide-in-left 0.5s ease-out forwards',
  			'slide-out-left': 'slide-out-left 0.3s ease-in forwards',
  			'slide-in-right': 'slide-in-right 0.5s ease-out forwards',
  			'slide-out-right': 'slide-out-right 0.3s ease-in forwards',
  			'float-continuous': 'float-continuous 4s ease-in-out infinite'
  		}
  	}
  },
  plugins: [tailwindcssAnimate],
};
export default config;
