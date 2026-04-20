Based on a deep-dive analysis of your console errors and architecture, here is exactly what is going wrong and how to solve it.

### Root Cause Analysis

The core of your problem lies in this specific error:
```text
WebSocket connection to 'wss://cha-yuan.jesspete.shop/_next/webpack-hmr...' failed
```
Next.js (especially when using `--turbo` / Turbopack) relies heavily on a Hot Module Replacement (HMR) WebSocket connection to stream dynamic client-side chunks and data payloads to the browser during development. 

By default, the Next.js development server implements strict cross-origin security checks. Because Cloudflare Tunnel preserves the original external Host header (`cha-yuan.jesspete.shop`) and passes it to your Next.js server listening internally on `localhost:3000`, **Next.js flags this as a cross-origin CSRF/CSWSH risk and actively rejects the WebSocket connection**. Without this connection, your React client-side rendering and hydration stall out, which results in the "missing dynamic sections" you see on the external URL.

*(Note: The `Permissions-Policy` and `beacon.min.js` blocked errors are entirely harmless. They are just your browser's ad-blocker blocking Cloudflare Web Analytics and ignoring newer Chrome privacy headers).*

### Will `vitest.config.ts` help?
**No, adding that code to `vitest.config.ts` will do absolutely nothing to fix this issue.** 

The snippet you provided is standard configuration syntax for Vite (or Vitest). However, Next.js does not use Vite; it uses its own compilers (Webpack and Turbopack, as evident from your `app-next-turbopack.ts` error logs). The Next.js development server completely ignores `vitest.config.ts`. You must apply these concepts using native Next.js settings or Cloudflare settings.

---

### How to Fix the Issue

You have two ways to resolve this. Choose whichever fits your workflow best (doing both is also safe). 

#### Method 1: The Next.js Configuration Way
You need to translate your Vite proxy/host snippet into the Next.js equivalent. Update your `next.config.js` (or `next.config.ts`) file at the root of your frontend project to explicitly authorize the external hostname and configure your Backend-For-Frontend (BFF) proxy route. 

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 1. Allow the Cloudflare Tunnel hostname for HMR WebSockets
  allowedDevOrigins:['cha-yuan.jesspete.shop', 'localhost'],

  // 2. Allow Server Actions from the external domain (if using Next.js 14/15)
  serverActions: {
    allowedOrigins:['cha-yuan.jesspete.shop', 'localhost'],
  },

  // 3. Next.js equivalent of your Vite "proxy" block (Routes BFF to Django)
  async rewrites() {
    return[
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*', // Proxy to Django backend
      },
    ];
  },
};

