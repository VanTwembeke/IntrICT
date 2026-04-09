import { readdirSync, existsSync, readFileSync } from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'

export interface DemoMeta {
  slug: string
  title: string
  description: string
  category: string
  technologies: string[]
  accent?: string
  client?: string
}

function slugToLabel(slug: string) {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export function GET() {
  try {
    const demoDir = path.join(process.cwd(), 'public', 'demo')
    if (!existsSync(demoDir)) return NextResponse.json([])

    const entries = readdirSync(demoDir, { withFileTypes: true })
    const demos: DemoMeta[] = []

    for (const entry of entries) {
      if (!entry.isDirectory()) continue
      const slug = entry.name
      const demoHtmlPath = path.join(demoDir, slug, 'demo.html')
      if (!existsSync(demoHtmlPath)) continue

      const metaPath = path.join(demoDir, slug, 'meta.json')
      let meta: Partial<DemoMeta> = {}
      if (existsSync(metaPath)) {
        try {
          meta = JSON.parse(readFileSync(metaPath, 'utf-8'))
        } catch {
          // ignore parse errors, use defaults
        }
      }

      demos.push({
        slug,
        title: meta.title || slugToLabel(slug),
        description: meta.description || '',
        category: meta.category || 'websites',
        technologies: meta.technologies || [],
        accent: meta.accent,
        client: meta.client,
      })
    }

    return NextResponse.json(demos)
  } catch (err) {
    console.error('Failed to list demos:', err)
    return NextResponse.json([])
  }
}

export const dynamic = 'force-dynamic'
