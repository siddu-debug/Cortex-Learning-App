/**
 * Normalizes any ingestion source (PDF buffer, URL, or raw text) into
 * plain text ready to hand to the course generator.
 */
export async function extractFromPdf(buffer: Buffer): Promise<string> {
  // pdf-parse is CJS; dynamic import keeps it out of the client bundle.
  const pdfParse = (await import('pdf-parse')).default;
  const data = await pdfParse(buffer);
  return data.text;
}

export async function extractFromUrl(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'CortexBot/1.0 (+https://cortex.dev)' },
  });
  if (!res.ok) {
    throw new Error(`Could not fetch ${url} (status ${res.status})`);
  }
  const html = await res.text();
  return stripHtml(html);
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}
