# status-proxy

Cloudflare Worker — 302 redirect `status.aisystant.com` → `aisystant.betteruptime.com`.

**Назначение:** дать пользователям короткий понятный URL `status.aisystant.com` для status page Aisystant. Реализация WP-244 Ф7 (DP.SC.124 User-Facing Platform Health).

---

## Почему 302 redirect, а не прозрачный proxy

Изначально планировался transparent reverse proxy (Worker fetch upstream → return body). Не работает из-за **Cloudflare error 1014 «CNAME Cross-User Banned»** — Cloudflare блокирует CNAME между двумя своими аккаунтами (наш `aisystant.com` и Better Stack `betteruptime.com`), даже для запросов изнутри Worker через `fetch`.

Альтернативы:
- **Cloudflare for SaaS / Custom Hostnames API** — требует enterprise SaaS подписку.
- **JS/iframe redirect** — не работает (Better Stack ставит `X-Frame-Options: SAMEORIGIN`).
- **302 redirect** — простое надёжное решение, URL в адресной строке меняется на `aisystant.betteruptime.com`, но пользователь запоминает короткий `status.aisystant.com`.

При апгрейде Better Stack до plan с custom hostname через CF for SaaS — снять Worker, использовать прямой CNAME с правильной CF-интеграцией.

**Важно:** custom_domain в Better Stack должен быть **не задан** (`null`), иначе BS делает 301 → status.aisystant.com → loop с нашим 302.

---

## Архитектура

```
User → https://status.aisystant.com
        │
        │ DNS CNAME → aisystant.betteruptime.com
        │ (Proxied через Cloudflare ☁️ оранжевое)
        ▼
   Cloudflare edge (ловит trafic для status.aisystant.com)
        │
        │ Route status.aisystant.com/* → status-proxy Worker
        ▼
   status-proxy Worker
        │
        │ Response.redirect("https://aisystant.betteruptime.com" + path, 302)
        ▼
   Browser follows → aisystant.betteruptime.com → BS status page (200)
```

---

## Deploy

```bash
npm install
npx wrangler deploy
```

URL продакшена: **https://status.aisystant.com**

---

## Связи

- **Реализует:** [DP.SC.124 User-Facing Platform Health](../../PACK-digital-platform/pack/digital-platform/08-service-clauses/DP.SC.144-user-facing-platform-health.md)
- **Status page upstream:** https://aisystant.betteruptime.com (Better Stack)
- **Соседний Worker:** [observability-webhook](../observability-webhook/) — пишет посты об инцидентах в [@aisystant_status](https://t.me/aisystant_status).
- **Родительский РП:** [WP-244](../../DS-my-strategy/inbox/WP-244-platform-observability.md) Ф7.
