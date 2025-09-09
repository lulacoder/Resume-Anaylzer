import { measurePerformance } from './performance';

// Type definitions for PDF.js
interface PDFJSLib {
  getDocument: (params: {
    data: ArrayBuffer;
    disableStream?: boolean;
    disableAutoFetch?: boolean;
    rangeChunkSize?: number;
    cMapUrl?: string;
    cMapPacked?: boolean;
    isEvalSupported?: boolean;
    disableFontFace?: boolean;
  }) => {
    promise: Promise<PDFDocumentProxy>;
  };
}

interface PDFDocumentProxy {
  numPages: number;
  getPage: (pageNumber: number) => Promise<PDFPageProxy>;
  getMetadata: () => Promise<{
    info: {
      Title?: string;
      Author?: string;
      CreationDate?: string;
      IsEncrypted?: boolean;
    };
  }>;
}

interface PDFPageProxy {
  getTextContent: () => Promise<{
    items: Array<{ str?: string;[key: string]: unknown }>;
  }>;
}

// Lazy load PDF.js to avoid server-side issues during build
let pdfjsLib: PDFJSLib | null = null;

async function getPdfjsLib(): Promise<PDFJSLib> {
  if (!pdfjsLib) {
    try {
      // Check if we're in a browser environment
      const isClient = typeof window !== 'undefined' &&
        typeof window.document !== 'undefined' &&
        typeof window.document.createElement !== 'undefined';

      if (isClient) {
        // Client-side: use standard build
        pdfjsLib = await import('pdfjs-dist') as PDFJSLib;
      } else {
        // Server-side: use a simple mock implementation for validation
        // This avoids the DOMMatrix issue in Node.js
        pdfjsLib = createServerSidePdfMock();
      }
    } catch (error) {
      console.error('Error loading PDF.js:', error);
      // Fallback to mock implementation
      pdfjsLib = createServerSidePdfMock();
    }
  }
  return pdfjsLib;
}

// Create a simple mock implementation for server-side PDF validation
function createServerSidePdfMock(): PDFJSLib {
  return {
    getDocument: (params: { data: ArrayBuffer }) => {
      // For server-side, we'll just do basic header validation
      // and return a simplified document proxy
      const buffer = params.data;
      const header = new Uint8Array(buffer.slice(0, 4));
      const headerStr = String.fromCharCode(...header);

      if (headerStr !== '%PDF') {
        return {
          promise: Promise.reject(new Error('Not a valid PDF file'))
        };
      }

      return {
        promise: Promise.resolve({
          numPages: 1, // We don't actually know, but this is just for validation
          getPage: () => Promise.resolve({
            getTextContent: () => Promise.resolve({ items: [] })
          }),
          getMetadata: () => Promise.resolve({ info: {} })
        })
      };
    }
  } as PDFJSLib;
}

// Size threshold for chunked processing (in bytes)
const LARGE_FILE_THRESHOLD = 2 * 1024 * 1024; // 2MB
const VERY_LARGE_FILE_THRESHOLD = 10 * 1024 * 1024; // 10MB

// Processing configuration
const BATCH_SIZE = 5; // Number of pages to process in a batch
const CHUNK_SIZE = 65536; // 64KB chunks for streaming

/**
 * Custom error types for better error handling
 */
export class PDFProcessingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PDFProcessingError';
  }
}

export class CorruptedPDFError extends PDFProcessingError {
  constructor(message = 'The PDF file appears to be corrupted') {
    super(message);
    this.name = 'CorruptedPDFError';
  }
}

export class PasswordProtectedPDFError extends PDFProcessingError {
  constructor(message = 'The PDF file is password protected') {
    super(message);
    this.name = 'PasswordProtectedPDFError';
  }
}

export class UnsupportedPDFError extends PDFProcessingError {
  constructor(message = 'The PDF format is not supported') {
    super(message);
    this.name = 'UnsupportedPDFError';
  }
}