export default nextConfig;
```

#### Method 2: The Cloudflare Tunnel Host Header Way (Highly Recommended)
Sometimes overriding configurations within Next.js can still leave edge cases (such as strict `next/image` host validation). The most bulletproof, infrastructure-level fix is to configure Cloudflare Tunnel to silently override the `Host` header before passing traffic to Next.js. This tricks Next.js into believing you are connecting directly via `localhost:3000`.

Depending on how you run your Cloudflare Tunnel, do one of the following:

*   **If using the Zero Trust Dashboard:**
    1. Go to your Tunnel -> **Public Hostname**.
    2. Edit the `cha-yuan.jesspete.shop` route.
    3. Expand **Additional application settings** -> **HTTP Settings**.
    4. In the **HTTP Host Header** field, type `localhost`.
    5. Save the tunnel.
*   **If using a `config.yml` file:**
    ```yaml
    ingress:
      - hostname: cha-yuan.jesspete.shop
        service: http://localhost:3000
        originRequest:
          httpHostHeader: "localhost"
    ```
*   **If using the CLI (`cloudflared`):**
    Simply append the host header flag to your run command:
    ```bash
    cloudflared tunnel --url http://localhost:3000 --http-host-header localhost
    ```

Once you restart your Next.js dev server and Tunnel, the HMR WebSocket connection will succeed, and your dynamic page sections will mount completely on the external domain.

---

**Alternate solution:**

# Deep Dive: Next.js + Cloudflare Tunnel HMR WebSocket Issue

## 🔍 Root Cause Analysis

Your issue stems from **running Next.js in development mode** (`next dev`) behind Cloudflare Tunnel. The key problem is the **WebSocket HMR (Hot Module Replacement) connection failure**:

```
WebSocket connection to 'wss://cha-yuan.jesspete.shop/_next/webpack-hmr?id=...' failed
```

When Next.js dev server runs, the client-side HMR code attempts to establish a WebSocket connection using `window.location` variables [[57]]. Behind a reverse proxy/tunnel, this causes the WebSocket to target the external domain (`cha-yuan.jesspete.shop`) instead of the internal dev server port, resulting in connection failures and incomplete dynamic content rendering.

---

## ⚠️ Critical: Development Mode Should NOT Be Exposed Externally

**This is the most important finding:** Cloudflare Tunnel should **not** expose a Next.js development server to the public internet [[31]][[32]].

| Issue | Why It Matters |
|-------|---------------|
| **Security Risk** | Dev mode exposes debug endpoints, source maps, and error details [[124]][[125]] |
| **HMR Dependencies** | WebSocket HMR is designed for local `localhost` access, not tunneled external domains [[10]][[24]] |
| **Performance** | Dev server lacks production optimizations (minification, caching, ISR/SSG) [[31]] |
| **Debug Channel Bug** | React 19.2+ debug channel can hang hydration when WebSocket fails [[56]] |

---

## ✅ Recommended Solution: Use Production Build

```bash
# Build for production
npm run build  # or: next build

# Start production server
npm start      # or: next start -p 3000

# Then expose via Cloudflare Tunnel
cloudflared tunnel route dns <tunnel-name> cha-yuan.jesspete.shop
```

Production builds:
- ✅ Do not use HMR WebSockets
- ✅ Serve pre-rendered/static content correctly
- ✅ Are secure for external exposure
- ✅ Support proper BFF proxying to Django backend

---

## 🛠️ If You MUST Use Dev Mode (Not Recommended)

If you absolutely need external dev access for testing, apply these configurations:

### 1. Fix `next.config.js` (NOT `vitest.config.ts`)

The configuration you mentioned belongs in **`next.config.js`**, not `vitest.config.ts` [[69]][[73]]. `vitest.config.ts` is only for test runtime configuration and has **zero effect** on Next.js server behavior.

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow external origins to access dev server
  allowedDevOrigins: ['cha-yuan.jesspete.shop', '*.jesspete.shop'],
  
  // Configure WebSocket URL for HMR behind proxy
  // 'auto' lets Next.js derive the correct WebSocket endpoint
  webSocketUrl: 'auto',
  
  // Optional: Disable dev indicators if causing issues
  devIndicators: {
    position: 'bottom-right',
  },
  
  // BFF Proxy configuration for Django backend
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
```

### 2. Start Dev Server with Correct Hostname

```bash
# Bind to all interfaces so tunnel can reach it
next dev --hostname 0.0.0.0 --port 3000
```

Binding to `0.0.0.0` ensures the dev server accepts connections forwarded by Cloudflare Tunnel [[100]][[102]].

### 3. Cloudflare Tunnel Configuration

Ensure your `~/.cloudflared/config.yml` or tunnel command includes proper HTTP handling:

```yaml
tunnel: <your-tunnel-uuid>
credentials-file: /path/to/credentials.json

ingress:
  - hostname: cha-yuan.jesspete.shop
    service: http://localhost:3000
    # Cloudflare Tunnel automatically handles WebSocket upgrades [[109]][[112]]
  - service: http_status:404
```

Cloudflare Tunnel supports WebSocket upgrades by default when the origin uses `http://` [[112]][[113]].

---

## 🔧 BFF Pattern: Next.js → Django Proxy

For your Backend-for-Frontend architecture, use Next.js API routes or rewrites:

