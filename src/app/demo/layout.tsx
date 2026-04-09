// app/demo/layout.tsx
// Applies only to /demo/* routes.
// Strips default body margin so the iframe sits flush.

import type { ReactNode } from 'react'

export const metadata = {
  robots: 'noindex, nofollow', // demo pages shouldn't be indexed
}

export default function DemoLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ margin: 0, padding: 0, overflow: 'hidden' }}>
      {children}
    </div>
  )
}
