# PWA Configuration

This app is a Progressive Web App — installable on mobile and desktop, capable of offline use, and fast to load on repeat visits.

## Key PWA Capabilities

| Feature | Status | Implementation |
|---|---|---|
| Installable (Add to Home Screen) | Required | `manifest.json` + HTTPS |
| Offline support | Required | Service worker caches shell + static assets |
| Offline meal logging | Required | IndexedDB stores logs locally |
| Push notifications | Optional (opt-in) | Web Push API |
| Background sync | Optional | Sync to server when connection restores |

---

## 1. next-pwa Setup

```bash
pnpm add next-pwa
pnpm add -D @types/next-pwa
```

```ts
// next.config.ts
import withPWA from 'next-pwa';

const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      // Cache API responses for AI meal parsing (stale-while-revalidate)
      urlPattern: /^\/api\/ai\//,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'ai-api-cache',
        expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 },
      },
    },
    {
      // Cache all Next.js static chunks
      urlPattern: /\/_next\/static\/.*/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'next-static',
        expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
      },
    },
  ],
});

export default pwaConfig({ /* your existing next config */ });
```

---

## 2. Web App Manifest

```json
// public/manifest.json
{
  "name": "Calorie Tracker",
  "short_name": "CalTrack",
  "description": "AI-assisted calorie and macro tracker",
  "start_url": "/dashboard",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#ffffff",
  "theme_color": "#18181b",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}
```

---

## 3. Meta Tags in Layout

```tsx
// app/layout.tsx  — add to <head>
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#18181b" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<link rel="apple-touch-icon" href="/icons/icon-192.png" />
```

---

## 4. Offline UX

- **App shell** (layout, nav, static components) is pre-cached on first visit
- **Daily log data** reads from IndexedDB — always available offline
- **AI meal entry** is disabled when offline with a clear banner: *"AI features require internet. Switch to manual entry."*
- **Network status hook**:

```ts
// hooks/useNetworkStatus.ts
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on  = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online',  on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);
  return isOnline;
}
```

---

## 5. Icons

Generate icons from a single 1024×1024 source PNG:

```bash
# Using sharp CLI or any icon generator
npx pwa-asset-generator ./public/icon-source.png ./public/icons --manifest ./public/manifest.json
```

Required sizes: 192×192, 512×512 (minimum); 180×180 for Apple touch icon.

---

## 6. Lighthouse PWA Checklist

Before shipping, verify the following pass in Chrome DevTools → Lighthouse:

- [ ] Served over HTTPS
- [ ] `manifest.json` valid with required fields
- [ ] Service worker registered and activates
- [ ] Has a `<meta name="viewport">` tag
- [ ] Icons provided at required sizes
- [ ] `start_url` responds with 200 when offline
- [ ] App shell cached and usable offline
