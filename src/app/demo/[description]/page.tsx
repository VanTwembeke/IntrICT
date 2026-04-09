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
  params: Promise<{ description: string }>
}

function slugToLabel(slug: string) {
  return slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export default async function DemoPage({ params }: Props) {
  const { description } = await params

  const filePath = path.join(process.cwd(), 'public', 'demo', description, 'demo.html')
  if (!existsSync(filePath)) notFound()

  const label = slugToLabel(description)
  const src = `/demo/${description}/demo.html`

  return (
    <>
      <DemoBanner label={label} />
      <iframe
        src={src}
        className={styles.frame}
        title={`Demo: ${label}`}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
      />
    </>
  )
}

export const dynamic = 'force-dynamic'
