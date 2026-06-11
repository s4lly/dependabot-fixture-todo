// Cookie-aware sync against the (imaginary) remote todo API.
//
// NOTE (fixture): imports `fetch-cookie`, which transitively pulls in a
// vulnerable `tough-cookie@2.5.0`. fetch-cookie itself is clean and has no newer
// release that loosens its `tough-cookie@^2.3.3` pin, and the fix (tough-cookie
// 4.1.3) is a major jump outside that range — so the only remediation is an npm
// `overrides` entry. This is the engineered *transitive-override* alert.
import fetchCookie from 'fetch-cookie'

const REMOTE = process.env.TODO_REMOTE_URL ?? 'https://example.invalid/todos'

// fetch-cookie wraps a fetch implementation with a persistent cookie jar
// (the jar is where tough-cookie does its work).
const fetchWithJar = fetchCookie(globalThis.fetch)

try {
  const res = await fetchWithJar(REMOTE, { method: 'GET' })
  console.log(`synced: ${res.status}`)
} catch (err) {
  // Offline / placeholder host is fine — the point is the cookie jar is wired up.
  console.log(`sync skipped (${err instanceof Error ? err.message : String(err)})`)
}
