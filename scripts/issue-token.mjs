// Issues a demo session token for the (imaginary) todo sync API.
//
// NOTE (fixture): imports `jsonwebtoken` so the vulnerable dependency is reachable
// from a real Node entrypoint (`npm run token`). jsonwebtoken is the engineered
// *major-bump-required* alert: locked 8.5.1, and every fix lands only in 9.0.0,
// which is outside the `^8.5.1` range — so the remediation is a breaking major
// bump of a direct dependency, not a one-click in-range patch.
import jwt from 'jsonwebtoken'

const secret = process.env.TODO_JWT_SECRET ?? 'dev-only-not-a-real-secret'

const token = jwt.sign(
  { sub: 'demo-user', scope: 'todos:read todos:write' },
  secret,
  { expiresIn: '1h', algorithm: 'HS256' },
)

console.log(token)
console.log('\nverified payload:')
console.log(jwt.verify(token, secret))
