// Shared client/server limits; server validation remains authoritative.
export const CONTACT_LIMITS = {
  naam: { min: 2, max: 100 },
  email: { max: 254 },
  telefoon: { max: 40 },
  onderwerp: { min: 1, max: 200 },
  bericht: { min: 10, max: 5000 },
} as const;

// This complete number was already publicly displayed on the contact card.
// Derive the dial target from that same source, not from a masked tel link.
const PUBLIC_PHONE = '0470 63 14 75';
export const CONTACT_PHONE = {
  text: PUBLIC_PHONE,
  href: `tel:+32${PUBLIC_PHONE.replace(/ /g, '').slice(1)}`,
} as const;
