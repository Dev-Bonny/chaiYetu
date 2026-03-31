// frontend/tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx}',
    './src/hooks/**/*.{js,ts,jsx,tsx}',
    './src/store/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // Primary brand colors
        primary: {
          50: '#f0f9f0',
          100: '#dcf2dc',
          200: '#bce6bc',
          300: '#8dd58d',
          400: '#5abd5a',
          500: '#3a9d3a', // Main primary color
          600: '#2d7d2d',
          700: '#256325',
          800: '#1f4f1f',
          900: '#1a421a',
          950: '#0d230d',
        },
        
        // Tea-themed colors
        tea: {
          50: '#f7faf7',
          100: '#e9f5e9',
          200: '#d4e8d4',
          300: '#b2d5b2',
          400: '#85ba85',
          500: '#5fa05f', // Main tea color
          600: '#4a834a',
          700: '#3c693c',
          800: '#335433',
          900: '#2c462c',
          950: '#162616',
        },
        
        // Kenya-themed colors
        kenya: {
          50: '#fef7f0',
          100: '#fdecd9',
          200: '#fbd5b2',
          300: '#f8b680',
          400: '#f38b47',
          500: '#f06f21', // Kenya orange
          600: '#e15917',
          700: '#bb4515',
          800: '#953919',
          900: '#783218',
          950: '#41170a',
        },
        
        // Farmer colors
        farmer: {
          50: '#fdf8ed',
          100: '#f9eccd',
          200: '#f2d798',
          300: '#eab959',
          400: '#e3a22f',
          500: '#d4891c', // Farmer brown
          600: '#b66b17',
          700: '#914e16',
          800: '#773f19',
          900: '#65361a',
          950: '#3a1b0a',
        },
        
        // Collector colors
        collector: {
          50: '#eff8ff',
          100: '#dbeffe',
          200: '#bfe3fe',
          300: '#93d1fd',
          400: '#60b6fa',
          500: '#3b99f6', // Collector blue
          600: '#257aeb',
          700: '#1d64d8',
          800: '#1e51af',
          900: '#1e478a',
          950: '#172c54',
        },
        
        // Admin colors
        admin: {
          50: '#f8f6ff',
          100: '#f0edff',
          200: '#e4dfff',
          300: '#cdc3ff',
          400: '#b09eff',
          500: '#9170ff', // Admin purple
          600: '#7e4af5',
          700: '#6e36d8',
          800: '#5c2db4',
          900: '#4d2793',
          950: '#2e145f',
        },
        
        // Quality grade colors
        grade: {
          1: {
            50: '#f0fdf4',
            100: '#dcfce7',
            500: '#22c55e', // Grade 1 - Premium green
            600: '#16a34a',
            700: '#15803d',
          },
          2: {
            50: '#fefce8',
            100: '#fef9c3',
            500: '#eab308', // Grade 2 - Standard yellow
            600: '#ca8a04',
            700: '#a16207',
          },
          3: {
            50: '#fff7ed',
            100: '#ffedd5',
            500: '#f97316', // Grade 3 - Economy orange
            600: '#ea580c',
            700: '#c2410c',
          },
        },
        
        // Status colors
        status: {
          pending: {
            light: '#fef3c7',
            DEFAULT: '#f59e0b',
            dark: '#d97706',
          },
          verified: {
            light: '#d1fae5',
            DEFAULT: '#10b981',
            dark: '#059669',
          },
          rejected: {
            light: '#fee2e2',
            DEFAULT: '#ef4444',
            dark: '#dc2626',
          },
          paid: {
            light: '#dbeafe',
            DEFAULT: '#3b82f6',
            dark: '#2563eb',
          },
          active: {
            light: '#d1fae5',
            DEFAULT: '#10b981',
            dark: '#059669',
          },
          inactive: {
            light: '#f3f4f6',
            DEFAULT: '#6b7280',
            dark: '#4b5563',
          },
          suspended: {
            light: '#fee2e2',
            DEFAULT: '#ef4444',
            dark: '#dc2626',
          },
        },
        
        // Payment method colors
        payment: {
          mpesa: {
            light: '#e0f2fe',
            DEFAULT: '#0ea5e9',
            dark: '#0284c7',
          },
          bank: {
            light: '#f0f9ff',
            DEFAULT: '#0369a1',
            dark: '#075985',
          },
          cash: {
            light: '#fef3c7',
            DEFAULT: '#f59e0b',
            dark: '#d97706',
          },
        },
        
        // Weather colors
        weather: {
          sunny: '#fbbf24',
          cloudy: '#94a3b8',
          rainy: '#3b82f6',
          mixed: '#8b5cf6',
        },
        
        // Border colors
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        
        // Additional semantic colors
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'Liberation Mono',
          'Courier New',
          'monospace',
        ],
        display: [
          'Plus Jakarta Sans',
          'Inter',
          'ui-sans-serif',
          'system-ui',
        ],
      },
      
      fontSize: {
        '2xs': '0.625rem', // 10px
        '3xs': '0.5rem',   // 8px
      },
      
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
      },
      
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-out': {
          from: { opacity: '1' },
          to: { opacity: '0' },
        },
        'slide-in-from-bottom': {
          from: { transform: 'translateY(10px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-out-to-bottom': {
          from: { transform: 'translateY(0)', opacity: '1' },
          to: { transform: 'translateY(10px)', opacity: '0' },
        },
        'slide-in-from-top': {
          from: { transform: 'translateY(-10px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-out-to-top': {
          from: { transform: 'translateY(0)', opacity: '1' },
          to: { transform: 'translateY(-10px)', opacity: '0' },
        },
        'scale-in': {
          from: { transform: 'scale(0.95)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
        'scale-out': {
          from: { transform: 'scale(1)', opacity: '1' },
          to: { transform: 'scale(0.95)', opacity: '0' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        'pulse-fast': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'spin-reverse': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(-360deg)' },
        },
        'bounce-slow': {
          '0%, 100%': { 
            transform: 'translateY(0)' 
          },
          '50%': { 
            transform: 'translateY(-10px)' 
          },
        },
        'bounce-fast': {
          '0%, 100%': { 
            transform: 'translateY(0)' 
          },
          '50%': { 
            transform: 'translateY(-5px)' 
          },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200px 0' },
          '100%': { backgroundPosition: 'calc(200px + 100%) 0' },
        },
        'progress': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'rainbow': {
          '0%': { backgroundColor: '#ff0000' },
          '14%': { backgroundColor: '#ff7f00' },
          '28%': { backgroundColor: '#ffff00' },
          '42%': { backgroundColor: '#00ff00' },
          '57%': { backgroundColor: '#0000ff' },
          '71%': { backgroundColor: '#4b0082' },
          '85%': { backgroundColor: '#9400d3' },
          '100%': { backgroundColor: '#ff0000' },
        },
      },
      
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'fade-out': 'fade-out 0.3s ease-out',
        'slide-in-from-bottom': 'slide-in-from-bottom 0.3s ease-out',
        'slide-out-to-bottom': 'slide-out-to-bottom 0.3s ease-out',
        'slide-in-from-top': 'slide-in-from-top 0.3s ease-out',
        'slide-out-to-top': 'slide-out-to-top 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'scale-out': 'scale-out 0.2s ease-out',
        'pulse-slow': 'pulse-slow 2s ease-in-out infinite',
        'pulse-fast': 'pulse-fast 1s ease-in-out infinite',
        'spin-slow': 'spin-slow 3s linear infinite',
        'spin-reverse': 'spin-reverse 1s linear infinite',
        'bounce-slow': 'bounce-slow 2s ease-in-out infinite',
        'bounce-fast': 'bounce-fast 1s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite linear',
        'progress': 'progress 2s ease-in-out infinite',
        'rainbow': 'rainbow 10s linear infinite',
      },
      
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-tea': 'linear-gradient(135deg, #3a9d3a 0%, #2d7d2d 100%)',
        'gradient-farmer': 'linear-gradient(135deg, #d4891c 0%, #b66b17 100%)',
        'gradient-collector': 'linear-gradient(135deg, #3b99f6 0%, #257aeb 100%)',
        'gradient-admin': 'linear-gradient(135deg, #9170ff 0%, #6e36d8 100%)',
        'gradient-kenya': 'linear-gradient(135deg, #f06f21 0%, #e15917 100%)',
        'gradient-success': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        'gradient-warning': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        'gradient-error': 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        'gradient-grade1': 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
        'gradient-grade2': 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
        'gradient-grade3': 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
        'gradient-mesh': 'url("/images/mesh-gradient.png")',
        'grid-pattern': 'url("/images/grid-pattern.svg")',
        'topography-pattern': 'url("/images/topography.svg")',
      },
      
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 20px -2px rgba(0, 0, 0, 0.08), 0 12px 30px -3px rgba(0, 0, 0, 0.06)',
        'hard': '0 10px 40px -5px rgba(0, 0, 0, 0.1), 0 20px 50px -5px rgba(0, 0, 0, 0.08)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'inner-medium': 'inset 0 4px 8px 0 rgba(0, 0, 0, 0.08)',
        'glow': '0 0 20px rgba(58, 157, 58, 0.3)',
        'glow-tea': '0 0 20px rgba(95, 160, 95, 0.3)',
        'glow-success': '0 0 20px rgba(16, 185, 129, 0.3)',
        'glow-warning': '0 0 20px rgba(245, 158, 11, 0.3)',
        'glow-error': '0 0 20px rgba(239, 68, 68, 0.3)',
        'elevation-1': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'elevation-2': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'elevation-3': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'elevation-4': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'elevation-5': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      
      backdropBlur: {
        xs: '2px',
      },
      
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
        '1000': '1000ms',
        '1200': '1200ms',
      },
      
      transitionTimingFunction: {
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'elastic': 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
        'max': '9999',
      },
      
      opacity: {
        '15': '0.15',
        '85': '0.85',
        '95': '0.95',
      },
      
      scale: {
        '98': '0.98',
        '102': '1.02',
      },
      
      rotate: {
        '135': '135deg',
        '225': '225deg',
        '270': '270deg',
        '315': '315deg',
      },
      
      skew: {
        '15': '15deg',
        '30': '30deg',
      },
    },
  },
  
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    
    // Custom utilities plugin
    function({ addUtilities, theme }: any) {
      const newUtilities = {
        // Text utilities
        '.text-balance': {
          textWrap: 'balance',
        },
        '.text-pretty': {
          textWrap: 'pretty',
        },
        
        // Scroll utilities
        '.scrollbar-thin': {
          scrollbarWidth: 'thin',
        },
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
        
        // Gradient text
        '.text-gradient': {
          background: 'linear-gradient(135deg, #3a9d3a 0%, #2d7d2d 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        },
        '.text-gradient-tea': {
          background: 'linear-gradient(135deg, #5fa05f 0%, #4a834a 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        },
        
        // Glass morphism
        '.glass': {
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        },
        '.glass-dark': {
          background: 'rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
        
        // Card hover effects
        '.card-hover': {
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: theme('boxShadow.medium'),
          },
        },
        
        // Button hover effects
        '.btn-hover': {
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: theme('boxShadow.soft'),
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        
        // Status badges
        '.badge-grade1': {
          backgroundColor: theme('colors.grade.1.100'),
          color: theme('colors.grade.1.700'),
          borderColor: theme('colors.grade.1.300'),
        },
        '.badge-grade2': {
          backgroundColor: theme('colors.grade.2.100'),
          color: theme('colors.grade.2.700'),
          borderColor: theme('colors.grade.2.300'),
        },
        '.badge-grade3': {
          backgroundColor: theme('colors.grade.3.100'),
          color: theme('colors.grade.3.700'),
          borderColor: theme('colors.grade.3.300'),
        },
        
        // Loading shimmer
        '.shimmer-effect': {
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
          backgroundSize: '200px 100%',
          animation: 'shimmer 2s infinite linear',
        },
        
        // Line clamp utilities
        '.line-clamp-1': {
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: '1',
          WebkitBoxOrient: 'vertical',
        },
        '.line-clamp-2': {
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: '2',
          WebkitBoxOrient: 'vertical',
        },
        '.line-clamp-3': {
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: '3',
          WebkitBoxOrient: 'vertical',
        },
        '.line-clamp-4': {
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: '4',
          WebkitBoxOrient: 'vertical',
        },
        '.line-clamp-5': {
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: '5',
          WebkitBoxOrient: 'vertical',
        },
        
        // Hide scrollbar but keep functionality
        '.no-scrollbar': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
        
        // Aspect ratio utilities
        '.aspect-phone': {
          aspectRatio: '9/16',
        },
        '.aspect-square': {
          aspectRatio: '1/1',
        },
        '.aspect-video': {
          aspectRatio: '16/9',
        },
        
        // Grid utilities
        '.grid-cols-auto-fit': {
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        },
        '.grid-cols-auto-fill': {
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        },
        
        // Animation delays
        '.animation-delay-100': {
          animationDelay: '100ms',
        },
        '.animation-delay-200': {
          animationDelay: '200ms',
        },
        '.animation-delay-300': {
          animationDelay: '300ms',
        },
        '.animation-delay-400': {
          animationDelay: '400ms',
        },
        '.animation-delay-500': {
          animationDelay: '500ms',
        },
        
        // Focus visible utilities
        '.focus-visible-ring': {
          '&:focus-visible': {
            outline: 'none',
            ringWidth: '2px',
            ringColor: theme('colors.primary.500'),
            ringOffsetWidth: '2px',
            ringOffsetColor: theme('colors.white'),
          },
        },
        
        // Selection styles
        '.selection-primary': {
          '&::selection': {
            backgroundColor: theme('colors.primary.500'),
            color: theme('colors.white'),
          },
        },
        
        // Print utilities
        '.print-hidden': {
          '@media print': {
            display: 'none',
          },
        },
      }
      
      addUtilities(newUtilities, ['responsive', 'hover'])
    },
  ],
}

export default config