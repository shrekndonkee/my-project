// src/pages/viewer.ts
import { getDocument, GlobalWorkerOptions, type PDFDocumentProxy } from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { loadNavbar } from "../src/loadNavbar";
loadNavbar();
import { loadfootbar } from "../src/loadfootbar";
loadfootbar();

// Point PDF.js to its worker (Vite serves this URL)
GlobalWorkerOptions.workerSrc = workerSrc;

const container = document.querySelector<HTMLDivElement>('[data-pdf]');
if (!container) {
  // No viewer on this page
  
} else {
  const srcAttr = container.dataset.pdf || '';
  // Avoid issues with spaces in filenames; prefer renaming, but encode just in case
  const pdfUrl = encodeURI(srcAttr);

  const loading = container.querySelector<HTMLDivElement>('#pdf-loading');

  // Light default scale; adjust for mobile
  const BASE_SCALE = window.matchMedia('(max-width: 640px)').matches ? 1.0 : 1.25;

  (async () => {
    try {
      const pdf: PDFDocumentProxy = await getDocument({ url: pdfUrl }).promise;
      loading?.remove();

      // ---- 1) Create placeholders for all pages (cheap to render) ----
      const placeholders: HTMLDivElement[] = [];
      const frag = document.createDocumentFragment();

      for (let p = 1; p <= pdf.numPages; p++) {
        const holder = document.createElement('div');
        holder.dataset.page = String(p);
        holder.className =
          'w-full min-h-[400px] relative rounded-lg bg-base-200/40 flex items-center justify-center';
        holder.innerHTML = `<span class="text-sm opacity-60">Loading page ${p}…</span>`;
        placeholders.push(holder);
        frag.appendChild(holder);
      }
      container.appendChild(frag);

      // ---- 2) Render a single page on demand ----
      const rendered = new Set<number>();

      const renderPage = async (pageNum: number) => {
        if (rendered.has(pageNum)) return;

        const holder = container.querySelector<HTMLDivElement>(`[data-page="${pageNum}"]`);
        if (!holder) return;

        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: BASE_SCALE });

        const canvas = document.createElement('canvas');
        canvas.className = 'w-full block rounded-lg shadow-sm bg-base-100';
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

        // HiDPI crispness
        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.floor(viewport.width * dpr);
        canvas.height = Math.floor(viewport.height * dpr);
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;

        holder.replaceChildren(canvas);

        await page.render({
          canvas,
          canvasContext: ctx,
          viewport,
          transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined,
        }).promise;

        rendered.add(pageNum);
      };

      // ---- 3) Render page 1 immediately for fast first paint ----
      await renderPage(1);

      // ---- 4) Lazy-render the rest as they enter the viewport ----
      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              const n = Number((e.target as HTMLElement).dataset.page);
              // Defer to keep scrolling smooth
              setTimeout(() => void renderPage(n), 0);
            }
          }
        },
        {
          root: container,         // the scrollable div with h-[90vh]
          rootMargin: '200px 0px', // start a bit before it appears
          threshold: 0.01,
        }
      );

      placeholders.forEach((el) => io.observe(el));

      // Optional: disconnect on unload
      window.addEventListener('beforeunload', () => io.disconnect());
    } catch (err) {
      console.error('PDF render error:', err);
      if (loading) loading.textContent = 'Failed to load PDF.';
    }
  })();
}
