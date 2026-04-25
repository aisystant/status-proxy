// status-proxy — 302 redirect status.aisystant.com → aisystant.betteruptime.com.
//
// Прозрачный proxy через Worker fetch не работает: Cloudflare блокирует CNAME
// между разными CF-аккаунтами (error 1014 «CNAME Cross-User Banned»), даже
// для запросов изнутри Worker.
//
// 302 redirect — простое надёжное решение. Пользователь запоминает короткий
// status.aisystant.com, открывается полноценный Better Stack status page.
// Снимем когда BS либо разрешит CNAME через CF for SaaS, либо мы апгрейдимся.

interface Env {
  UPSTREAM: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const target = `https://${env.UPSTREAM}${url.pathname}${url.search}`;
    return Response.redirect(target, 302);
  },
};
