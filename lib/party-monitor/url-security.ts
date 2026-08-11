import { lookup } from 'node:dns/promises'
import { isIP } from 'node:net'

const MAX_REDIRECTS = 4
export const MAX_RESPONSE_BYTES = 5 * 1024 * 1024
const REQUEST_TIMEOUT_MS = 12_000

const blockedHostnames = new Set([
  'localhost',
  'localhost.localdomain',
  'metadata.google.internal',
  'metadata.aws.internal',
])

export type AddressLookup = (hostname: string) => Promise<string[]>

export type SafeFetchResult = {
  requestedUrl: string
  finalUrl: string
  status: number
  contentType: string | null
  etag: string | null
  lastModified: string | null
  body: Uint8Array
  redirects: string[]
}

export function normalizeMonitoredUrl(value: string) {
  const url = new URL(value.trim())
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('Only HTTP and HTTPS URLs are allowed.')
  }
  if (url.username || url.password) throw new Error('Credentials in URLs are not allowed.')
  url.hash = ''
  url.hostname = url.hostname.toLocaleLowerCase()
  if (
    (url.protocol === 'https:' && url.port === '443') ||
    (url.protocol === 'http:' && url.port === '80')
  ) {
    url.port = ''
  }
  return url.toString()
}

function parseIpv4(address: string) {
  const parts = address.split('.').map(Number)
  if (
    parts.length !== 4 ||
    parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)
  ) {
    return null
  }
  return parts
}

export function isBlockedAddress(address: string) {
  const version = isIP(address)
  if (version === 4) {
    const parts = parseIpv4(address)
    if (!parts) return true
    const [a, b] = parts
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 192 && b === 0) ||
      (a === 192 && b === 0 && parts[2] === 2) ||
      (a === 198 && (b === 18 || b === 19)) ||
      (a === 198 && b === 51 && parts[2] === 100) ||
      (a === 203 && b === 0 && parts[2] === 113) ||
      a >= 224
    )
  }
  if (version === 6) {
    const normalized = address.toLocaleLowerCase()
    return (
      normalized === '::' ||
      normalized === '::1' ||
      normalized.startsWith('fc') ||
      normalized.startsWith('fd') ||
      /^fe[89ab]/.test(normalized) ||
      normalized.startsWith('2001:db8:') ||
      normalized.startsWith('::ffff:127.') ||
      normalized.startsWith('::ffff:10.') ||
      normalized.startsWith('::ffff:192.168.') ||
      normalized.startsWith('::ffff:169.254.')
    )
  }
  return true
}

export const defaultAddressLookup: AddressLookup = async (hostname) => {
  const records = await lookup(hostname, { all: true, verbatim: true })
  return records.map((record) => record.address)
}

export async function assertPublicUrl(value: string, addressLookup = defaultAddressLookup) {
  const normalized = normalizeMonitoredUrl(value)
  const url = new URL(normalized)
  if (blockedHostnames.has(url.hostname) || url.hostname.endsWith('.localhost')) {
    throw new Error('Local and metadata hosts are blocked.')
  }
  const addresses = isIP(url.hostname) ? [url.hostname] : await addressLookup(url.hostname)
  if (addresses.length === 0 || addresses.some(isBlockedAddress)) {
    throw new Error('The URL resolves to a private, reserved, or unavailable address.')
  }
  return normalized
}

async function readLimitedBody(response: Response, maximumBytes: number) {
  const contentLength = Number(response.headers.get('content-length'))
  if (Number.isFinite(contentLength) && contentLength > maximumBytes) {
    throw new Error(`Response exceeds the ${maximumBytes}-byte limit.`)
  }
  if (!response.body) return new Uint8Array()

  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let size = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    size += value.byteLength
    if (size > maximumBytes) {
      await reader.cancel()
      throw new Error(`Response exceeds the ${maximumBytes}-byte limit.`)
    }
    chunks.push(value)
  }
  const body = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) {
    body.set(chunk, offset)
    offset += chunk.byteLength
  }
  return body
}

export async function safeFetch(
  value: string,
  options: {
    fetchImpl?: typeof fetch
    addressLookup?: AddressLookup
    maximumBytes?: number
    timeoutMs?: number
    allowedContentTypes?: string[]
  } = {}
): Promise<SafeFetchResult> {
  const fetchImpl = options.fetchImpl ?? fetch
  const addressLookup = options.addressLookup ?? defaultAddressLookup
  const maximumBytes = options.maximumBytes ?? MAX_RESPONSE_BYTES
  const timeoutMs = options.timeoutMs ?? REQUEST_TIMEOUT_MS
  const redirects: string[] = []
  const requestedUrl = await assertPublicUrl(value, addressLookup)
  let currentUrl = requestedUrl

  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount += 1) {
    const response = await fetchImpl(currentUrl, {
      redirect: 'manual',
      signal: AbortSignal.timeout(timeoutMs),
      headers: {
        'user-agent': 'VwaCivicMonitor/1.0 (+https://vwanou.vercel.app/en/parties)',
        accept: 'text/html,application/pdf,text/plain;q=0.8,*/*;q=0.1',
      },
    })

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location')
      if (!location) throw new Error('Redirect response did not include a location.')
      if (redirectCount === MAX_REDIRECTS) throw new Error('Maximum redirect count exceeded.')
      currentUrl = await assertPublicUrl(new URL(location, currentUrl).toString(), addressLookup)
      redirects.push(currentUrl)
      continue
    }

    const contentType = response.headers.get('content-type')?.split(';')[0].trim() ?? null
    if (
      options.allowedContentTypes &&
      (!contentType || !options.allowedContentTypes.includes(contentType))
    ) {
      throw new Error(`Unexpected content type: ${contentType ?? 'missing'}.`)
    }
    const body = await readLimitedBody(response, maximumBytes)
    return {
      requestedUrl,
      finalUrl: currentUrl,
      status: response.status,
      contentType,
      etag: response.headers.get('etag'),
      lastModified: response.headers.get('last-modified'),
      body,
      redirects,
    }
  }

  throw new Error('Maximum redirect count exceeded.')
}
