// src/pages/resume.ts
import { getDocument, GlobalWorkerOptions, type PDFDocumentProxy } from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { loadNavbar } from "../loadNavbar";
loadNavbar();
import { loadfootbar } from "../loadfootbar";
loadfootbar();

// Point PDF.js to its worker (Vite serves the URL returned by ?url)
GlobalWorkerOptions.workerSrc = workerSrc;

const url = '/casestudies/Resume.pdf'; // file must be in /public/casestudies/Resume.pdf
const container = document.getElementById('pdf-container') as HTMLDivElement | null;
const loading = document.getElementById('pdf-loading') as HTMLDivElement | null;

(async () => {
  if (!container) {
    console.error('Missing #pdf-container in DOM');
    return;
  }

  try {
    const pdf: PDFDocumentProxy = await getDocument(url).promise;
    loading?.remove();

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.5 });

      const canvas = document.createElement('canvas');
      canvas.className = 'w-full block rounded-lg shadow-sm';
      const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

      // HiDPI rendering
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;

      container.appendChild(canvas);

      await page.render({
        canvas,                 // required in pdfjs v5 types
        canvasContext: ctx,
        viewport,
        transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined,
      }).promise;
    }
  } catch (err) {
    console.error('PDF.js error:', err);
    if (loading) loading.textContent = 'Failed to load PDF. Verify /public/casestudies/Resume.pdf and restart dev server.';
  }
})();
