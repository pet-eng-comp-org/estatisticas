import { NextResponse, type NextRequest } from "next/server";

/**
 * Cabeçalhos de segurança de toda página (regra 39). A CSP usa nonce por
 * requisição: só roda script que o próprio Next marcou. Estilo inline fica
 * liberado porque o enunciado das questões usa atributo style (sanitizado).
 */
export function proxy(req: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const producao = process.env.NODE_ENV === "production";
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${producao ? "" : " 'unsafe-eval'"}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    `connect-src 'self'${producao ? "" : " ws:"}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(producao ? ["upgrade-insecure-requests"] : []),
  ].join("; ");

  const cabecalhos = new Headers(req.headers);
  cabecalhos.set("x-nonce", nonce);
  cabecalhos.set("Content-Security-Policy", csp);
  const res = NextResponse.next({ request: { headers: cabecalhos } });
  res.headers.set("Content-Security-Policy", csp);
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.headers.set("X-Content-Type-Options", "nosniff");
  return res;
}

export const config = {
  matcher: [{ source: "/((?!_next/static|_next/image|icon.svg).*)" }],
};
