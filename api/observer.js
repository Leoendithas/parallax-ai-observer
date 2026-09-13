// Vercel Function adapter for the Observer endpoint.
// dist/server/index.js is a Web-standard fetch handler written for Cloudflare-style
// hosting, so this bridges Vercel's Node request/response objects to it.
import worker from '../dist/server/index.js';

// Hop-by-hop and body-framing headers must not be copied onto the new Request:
// the body is re-attached below, so undici recomputes content-length itself.
const skip = new Set(['content-length', 'transfer-encoding', 'connection', 'keep-alive']);

const readRawBody = req => new Promise((resolve, reject) => {
  let raw = '';
  req.on('data', chunk => {raw += chunk;});
  req.on('end', () => resolve(raw));
  req.on('error', reject);
});

export default async function handler(req, res) {
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const url = new URL('/api/observer', `${proto}://${host}`);

  const headers = new Headers();
  for (const [name, value] of Object.entries(req.headers)) {
    if (value === undefined || skip.has(name.toLowerCase())) continue;
    headers.set(name, Array.isArray(value) ? value.join(', ') : value);
  }
  // The worker rate-limits per client IP via Cloudflare's header; Vercel uses
  // x-forwarded-for. Without this every visitor shares one rate-limit bucket.
  const clientIp = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  if (clientIp) headers.set('cf-connecting-ip', clientIp);

  // Vercel pre-parses JSON bodies, which consumes the stream; re-serialize when it has.
  const body = req.method === 'POST'
    ? (typeof req.body === 'string' ? req.body
      : req.body !== undefined ? JSON.stringify(req.body)
      : await readRawBody(req))
    : undefined;

  const response = await worker.fetch(new Request(url, {method: req.method, headers, body}), {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_OBSERVER_MODEL: process.env.OPENAI_OBSERVER_MODEL,
  });

  res.statusCode = response.status;
  response.headers.forEach((value, name) => res.setHeader(name, value));
  res.end(Buffer.from(await response.arrayBuffer()));
}
