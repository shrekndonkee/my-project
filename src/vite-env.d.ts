// src/vite-env.d.ts
/// <reference types="vite/client" />

declare module '*?url' {
  const src: string;
  export default src;
}

/// <reference types="vite/client" />

declare module 'pdfjs-dist/build/pdf';
declare module 'pdfjs-dist/build/pdf.worker.min.js?url';

