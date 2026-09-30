import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' يجعل الموقع يعمل من أيّ مسار: GitHub Pages أو Netlify أو فتحٌ محليّ.
export default defineConfig({
  plugins: [react()],
  base: './',
  // three.js وحده قرابة 1 ميغابايت (270 كيلو مضغوطاً). يُحمَّل في جزءٍ منفصل
  // بعد ظهور النصّ (React.lazy)، فحجمه لا يؤخّر فتح الصفحة.
  build: { chunkSizeWarningLimit: 1100 },
});