/**
 * Progress tracking interface for PDF processing
 */
export interface PDFProcessingProgress {
  totalPages: number;
  processedPages: number;
  percentComplete: number;
}

/**
 * Parse PDF file using streaming for better performance
 * This implementation handles large files efficiently through chunked processing
 */
export async function parsePdf(
  fileBuffer: ArrayBuffer,
  onProgress?: (progress: PDFProcessingProgress) => void
): Promise<string | null> {
  return measurePerformance('pdf-parsing', async () => {
    try {
      // Check if we're in a server environment
      const isServer = typeof window === 'undefined';

      if (isServer) {
        // On server, we can't use PDF.js properly, so we'll extract text using a different approach
        console.log('Server-side PDF processing - using basic text extraction');

        // Basic PDF header validation
        const header = new Uint8Array(fileBuffer.slice(0, 4));
        const headerStr = String.fromCharCode.apply(null, Array.from(header));

        if (headerStr !== '%PDF') {
          throw new PDFProcessingError('Not a valid PDF file');
        }

        // For server-side, we'll return a placeholder message
        // The actual processing will happen client-side
        return "PDF content will be processed client-side";
      }

      // Client-side processing
      await getPdfjsLib();

      // Validate the PDF before processing
      const validation = await validatePdf(fileBuffer);
      if (!validation.valid) {
        throw new PDFProcessingError(validation.error || 'Invalid PDF file');
      }

      // Determine processing strategy based on file size
      const fileSize = fileBuffer.byteLength;
      const isLargeFile = fileSize > LARGE_FILE_THRESHOLD;
      const isVeryLargeFile = fileSize > VERY_LARGE_FILE_THRESHOLD;

      console.log(`PDF size: ${(fileSize / (1024 * 1024)).toFixed(2)}MB`);

      if (isVeryLargeFile) {
        console.log('Very large PDF detected, using optimized streaming processing');
        return await processVeryLargePdf(fileBuffer, onProgress);
      } else if (isLargeFile) {
        console.log('Large PDF detected, using chunked processing');
        return await processLargePdf(fileBuffer, onProgress);
      } else {
        return await processStandardPdf(fileBuffer);
      }
    } catch (error) {
      console.error('Error parsing PDF:', error);

      // Convert generic errors to specific error types
      if (error instanceof Error) {
        if (error.message.includes('Invalid PDF')) {
          throw new UnsupportedPDFError();
        }
        if (error.message.includes('Corrupted')) {
          throw new CorruptedPDFError();
        }
        if (error.message.includes('password')) {
          throw new PasswordProtectedPDFError();
        }
        // Re-throw custom errors
        if (error instanceof PDFProcessingError) {
          throw error;
        }
      }

      // Generic error fallback
      throw new PDFProcessingError('Failed to process PDF file');
    }
  });
}

/**
 * Process a standard-sized PDF file
 */
async function processStandardPdf(fileBuffer: ArrayBuffer): Promise<string | null> {
  try {
    const pdfLib = await getPdfjsLib();
    // Load the PDF document with server-side configuration
    const loadingTask = pdfLib.getDocument({
      data: fileBuffer,
      ...(typeof window === 'undefined' && {
        isEvalSupported: false,
        disableFontFace: true,
      }),
    });
    const pdf = await loadingTask.promise;

    // Get total number of pages
    const numPages = pdf.numPages;

    // Extract text from all pages
    let fullText = '';
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: { str?: string;[key: string]: unknown }) => 'str' in item ? item.str : '')
        .join(' ');

      fullText += pageText + ' ';
    }

    // Clean up the text
    fullText = cleanPdfText(fullText);

    return fullText.length > 0 ? fullText : null;
  } catch (error) {
    console.error('Error in standard PDF processing:', error);
    throw error;
  }
}

/**
 * Process a large PDF file using chunked processing
 * This prevents timeouts and memory issues with large files
 */
