// src/resume.ts
import { getDocument, GlobalWorkerOptions, type PDFDocumentProxy } from 'pdfjs-dist'
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { loadNavbar } from './loadNavbar'
import { loadfootbar } from './loadfootbar'

// Load shared UI
loadNavbar()
loadfootbar()

// Point PDF.js to its worker (Vite will serve this URL)
GlobalWorkerOptions.workerSrc = workerSrc

// ---- Config ---------------------------------------------------------------
// Put the PDF at: public/docs/resume.pdf   (case-sensitive on prod hosts)
const BASE = import.meta.env.BASE_URL || '/'
const PDF_URL = `${BASE}assets/Resume.pdf`
// ---------------------------------------------------------------------------

const container = document.getElementById('pdf-container') as HTMLDivElement | null
const loadingEl = document.getElementById('pdf-loading') as HTMLDivElement | null

if (container) {
  renderPdf(PDF_URL, container, loadingEl).catch((err) => {
    console.error('PDF load error:', err)
    if (loadingEl) loadingEl.textContent = 'Failed to load PDF.'
  })
}

async function renderPdf(url: string, host: HTMLDivElement, loading?: HTMLDivElement | null) {
  const pdf: PDFDocumentProxy = await getDocument(url).promise
  loading?.remove()

  // Slightly smaller scale on mobile
  const baseScale = window.matchMedia('(max-width: 640px)').matches ? 1.0 : 1.25
  const dpr = window.devicePixelRatio || 1

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum)
    const viewport = page.getViewport({ scale: baseScale })

    // Create and size the canvas (CSS size vs. backing store size for crispness)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d', { alpha: false }) as CanvasRenderingContext2D

    // CSS pixels (layout)
    canvas.style.width = `${viewport.width}px`
    canvas.style.height = `${viewport.height}px`

    // Device pixels (rendering)
    canvas.width = Math.floor(viewport.width * dpr)
    canvas.height = Math.floor(viewport.height * dpr)

    // Scale drawing if DPR > 1
    const transform = dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] as any : undefined

    await page.render({ canvasContext: ctx, viewport, canvas, transform }).promise

    canvas.className = 'w-full block rounded-lg shadow-sm'
    host.appendChild(canvas)
  }
}