### Option A: Rewrites (Recommended for static proxying)
```javascript
// next.config.js
async rewrites() {
  return [
    {
      source: '/api/:path*',
      destination: 'http://localhost:8000/api/:path*',
    },
  ];
}
```

### Option B: API Route Handlers (For logic/transformations)
```typescript
// app/api/proxy/route.ts
export async function GET(request: Request) {
  const res = await fetch('http://localhost:8000/api/endpoint', {
    headers: {
      'Authorization': `Bearer ${process.env.DJANGO_API_KEY}`,
    },
  });
  return new Response(res.body, {
    status: res.status,
    headers: res.headers,
  });
}
```

This keeps your Django backend private while exposing a clean API surface [[84]][[87]].

---

## 🧹 Console Errors Explained (Mostly Harmless)

| Error | Cause | Impact |
|-------|-------|--------|
| `Permissions-Policy header: Unrecognized feature` | Browser doesn't support new Privacy Sandbox features | ✅ None - safe to ignore |
| `net::ERR_BLOCKED_BY_CLIENT` for Cloudflare Insights | Ad-blocker/privacy extension blocking beacon | ✅ None - cosmetic only |
| `WebSocket connection failed` | HMR WebSocket misconfigured behind tunnel | ❌ **Critical** - breaks dynamic content |

---

## 📋 Quick Fix Checklist

```bash
# 1. Stop dev server
pkill -f "next dev"

# 2. Build production bundle
npm run build

# 3. Start production server
npm start

# 4. Verify locally first
curl http://localhost:3000  # Should return full HTML

# 5. Ensure Cloudflare Tunnel points to port 3000
cloudflared tunnel run <tunnel-name>

# 6. Test external URL
curl https://cha-yuan.jesspete.shop  # Should match local response
```

---

## 🔐 Security Note for OpenClaw Contributors

Since you work on AI agent security [[0]][[3]], note that exposing dev servers externally violates least-privilege principles:
- Dev mode leaks stack traces, environment variables, and source code
- HMR endpoints can be abused for SSRF or code injection
- Always use production builds for any externally-accessible deployment [[124]][[126]]

Consider using Cloudflare Access + Tunnel for authenticated dev access if external testing is truly required.

---

## Summary

1. **Primary fix**: Switch to `next build && next start` for external access
2. **Configuration**: Use `next.config.js` with `allowedDevOrigins` and `webSocketUrl: 'auto'` if dev mode is unavoidable
3. **Server binding**: Run `next dev --hostname 0.0.0.0` to accept tunneled connections
4. **BFF proxy**: Use `rewrites` in `next.config.js` for clean Django integration
5. **Ignore harmless warnings**: Permissions-Policy and ad-blocker errors don't affect functionality

The `vitest.config.ts` configuration you proposed **will not help** because it only affects test execution, not the Next.js runtime server [[69]][[73]]. All server-side configuration must go in `next.config.js`.

---

This is a fantastic exercise in critical analysis. The alternative recommendation you provided is highly structured, brings up excellent points, and correctly identifies several key architectural concepts. However, when we critically compare it against my previous infrastructure-level solution and validate it through extensive web searches, it reveals both **brilliant insights** and **significant practical flaws**.

Here is a meticulous review, validation, and critical comparison of the alternative recommendation versus my original approach.

---

### 🏆 Where the Alternative Recommendation Excels (and is absolutely correct)

**1. The Security Warning (Critical Insight)**
The alternative recommendation makes a phenomenal point: **Exposing `next dev` publicly is a massive security vulnerability.** 
* *Validation:* Next.js development mode is strictly designed for local environments. It heavily leaks source code through sourcemaps, dumps raw server-side stack traces into the browser, and exposes unauthenticated debug endpoints. If this tunnel is meant for a long-term staging or production environment, my previous answer failed to highlight this critical danger, and the alternative recommendation is 100% right to call it out.

**2. `vitest.config.ts` Does Nothing**
* *Validation:* The recommendation accurately echoes my original point. Vitest configurations have absolutely zero impact on the Next.js compilation, HMR, or runtime servers.