async function processLargePdf(
  fileBuffer: ArrayBuffer,
  onProgress?: (progress: PDFProcessingProgress) => void
): Promise<string | null> {
  try {
    // Ensure PDF.js is loaded
    const pdfLib = await getPdfjsLib();

    // Load the PDF document with streaming enabled
    const loadingTask = pdfLib.getDocument({
      data: fileBuffer,
      disableStream: false,
      disableAutoFetch: false,
      rangeChunkSize: CHUNK_SIZE,
      ...(typeof window === 'undefined' && {
        isEvalSupported: false,
        disableFontFace: true,
      }),
    });

    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;

    // Process pages in batches to prevent memory issues
    let fullText = '';
    let processedPages = 0;

    for (let batchStart = 1; batchStart <= numPages; batchStart += BATCH_SIZE) {
      const batchEnd = Math.min(batchStart + BATCH_SIZE - 1, numPages);
      console.log(`Processing PDF pages ${batchStart}-${batchEnd} of ${numPages}`);

      // Process batch of pages
      const batchPromises = [];
      for (let i = batchStart; i <= batchEnd; i++) {
        batchPromises.push(extractPageText(pdf, i));
      }

      const batchResults = await Promise.all(batchPromises);
      fullText += batchResults.join(' ');

      // Update progress
      processedPages += (batchEnd - batchStart + 1);
      if (onProgress) {
        onProgress({
          totalPages: numPages,
          processedPages,
          percentComplete: Math.round((processedPages / numPages) * 100)
        });
      }

      // Small delay between batches to allow for GC
      if (batchEnd < numPages) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }

    // Clean up the text
    fullText = cleanPdfText(fullText);

    return fullText.length > 0 ? fullText : null;
  } catch (error) {
    console.error('Error in chunked PDF processing:', error);
    throw error;
  }
}

/**
 * Process very large PDF files with extreme optimization
 * Uses smaller chunks and more aggressive memory management
 */
async function processVeryLargePdf(
  fileBuffer: ArrayBuffer,
  onProgress?: (progress: PDFProcessingProgress) => void
): Promise<string | null> {
  try {
    const pdfLib = await getPdfjsLib();
    // Load the PDF document with optimized streaming settings
    const loadingTask = pdfLib.getDocument({
      data: fileBuffer,
      disableStream: false,
      disableAutoFetch: false,
      rangeChunkSize: CHUNK_SIZE / 2, // Smaller chunks for very large files
      cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.4.120/cmaps/',
      cMapPacked: true,
    });

    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;

    // For very large PDFs, process even smaller batches
    const smallerBatchSize = 3;
    let textChunks: string[] = [];
    let processedPages = 0;

    for (let batchStart = 1; batchStart <= numPages; batchStart += smallerBatchSize) {
      const batchEnd = Math.min(batchStart + smallerBatchSize - 1, numPages);
      console.log(`Processing very large PDF pages ${batchStart}-${batchEnd} of ${numPages}`);

      // Process one page at a time to minimize memory usage
      for (let i = batchStart; i <= batchEnd; i++) {
        const pageText = await extractPageText(pdf, i);
        textChunks.push(pageText);

        // Update progress after each page
        processedPages++;
        if (onProgress) {
          onProgress({
            totalPages: numPages,
            processedPages,
            percentComplete: Math.round((processedPages / numPages) * 100)
          });
        }

        // Force garbage collection opportunity
        await new Promise(resolve => setTimeout(resolve, 5));
      }

      // Longer pause between batches for memory cleanup
      if (batchEnd < numPages) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }

    // Join and clean text
    const fullText = cleanPdfText(textChunks.join(' '));

    // Clear the array to help with garbage collection
    textChunks = [];

    return fullText.length > 0 ? fullText : null;
  } catch (error) {
    console.error('Error in optimized PDF processing:', error);
    throw error;
  }
}

