'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './DemoBanner.module.css'

interface Props {
  label?: string
}

export default function DemoBanner({ label }: Props) {
  const router = useRouter()
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className={styles.banner} role="banner" aria-label="Demo melding">
      <div className={styles.inner}>
        <div className={styles.left}>
          <span className={styles.badge}>DEMO</span>
          <span className={styles.text}>
            {label
              ? <>U bekijkt een demo van <strong>{label}</strong></>
              : <>Dit is een <strong>demo pagina</strong> — geen echte website</>}
          </span>
        </div>
        <div className={styles.right}>
          <button
            className={styles.homeBtn}
            onClick={() => router.push('/')}
            aria-label="Terug naar homepage"
          >
            ← Terug naar home
          </button>
          <button
            className={styles.closeBtn}
            onClick={() => setDismissed(true)}
            aria-label="Sluit demobanner"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}
