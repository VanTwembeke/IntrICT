// app/demo/[description]/page.tsx
//
// Serves  public/demo/[description]/index.html  inside an iframe,
// with the DemoBanner rendered above it in the Next.js shell.
//
// URL:  /demo/psycholoog-nevele   →  public/demo/psycholoog-nevele/index.html

import { notFound } from 'next/navigation'
import { existsSync } from 'fs'
import path from 'path'
import DemoBanner from '@/components/DemoBanner'
import styles from './demo.module.css'

interface Props {
  params: { description: string }
}

// Build a human-readable label from the slug  e.g. "psycholoog-nevele" → "Psycholoog Nevele"
function slugToLabel(slug: string) {
  return slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export default function DemoPage({ params }: Props) {
  const { description } = params

  // Guard: make sure the HTML file actually exists in public/
  const filePath = path.join(process.cwd(), 'public', 'demo', description, 'index.html')
  if (!existsSync(filePath)) notFound()

  const label = slugToLabel(description)
  // The iframe src points directly to the static file Next.js serves from /public
  const src = `/demo/${description}/demo.html`

  return (
    <>
      <DemoBanner label={label} />
      <iframe
        src={src}
        className={styles.frame}
        title={`Demo: ${label}`}
        // Allow the page inside to work fully
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
      />
    </>
  )
}

// Tell Next.js this page is dynamic (reads filesystem at request time)
export const dynamic = 'force-dynamic'