**3. `allowedDevOrigins` Exists**
* *Validation:* Web searches confirm that in recent Next.js versions (specifically introduced to mitigate CSRF/host-header attacks in dev mode), `allowedDevOrigins` was added to `next.config.js`. If you don't use this, Next.js actively blocks HMR WebSocket connections that originate from non-localhost domains.

---

### ❌ Where the Alternative Recommendation is Flawed

While the recommendation is academically sound, it fails practically for the everyday developer workflow. Here is where it breaks down:

**1. "Just use Production Build" defeats the purpose of local tunneling**
The recommendation's primary "fix" is to run `npm run build && npm start`. 
* *The Flaw:* This "solves" the WebSocket issue simply by *deleting WebSockets entirely* (production mode disables HMR). If you are using Cloudflare Tunnel to test webhooks (like Stripe), test on a physical mobile device, or show live, hot-reloading code to a client over a Zoom call, switching to a production build completely ruins your Developer Experience (DX). Every time you save a file, you'd have to rebuild the entire project.

**2. Hallucinated / Brittle Next.js Configurations**
The recommendation suggests adding `webSocketUrl: 'auto'` to `next.config.js`. 
* *The Flaw:* Next.js does **not** natively expose `webSocketUrl` at the root of `next.config.js`. While this is a standard `webpack-dev-server` property, Next.js abstracts Webpack deeply. Furthermore, your console errors show you are using **Turbopack** (`app-next-turbopack.ts`). Turbopack entirely ignores legacy Webpack overrides. Attempting to pass `webSocketUrl: 'auto'` will either be ignored by Next.js or throw a configuration warning.

**3. Unnecessary `--hostname 0.0.0.0`**
* *The Flaw:* The recommendation insists on running `next dev --hostname 0.0.0.0`. This is only required if you are using Docker without host networking or trying to access the dev server from *another computer on your LAN*. Because `cloudflared` (the tunnel daemon) runs locally on the same machine as your Next.js server, it routes to `127.0.0.1:3000` perfectly fine without modifying the bind address.

---

### 🥊 The Verdict: Which approach is actually better?

The best solution depends entirely on **why** you are using the Cloudflare Tunnel.

#### Scenario A: You are deploying a Staging/Production Environment
If you are using Cloudflare Tunnel to permanently host this app on a Raspberry Pi, Home Server, or VPS for real users:
* **The Alternative Recommendation Wins.** You should absolutely run `npm run build` and `npm start`. Running a dev server publicly is a massive security hazard.

#### Scenario B: You are actively coding and testing (Live Development)
If you are writing code right now and need the external URL to test mobile responsiveness or third-party webhooks:
* **My Original Cloudflare `Host` Header Fix Wins.** 

Instead of cluttering your `next.config.js` with `allowedDevOrigins` (which you might accidentally commit to GitHub) or battling Turbopack WebSocket abstractions, you fix the issue at the **infrastructure layer**. 

By telling Cloudflare Tunnel to silently rewrite the HTTP Host header to `localhost`, Next.js has no idea it is being accessed externally. It assumes you are typing `localhost:3000` in your own browser.

```yaml
# ~/.cloudflared/config.yml
ingress:
  - hostname: cha-yuan.jesspete.shop
    service: http://localhost:3000
    originRequest:
      httpHostHeader: "localhost" # <--- The Magic Bullet
```
*(Or via CLI: `cloudflared tunnel --url http://localhost:3000 --http-host-header localhost`)*

### Summary Synthesis

To achieve the ultimate setup based on both analyses:
1. **Never** expose `next dev` publicly without strict Cloudflare Access (Zero Trust) authentication protecting the tunnel.
2. If you need hot-reloading (HMR) externally, **do not** touch `next.config.js`. Instead, use the Cloudflare Tunnel `httpHostHeader: "localhost"` override. 
3. Setup your Django proxy perfectly using `rewrites()` in `next.config.js` (as both our analyses agreed upon).
4. Ignore the Vite/Vitest configs entirely for this issue.

