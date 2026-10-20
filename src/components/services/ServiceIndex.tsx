'use client'

import { useId, useState } from 'react'
import { HOTSPOTS, CONTACT, type Hotspot, type HotspotId } from '@/lib/hotspots'
import styles from './services.module.css'

// Derived from the URL so the handle is defined once, in hotspots.ts.
const INSTAGRAM_HANDLE = `@${CONTACT.instagram.split('/').filter(Boolean).pop() ?? ''}`

interface ServiceRowProps {
  service: Hotspot
  ordinal: string
  open: boolean
  panelId: string
  onToggle: () => void
}

function ServiceRow({ service, ordinal, open, panelId, onToggle }: ServiceRowProps) {
  return (
    <li className={styles.item} data-open={open}>
      <button
        type="button"
        className={styles.row}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
      >
        <span className={styles.index}>{ordinal}</span>
        <span className={styles.head}>
          <span className={styles.title}>{service.title}</span>
          <span className={styles.blurb}>{service.blurb}</span>
        </span>
        <svg className={styles.chevron} viewBox="0 0 16 16" aria-hidden="true">
          <path
            d="M4 6.5 8 10.5 12 6.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* inert keeps collapsed text out of the tab order and the accessibility tree. */}
      <div id={panelId} className={styles.panel} inert={!open}>
        <div className={styles.panelInner}>
          <ul className={styles.services}>
            {service.services.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      </div>
    </li>
  )
}

export function ServiceIndex() {
  const [openId, setOpenId] = useState<HotspotId | null>(null)
  const baseId = useId()

  return (
    <section className={styles.section}>
      <ol className={styles.list}>
        {HOTSPOTS.map((service, i) => (
          <ServiceRow
            key={service.id}
            service={service}
            ordinal={String(i + 1).padStart(2, '0')}
            open={openId === service.id}
            panelId={`${baseId}-${service.id}`}
            onToggle={() => setOpenId((current) => (current === service.id ? null : service.id))}
          />
        ))}
      </ol>

      <footer className={styles.closing}>
        <p className={styles.lead}>
          Jedan termin vas dijeli od svih ovih opcija.{' '}
          <span className={styles.warranty}>Doživotna garancija.</span>
        </p>
        <dl className={styles.meta}>
          <div className={styles.metaRow}>
            <dt>Telefon</dt>
            <dd>
              <a className={styles.tel} href={CONTACT.phoneHref}>
                {CONTACT.phone}
              </a>
            </dd>
          </div>
          <div className={styles.metaRow}>
            <dt>Adresa</dt>
            <dd>{CONTACT.address}</dd>
          </div>
          <div className={styles.metaRow}>
            <dt>Radno vrijeme</dt>
            <dd>{CONTACT.hours}</dd>
          </div>
          <div className={styles.metaRow}>
            <dt>Email</dt>
            <dd>{CONTACT.email}</dd>
          </div>
        </dl>
        <a className={styles.ig} href={CONTACT.instagram} target="_blank" rel="noreferrer noopener">
          {INSTAGRAM_HANDLE}
        </a>
      </footer>
    </section>
  )
}
