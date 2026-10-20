'use client'

import { CONTACT } from '@/lib/hotspots'
import styles from './booking.module.css'

export function BookingBar() {
  return (
    <nav className={styles.bar} aria-label="Kontakt">
      {(
        <div className={styles.meta}>
          <span className={styles.brand}>DALTON</span>
          <span className={styles.sep} aria-hidden="true" />
          <span>{CONTACT.address}</span>
          <span className={styles.sep} aria-hidden="true" />
          <span>{CONTACT.hours}</span>
        </div>
      )}

      <div className={styles.actions}>
        <a className={styles.ghost} href={CONTACT.instagram} target="_blank" rel="noreferrer noopener">
          Instagram
        </a>
        <a className={styles.primary} href={CONTACT.phoneHref}>
          <span className={styles.primaryLabel}>Zakažite termin</span>
          <span className={styles.primaryPhone}>{CONTACT.phone}</span>
        </a>
      </div>
    </nav>
  )
}