/**
 * Extract text from a single page
 */
async function extractPageText(pdf: PDFDocumentProxy, pageNum: number): Promise<string> {
  try {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();

    const pageText = textContent.items
      .map((item: { str?: string;[key: string]: unknown }) => 'str' in item ? item.str : '')
      .join(' ');

    // Help garbage collection by removing references
    // Note: PDF.js handles cleanup automatically, no explicit cleanup needed
    // The page object will be garbage collected when it goes out of scope

    return pageText;
  } catch (error) {
    console.error(`Error extracting text from page ${pageNum}:`, error);
    return ''; // Return empty string for failed pages
  }
}

/**
 * Clean and normalize PDF text
 */
function cleanPdfText(text: string): string {
  return text
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
    .trim();
}

/**
 * Validate PDF file before processing
 * This can be used to quickly check if a file is a valid PDF
 */
export async function validatePdf(fileBuffer: ArrayBuffer): Promise<{
  valid: boolean;
  pageCount?: number;
  error?: string;
}> {
  try {
    // Check basic PDF header - this works in both client and server
    const header = new Uint8Array(fileBuffer.slice(0, 4));
    const headerStr = String.fromCharCode.apply(null, Array.from(header));

    if (headerStr !== '%PDF') {
      return { valid: false, error: 'Not a valid PDF file' };
    }

    // Check if we're in a server environment
    const isServer = typeof window === 'undefined';

    if (isServer) {
      // On server, just do basic validation
      console.log('Server-side PDF validation - basic header check only');
      return { valid: true, pageCount: 1 }; // We don't know the actual page count
    }

    // Client-side full validation
    const pdfLib = await getPdfjsLib();
    const loadingTask = pdfLib.getDocument({
      data: fileBuffer,
      disableStream: true,
      disableAutoFetch: true,
    });

    const pdf = await loadingTask.promise;
    const pageCount = pdf.numPages;

    // Check if the PDF has any pages
    if (pageCount < 1) {
      return { valid: false, error: 'PDF contains no pages' };
    }

    return { valid: true, pageCount };
  } catch (error) {
    console.error('PDF validation error:', error);

    let errorMessage = 'Invalid or corrupted PDF file';
    if (error instanceof Error) {
      if (error.message.includes('password')) {
        errorMessage = 'PDF is password protected';
      } else if (error.message.includes('Corrupted')) {
        errorMessage = 'PDF file is corrupted';
      } else if (error.message.includes('DOMMatrix')) {
        errorMessage = 'PDF processing not supported in this environment';
      }
    }

    return { valid: false, error: errorMessage };
  }
}

/**
 * Get PDF metadata without extracting content
 * Useful for quick file inspection
 */
export async function getPdfMetadata(fileBuffer: ArrayBuffer): Promise<{
  pageCount: number;
  isEncrypted: boolean;
  title?: string;
  author?: string;
  creationDate?: Date;
  fileSize: string;
}> {
  try {
    const pdfLib = await getPdfjsLib();
    const loadingTask = pdfLib.getDocument({
      data: fileBuffer,
      disableStream: true,
      disableAutoFetch: true,
    });

    const pdf = await loadingTask.promise;
    const metadata = await pdf.getMetadata();

    interface PdfInfo {
      Title?: string;
      Author?: string;
      CreationDate?: string;
      IsEncrypted?: boolean;
    }

    const info = metadata.info as PdfInfo;

    return {
      pageCount: pdf.numPages,
      isEncrypted: !!info.IsEncrypted,
      title: info.Title,
      author: info.Author,
      creationDate: info.CreationDate ? new Date(info.CreationDate) : undefined,
      fileSize: `${(fileBuffer.byteLength / (1024 * 1024)).toFixed(2)}MB`,
    };
  } catch (error) {
    console.error('Error getting PDF metadata:', error);
    throw new PDFProcessingError('Failed to read PDF metadata');
  }
};
