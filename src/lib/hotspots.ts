/**
 * Hotspot content and anchor points for the dashboard stage.
 *
 * `x` / `y` are percentages of the dashboard plate — the exact final frame of
 * the intro clip, so the video hands off to this image with no visible jump.
 *
 * Markers stay within roughly 10–90% horizontally: the plate is cover-fitted,
 * so anything nearer the edge gets cropped on taller viewports.
 *
 * Cards sit in two edge columns and reach inward with leader lines, keeping the
 * centre of the dash clear. `slot` is the card's index down its column.
 *
 * All copy is Montenegrin. Strings live only here so an EN layer can be added
 * later without touching components.
 */

export type HotspotId =
  | 'ambient' | 'cluster' | 'mbux' | 'video' | 'assist'
  | 'mirrors' | 'seats' | 'console' | 'doors'

export interface Hotspot {
  id: HotspotId
  title: string
  blurb: string
  services: string[]
  x: number
  y: number
  /** Where the callout sits, % of the VIEWPORT (not the plate).
   *  The plate is cover-fitted and crops at the sides, so a label anchored to
   *  it would slide off-screen on tall windows. The ring stays in plate space
   *  so it keeps pointing at the right control; the leader spans the two. */
  lx: number
  ly: number
}

export const HOTSPOTS: Hotspot[] = [
  {
    id: 'cluster',
    title: 'Instrument tabla',
    blurb: 'Otključavanje skrivenih prikaza na digitalnoj tabli.',
    services: [
      'Startup logo pri paljenju',
      'Punjenje kazaljki',
      'Laptimer štoperica',
      'Boost — prikaz rada turbine',
      'Prikaz količine goriva do maksimuma',
    ],
    x: 22.5, y: 42.0, lx: 3.0, ly: 17.0,
  },
  {
    id: 'assist',
    title: 'Asistencija vozaču',
    blurb: 'Sistemi koji rade u pozadini — aktivirani kako treba.',
    services: [
      'Čitanje saobraćajnih znakova',
      'Lane Assist / LDWS — upozorenje o napuštanju trake',
      'Širenje snopa xenona preko 110 km/h',
    ],
    x: 17.5, y: 57.0, lx: 3.0, ly: 71.0,
  },
  {
    id: 'doors',
    title: 'Panel vrata',
    blurb: 'Osvjetljenje i kontrole na vratima.',
    services: [
      'Ambijentalno osvjetljenje panela vrata',
      'Automatsko zaključavanje poslije 5 km/h',
      'Easy Entry pri otvaranju vrata',
    ],
    x: 11.5, y: 48.0, lx: 3.0, ly: 31.0,
  },
  {
    id: 'ambient',
    title: 'Ambijentalno osvjetljenje',
    blurb: 'Boje, intenzitet i efekti unutrašnjeg osvjetljenja.',
    services: [
      'Proširena paleta od 64 boje',
      'Efekat disanja i promjene boja u vožnji',
      'Odvojene zone za tablu, vrata i podnožje',
    ],
    x: 68.0, y: 57.5, lx: 74.0, ly: 86.0,
  },
  {
    id: 'mbux',
    title: 'MBUX — CarPlay i Android Auto',
    blurb: 'Puna integracija telefona na fabričkom ekranu.',
    services: [
      'Apple CarPlay',
      'Android Auto',
      'Smartlink interface',
      'Povezivanje dva telefona na Bluetooth istovremeno',
    ],
    x: 44.0, y: 42.5, lx: 27.0, ly: 9.0,
  },
  {
    id: 'video',
    title: 'Video u vožnji',
    blurb: 'Reprodukcija videa dok je vozilo u pokretu.',
    services: [
      'Video sadržaj bez ograničenja brzine',
      'Radi sa USB, CarPlay i Android Auto izvorima',
    ],
    x: 56.5, y: 42.5, lx: 61.0, ly: 9.0,
  },
  {
    id: 'mirrors',
    title: 'Retrovizori',
    blurb: 'Ponašanje retrovizora prilagođeno vožnji unazad.',
    services: [
      'Spuštanje desnog retrovizora u rikverc',
      'Automatsko sklapanje pri zaključavanju',
      'Za vozila sa elektro sklopivim retrovizorima',
    ],
    x: 87.0, y: 58.5, lx: 97.0, ly: 27.0,
  },
  {
    id: 'seats',
    title: 'Sjedišta',
    blurb: 'Memorija pozicije i lakši ulazak u vozilo.',
    services: [
      'Easy Entry — automatsko pomjeranje pri ulasku',
      'Memorijska funkcija pozicije sjedišta',
    ],
    x: 86.0, y: 50.5, lx: 97.0, ly: 63.0,
  },
  {
    id: 'console',
    title: 'Centralna konzola i navigacija',
    blurb: 'Komfor opcije i najnovije fabričke mape.',
    services: [
      'Inverzija start/stop sistema',
      'Deaktivacija senzora za pojas',
      'Najnovije navigacione mape za Crnu Goru i region',
    ],
    x: 45.0, y: 84.0, lx: 40.0, ly: 93.0,
  },
]

export const CONTACT = {
  phone: '+382 67 391 384',
  phoneHref: 'tel:+38267391384',
  email: 'info@daltoncoding.me',
  instagram: 'https://instagram.com/daltoncoding',
  address: 'Zabjelo, Avnoja 13, Podgorica',
  hours: 'Pon–Sub 08:00–21:00',
} as const
