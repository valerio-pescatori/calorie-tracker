# PWA Configuration

This app is a Progressive Web App — installable on mobile and desktop, and fast to load on repeat visits.

No third-party PWA package is needed. Next.js has built-in support for the web app manifest via the App Router file convention, and the service worker (needed only for push notifications) is a plain `public/sw.js` file.

> Reference: [Next.js PWA guide](https://nextjs.org/docs/app/guides/progressive-web-apps)

## Key PWA Capabilities

| Feature | Status | Implementation |
|---|---|---|
| Installable (Add to Home Screen) | Required | `app/manifest.ts` + HTTPS |
| Push notifications | Optional (opt-in) | Web Push API + `public/sw.js` |

---

## 1. Web App Manifest

Next.js treats `app/manifest.ts` as a [built-in file convention](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/manifest) — no config needed.

```ts
// app/manifest.ts
import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Calorie Tracker',
    short_name: 'CalTrack',
    description: 'AI-assisted calorie and macro tracker',
    start_url: '/dashboard',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#ffffff',
    theme_color: '#18181b',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
```

Next.js automatically serves this at `/manifest.webmanifest` and adds the `<link rel="manifest">` tag.

---

## 2. Meta Tags in Layout

Only the theme-color and Apple-specific tags need to be added manually:

```tsx
// app/layout.tsx  — add to <head> via generateViewport or metadata
export const viewport = {
  themeColor: '#18181b',
};

// Also add in <head> for Apple devices:
// <meta name="apple-mobile-web-app-capable" content="yes" />
// <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
// <link rel="apple-touch-icon" href="/icons/icon-192.png" />
```

---

## 3. Icons

Generate icons from a single 1024×1024 source PNG:

```bash
npx pwa-asset-generator ./public/icon-source.png ./public/icons
```

Required sizes: 192×192, 512×512 (minimum); 180×180 for Apple touch icon.

---

## 4. Install Prompt (iOS)

Modern browsers auto-prompt installation when a valid manifest + HTTPS are present. For iOS Safari (which doesn't support `beforeinstallprompt`), show a manual hint when the app is not already running standalone:

```tsx
// components/InstallPrompt.tsx
'use client';
import { useState, useEffect } from 'react';

export function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent));
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);
  }, []);

  if (isStandalone || !isIOS) return null;

  return (
    <p className="text-sm text-zinc-500">
      To install: tap the Share button ⎋ then &ldquo;Add to Home Screen&rdquo; ➕
    </p>
  );
}
```

---

## 5. Push Notifications (optional)

Push notifications require a service worker and VAPID keys.

### Generate VAPID keys

```bash
pnpm add -g web-push
web-push generate-vapid-keys
```

Add to `.env`:

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
```

### Service Worker

```js
// public/sw.js
self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json();
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
      })
    );
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(clients.openWindow('/dashboard'));
});
```

### Server Action

```ts
// app/actions.ts
'use server';
import webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:your-email@example.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

let subscription: PushSubscription | null = null;

export async function subscribeUser(sub: PushSubscription) {
  subscription = sub;
  // TODO: persist to DB
  return { success: true };
}

export async function sendNotification(message: string) {
  if (!subscription) throw new Error('No subscription available');
  await webpush.sendNotification(
    subscription,
    JSON.stringify({ title: 'CalTrack', body: message, icon: '/icons/icon-192.png' })
  );
  return { success: true };
}
```

Install dependency: `pnpm add web-push` / `pnpm add -D @types/web-push`

---

## 6. Security Headers

Add to `next.config.ts` for service worker and general PWA security:

```ts
// next.config.ts
export default {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self'" },
        ],
      },
    ];
  },
};
```

---

## 7. Lighthouse PWA Checklist

Before shipping, verify the following pass in Chrome DevTools → Lighthouse:

- [ ] Served over HTTPS (use `next dev --experimental-https` locally)
- [ ] `manifest.webmanifest` valid with required fields
- [ ] Has a `<meta name="viewport">` tag
- [ ] Icons provided at required sizes

