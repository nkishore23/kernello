// EDIT EVERYTHING HERE: brand, phone, nuts, prices, videos
export const SHOP = { name: 'KERNELLO', whatsapp: '919999999999' } // country code + number, no +

export const NUTS = [
  { id: 'almond', name: 'Almond', origin: 'California, USA', color: '#1F3FD8', dark: true, price: 799, kcal: 579, protein: 21,
    desc: 'Crisp, sweet and raw. Sun-dried and sorted by hand, skin on for the full crunch.',
    chips: ['No salt', 'Raw', 'Farm direct'], video: '/video/hero-almond.mp4' },
  { id: 'cashew', name: 'Cashew', origin: 'Panruti, Tamil Nadu', color: '#A99BF2', dark: false, price: 899, kcal: 553, protein: 18,
    desc: 'Buttery, creamy and gently roasted over slow heat. Whole kernels, never broken bits.',
    chips: ['W320 grade', 'Slow roasted', 'Local'], video: '/video/hero-cashew.mp4' },
  { id: 'pistachio', name: 'Pistachio', origin: 'Gaziantep, Turkey', color: '#8FDDB8', dark: false, price: 1199, kcal: 560, protein: 20,
    desc: 'Naturally split shells, bright green kernels and a whisper of sea salt.',
    chips: ['Lightly salted', 'In shell', 'Imported'], video: '/video/hero-pistachio.mp4' },
  { id: 'walnut', name: 'Walnut', origin: 'Kashmir Valley', color: '#0F6B73', dark: true, price: 999, kcal: 654, protein: 15,
    desc: 'Light halves with a rich, earthy bite. Cracked this season, packed within days.',
    chips: ['Halves', 'Omega-3', 'Valley grown'], video: '/video/hero-walnut.mp4' },
  { id: 'hazelnut', name: 'Hazelnut', origin: 'Piedmont, Italy', color: '#E8A317', dark: false, price: 1099, kcal: 628, protein: 15,
    desc: 'Round, toasty and quietly sweet. The nut behind the world\u2019s best chocolate.',
    chips: ['Roasted', 'Skin off', 'Imported'], video: '/video/hero-hazelnut.mp4' },
]

export const STORY = [
  { video: '/video/story-1-orchard.mp4', cap: ['Shaken at', 'golden hour.'] },
  { video: '/video/story-2-crack.mp4', cap: ['Cracked', 'by hand.'] },
  { video: '/video/story-3-roast.mp4', cap: ['Roasted slow', 'in copper.'] },
  { video: '/video/story-4-pack.mp4', cap: ['Sealed with', 'our name.'] },
]

export const JAR_VIDEO = '/video/jar-pour.mp4'
export const WEIGHTS = [250, 500, 1000]
export const price = (nut, w) => Math.round((nut.price * w) / 500)

// Placeholder numbers & reviews: REPLACE with your real ones before launch
export const FREE_SHIP = 999
export const MARQUEE = ['Farm direct', 'Slow roasted', 'No preservatives', 'Fresh every week', 'Hand sorted', 'Sealed with love']
export const STATS = [
  { to: 42, suf: '+', label: 'Partner farms' },
  { to: 18500, suf: 'kg', label: 'Roasted every month' },
  { to: 12000, suf: '+', label: 'Happy snackers' },
]
export const REVIEWS = [
  { q: 'The cashews taste like they were roasted this morning. Nothing in the shops comes close.', n: 'Priya S.', c: 'Chennai' },
  { q: 'Ordered a custom jar for Diwali gifting. Everyone asked where it was from.', n: 'Arjun M.', c: 'Bengaluru' },
  { q: 'Walnuts are fresh and light, not bitter at all. My go-to for the kids\u2019 lunchbox.', n: 'Fatima K.', c: 'Hyderabad' },
]

// Subscribe: paste your Formspree endpoint (https://formspree.io/f/xxxxxxx). Leave '' to use WhatsApp instead.
export const SUBSCRIBE_URL = 'https://formspree.io/f/mgaaryly'

// Festival banner (set date to your next festival; banner hides itself after it ends)
export const FESTIVAL = { name: 'Diwali', date: '2026-11-08T00:00:00+05:30', line: 'Diwali gifting boxes are live' }
export const GIFTS = [
  { id: 'mini', name: 'Mini Treat', desc: '3 pouches · 100g each', price: 549, nuts: ['almond', 'cashew', 'pistachio'] },
  { id: 'classic', name: 'Classic Box', desc: '4 jars · 150g each', price: 1099, nuts: ['almond', 'cashew', 'walnut', 'hazelnut'] },
  { id: 'royal', name: 'Royal Hamper', desc: '5 jars · 250g each + gift wrap', price: 2199, nuts: ['almond', 'cashew', 'pistachio', 'walnut', 'hazelnut'] },
]
// per 100g, approximate demo values: replace with your lab / label values
export const INFO = {
  almond: { fat: 50, carbs: 22, fibre: 12, eat: 'Soak overnight, peel and eat in the morning, or blend into badam milk.' },
  cashew: { fat: 44, carbs: 30, fibre: 3, eat: 'Snack roasted with a pinch of pepper, or grind into creamy gravies and kheer.' },
  pistachio: { fat: 45, carbs: 28, fibre: 10, eat: 'Crack and eat as a slow snack, or crush over ice cream and biryani.' },
  walnut: { fat: 65, carbs: 14, fibre: 7, eat: 'Add to oats, salads or banana bread. Best with a drizzle of honey.' },
  hazelnut: { fat: 61, carbs: 17, fibre: 10, eat: 'Toast lightly and fold into chocolate, brownies or granola.' },
}
