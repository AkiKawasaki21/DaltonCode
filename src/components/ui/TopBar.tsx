'use client'

import { CONTACT } from '@/lib/hotspots'
import styles from './topbar.module.css'

export function TopBar() {
  return (
    <header className={styles.bar}>
      <span className={styles.brand}>
        <span className={styles.mark}>DALTON</span>
        <span className={styles.sub}>coding</span>
      </span>
      <a className={styles.phone} href={CONTACT.phoneHref}>
        {CONTACT.phone}
      </a>
    </header>
  )
}
