var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// _worker.js/index.js
import("node:buffer").then(({ Buffer: Buffer2 }) => {
  globalThis.Buffer = Buffer2;
}).catch(() => null);
var __ALSes_PROMISE__ = import("node:async_hooks").then(({ AsyncLocalStorage }) => {
  globalThis.AsyncLocalStorage = AsyncLocalStorage;
  const envAsyncLocalStorage = new AsyncLocalStorage();
  const requestContextAsyncLocalStorage = new AsyncLocalStorage();
  globalThis.process = {
    env: new Proxy(
      {},
      {
        ownKeys: /* @__PURE__ */ __name(() => Reflect.ownKeys(envAsyncLocalStorage.getStore()), "ownKeys"),
        getOwnPropertyDescriptor: /* @__PURE__ */ __name((_, ...args) => Reflect.getOwnPropertyDescriptor(envAsyncLocalStorage.getStore(), ...args), "getOwnPropertyDescriptor"),
        get: /* @__PURE__ */ __name((_, property) => Reflect.get(envAsyncLocalStorage.getStore(), property), "get"),
        set: /* @__PURE__ */ __name((_, property, value) => Reflect.set(envAsyncLocalStorage.getStore(), property, value), "set")
      }
    )
  };
  globalThis[/* @__PURE__ */ Symbol.for("__cloudflare-request-context__")] = new Proxy(
    {},
    {
      ownKeys: /* @__PURE__ */ __name(() => Reflect.ownKeys(requestContextAsyncLocalStorage.getStore()), "ownKeys"),
      getOwnPropertyDescriptor: /* @__PURE__ */ __name((_, ...args) => Reflect.getOwnPropertyDescriptor(requestContextAsyncLocalStorage.getStore(), ...args), "getOwnPropertyDescriptor"),
      get: /* @__PURE__ */ __name((_, property) => Reflect.get(requestContextAsyncLocalStorage.getStore(), property), "get"),
      set: /* @__PURE__ */ __name((_, property, value) => Reflect.set(requestContextAsyncLocalStorage.getStore(), property, value), "set")
    }
  );
  return { envAsyncLocalStorage, requestContextAsyncLocalStorage };
}).catch(() => null);
var ae = Object.create;
var U = Object.defineProperty;
var re = Object.getOwnPropertyDescriptor;
var ne = Object.getOwnPropertyNames;
var ie = Object.getPrototypeOf;
var oe = Object.prototype.hasOwnProperty;
var M = /* @__PURE__ */ __name((e, t) => () => (e && (t = e(e = 0)), t), "M");
var V = /* @__PURE__ */ __name((e, t) => () => (t || e((t = { exports: {} }).exports, t), t.exports), "V");
var ce = /* @__PURE__ */ __name((e, t, a, s) => {
  if (t && typeof t == "object" || typeof t == "function") for (let n of ne(t)) !oe.call(e, n) && n !== a && U(e, n, { get: /* @__PURE__ */ __name(() => t[n], "get"), enumerable: !(s = re(t, n)) || s.enumerable });
  return e;
}, "ce");
var $ = /* @__PURE__ */ __name((e, t, a) => (a = e != null ? ae(ie(e)) : {}, ce(t || !e || !e.__esModule ? U(a, "default", { value: e, enumerable: true }) : a, e)), "$");
var g;
var l = M(() => {
  g = { collectedLocales: [] };
});
var f;
var u = M(() => {
  f = { version: 3, routes: { none: [{ src: "^(?:/((?:[^/]+?)(?:/(?:[^/]+?))*))/$", headers: { Location: "/$1" }, status: 308, continue: true }, { src: "^/_next/__private/trace$", dest: "/404", status: 404, continue: true }, { src: "^/404/?$", status: 404, continue: true, missing: [{ type: "header", key: "x-prerender-revalidate" }] }, { src: "^/500$", status: 500, continue: true }, { src: "^/?$", has: [{ type: "header", key: "rsc", value: "1" }], dest: "/index.rsc", headers: { vary: "RSC, Next-Router-State-Tree, Next-Router-Prefetch" }, continue: true, override: true }, { src: "^/((?!.+\\.rsc).+?)(?:/)?$", has: [{ type: "header", key: "rsc", value: "1" }], dest: "/$1.rsc", headers: { vary: "RSC, Next-Router-State-Tree, Next-Router-Prefetch" }, continue: true, override: true }], filesystem: [{ src: "^/index(\\.action|\\.rsc)$", dest: "/", continue: true }, { src: "^/_next/data/(.*)$", dest: "/_next/data/$1", check: true }, { src: "^/\\.prefetch\\.rsc$", dest: "/__index.prefetch.rsc", check: true }, { src: "^/(.+)/\\.prefetch\\.rsc$", dest: "/$1.prefetch.rsc", check: true }, { src: "^/\\.rsc$", dest: "/index.rsc", check: true }, { src: "^/(.+)/\\.rsc$", dest: "/$1.rsc", check: true }], miss: [{ src: "^/_next/static/.+$", status: 404, check: true, dest: "/_next/static/not-found.txt", headers: { "content-type": "text/plain; charset=utf-8" } }], rewrite: [{ src: "^/_next/data/(.*)$", dest: "/404", status: 404 }], resource: [{ src: "^/.*$", status: 404 }], hit: [{ src: "^/_next/static/(?:[^/]+/pages|pages|chunks|runtime|css|image|media|7pHTr1jM7KuvT6P2vG3Nf)/.+$", headers: { "cache-control": "public,max-age=31536000,immutable" }, continue: true, important: true }, { src: "^/index(?:/)?$", headers: { "x-matched-path": "/" }, continue: true, important: true }, { src: "^/((?!index$).*?)(?:/)?$", headers: { "x-matched-path": "/$1" }, continue: true, important: true }], error: [{ src: "^/.*$", dest: "/404", status: 404, headers: { "x-next-error-status": "404" } }, { src: "^/.*$", dest: "/500", status: 500, headers: { "x-next-error-status": "500" } }] }, images: { domains: [], sizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840, 16, 32, 48, 64, 96, 128, 256, 384], remotePatterns: [], minimumCacheTTL: 60, formats: ["image/webp"], dangerouslyAllowSVG: false, contentSecurityPolicy: "script-src 'none'; frame-src 'none'; sandbox;", contentDispositionType: "inline" }, overrides: { "404.html": { path: "404", contentType: "text/html; charset=utf-8" }, "500.html": { path: "500", contentType: "text/html; charset=utf-8" }, "_error.rsc.json": { path: "_error.rsc", contentType: "application/json" }, "_app.rsc.json": { path: "_app.rsc", contentType: "application/json" }, "_document.rsc.json": { path: "_document.rsc", contentType: "application/json" }, "404.rsc.json": { path: "404.rsc", contentType: "application/json" }, "_next/static/not-found.txt": { contentType: "text/plain" } }, framework: { slug: "nextjs", version: "14.2.5" }, crons: [] };
});
var m;
var p = M(() => {
  m = { "/404.html": { type: "override", path: "/404.html", headers: { "content-type": "text/html; charset=utf-8" } }, "/404.rsc.json": { type: "override", path: "/404.rsc.json", headers: { "content-type": "application/json" } }, "/500.html": { type: "override", path: "/500.html", headers: { "content-type": "text/html; charset=utf-8" } }, "/_app.rsc.json": { type: "override", path: "/_app.rsc.json", headers: { "content-type": "application/json" } }, "/_document.rsc.json": { type: "override", path: "/_document.rsc.json", headers: { "content-type": "application/json" } }, "/_error.rsc.json": { type: "override", path: "/_error.rsc.json", headers: { "content-type": "application/json" } }, "/_next/static/7pHTr1jM7KuvT6P2vG3Nf/_buildManifest.js": { type: "static" }, "/_next/static/7pHTr1jM7KuvT6P2vG3Nf/_ssgManifest.js": { type: "static" }, "/_next/static/chunks/132.084a9affa827368a.js": { type: "static" }, "/_next/static/chunks/23-9eef366d1becd823.js": { type: "static" }, "/_next/static/chunks/366-a64beabc24e32a48.js": { type: "static" }, "/_next/static/chunks/374-71c36d474b6ad72b.js": { type: "static" }, "/_next/static/chunks/530.5333ebbeb20d75c0.js": { type: "static" }, "/_next/static/chunks/847-b90df86b8cf9404a.js": { type: "static" }, "/_next/static/chunks/app/_not-found/page-bc2621ca175d1a04.js": { type: "static" }, "/_next/static/chunks/app/admin/page-6e383710e6fa5324.js": { type: "static" }, "/_next/static/chunks/app/layout-8159f6ea811b2f2c.js": { type: "static" }, "/_next/static/chunks/app/legal/privacy/page-c2532438bdec7aae.js": { type: "static" }, "/_next/static/chunks/app/legal/terms/page-8df2ae5ef8a8151e.js": { type: "static" }, "/_next/static/chunks/app/page-53d934626a22efb2.js": { type: "static" }, "/_next/static/chunks/app/submit/page-c532d3e99441a9ca.js": { type: "static" }, "/_next/static/chunks/d0deef33.ea03e827ef8b4114.js": { type: "static" }, "/_next/static/chunks/fd9d1056-b5397b5edf30a95b.js": { type: "static" }, "/_next/static/chunks/framework-f66176bb897dc684.js": { type: "static" }, "/_next/static/chunks/main-88c37d0b736ef1ce.js": { type: "static" }, "/_next/static/chunks/main-app-fdab35397662c966.js": { type: "static" }, "/_next/static/chunks/pages/_app-6a626577ffa902a4.js": { type: "static" }, "/_next/static/chunks/pages/_error-1be831200e60c5c0.js": { type: "static" }, "/_next/static/chunks/polyfills-78c92fac7aa8fdd8.js": { type: "static" }, "/_next/static/chunks/webpack-d454f1f1c22fbbe4.js": { type: "static" }, "/_next/static/css/28682391126a1337.css": { type: "static" }, "/_next/static/css/6f7c9d162993fae7.css": { type: "static" }, "/_next/static/css/9b31253510a600ef.css": { type: "static" }, "/_next/static/css/d3e383b9ef67ddcb.css": { type: "static" }, "/_next/static/css/fb3080346adf5903.css": { type: "static" }, "/_next/static/css/fdea115569701b32.css": { type: "static" }, "/_next/static/media/layers-2x.9859cd12.png": { type: "static" }, "/_next/static/media/layers.ef6db872.png": { type: "static" }, "/_next/static/media/marker-icon.d577052a.png": { type: "static" }, "/_next/static/not-found.txt": { type: "static" }, "/file.svg": { type: "static" }, "/globe.svg": { type: "static" }, "/next.svg": { type: "static" }, "/vercel.svg": { type: "static" }, "/window.svg": { type: "static" }, "/api/admin/access-log": { type: "function", entrypoint: "__next-on-pages-dist__/functions/api/admin/access-log.func.js" }, "/api/admin/access-log.rsc": { type: "function", entrypoint: "__next-on-pages-dist__/functions/api/admin/access-log.func.js" }, "/api/admin/rentals": { type: "function", entrypoint: "__next-on-pages-dist__/functions/api/admin/rentals.func.js" }, "/api/admin/rentals.rsc": { type: "function", entrypoint: "__next-on-pages-dist__/functions/api/admin/rentals.func.js" }, "/api/cities": { type: "function", entrypoint: "__next-on-pages-dist__/functions/api/cities.func.js" }, "/api/cities.rsc": { type: "function", entrypoint: "__next-on-pages-dist__/functions/api/cities.func.js" }, "/api/contracts": { type: "function", entrypoint: "__next-on-pages-dist__/functions/api/contracts.func.js" }, "/api/contracts.rsc": { type: "function", entrypoint: "__next-on-pages-dist__/functions/api/contracts.func.js" }, "/api/rentals": { type: "function", entrypoint: "__next-on-pages-dist__/functions/api/rentals.func.js" }, "/api/rentals.rsc": { type: "function", entrypoint: "__next-on-pages-dist__/functions/api/rentals.func.js" }, "/404": { type: "override", path: "/404.html", headers: { "content-type": "text/html; charset=utf-8" } }, "/500": { type: "override", path: "/500.html", headers: { "content-type": "text/html; charset=utf-8" } }, "/_error.rsc": { type: "override", path: "/_error.rsc.json", headers: { "content-type": "application/json" } }, "/_app.rsc": { type: "override", path: "/_app.rsc.json", headers: { "content-type": "application/json" } }, "/_document.rsc": { type: "override", path: "/_document.rsc.json", headers: { "content-type": "application/json" } }, "/404.rsc": { type: "override", path: "/404.rsc.json", headers: { "content-type": "application/json" } }, "/admin.html": { type: "override", path: "/admin.html", headers: { "x-next-cache-tags": "_N_T_/layout,_N_T_/admin/layout,_N_T_/admin/page,_N_T_/admin", vary: "RSC, Next-Router-State-Tree, Next-Router-Prefetch" } }, "/admin": { type: "override", path: "/admin.html", headers: { "x-next-cache-tags": "_N_T_/layout,_N_T_/admin/layout,_N_T_/admin/page,_N_T_/admin", vary: "RSC, Next-Router-State-Tree, Next-Router-Prefetch" } }, "/admin.rsc": { type: "override", path: "/admin.rsc", headers: { "x-next-cache-tags": "_N_T_/layout,_N_T_/admin/layout,_N_T_/admin/page,_N_T_/admin", vary: "RSC, Next-Router-State-Tree, Next-Router-Prefetch", "content-type": "text/x-component" } }, "/favicon.ico": { type: "override", path: "/favicon.ico", headers: { "cache-control": "public, max-age=0, must-revalidate", "content-type": "image/x-icon", "x-next-cache-tags": "_N_T_/layout,_N_T_/favicon.ico/layout,_N_T_/favicon.ico/route,_N_T_/favicon.ico", vary: "RSC, Next-Router-State-Tree, Next-Router-Prefetch" } }, "/index.html": { type: "override", path: "/index.html", headers: { "x-next-cache-tags": "_N_T_/layout,_N_T_/page,_N_T_/", vary: "RSC, Next-Router-State-Tree, Next-Router-Prefetch" } }, "/index": { type: "override", path: "/index.html", headers: { "x-next-cache-tags": "_N_T_/layout,_N_T_/page,_N_T_/", vary: "RSC, Next-Router-State-Tree, Next-Router-Prefetch" } }, "/": { type: "override", path: "/index.html", headers: { "x-next-cache-tags": "_N_T_/layout,_N_T_/page,_N_T_/", vary: "RSC, Next-Router-State-Tree, Next-Router-Prefetch" } }, "/index.rsc": { type: "override", path: "/index.rsc", headers: { "x-next-cache-tags": "_N_T_/layout,_N_T_/page,_N_T_/", vary: "RSC, Next-Router-State-Tree, Next-Router-Prefetch", "content-type": "text/x-component" } }, "/legal/privacy.html": { type: "override", path: "/legal/privacy.html", headers: { "x-next-cache-tags": "_N_T_/layout,_N_T_/legal/layout,_N_T_/legal/privacy/layout,_N_T_/legal/privacy/page,_N_T_/legal/privacy", vary: "RSC, Next-Router-State-Tree, Next-Router-Prefetch" } }, "/legal/privacy": { type: "override", path: "/legal/privacy.html", headers: { "x-next-cache-tags": "_N_T_/layout,_N_T_/legal/layout,_N_T_/legal/privacy/layout,_N_T_/legal/privacy/page,_N_T_/legal/privacy", vary: "RSC, Next-Router-State-Tree, Next-Router-Prefetch" } }, "/legal/privacy.rsc": { type: "override", path: "/legal/privacy.rsc", headers: { "x-next-cache-tags": "_N_T_/layout,_N_T_/legal/layout,_N_T_/legal/privacy/layout,_N_T_/legal/privacy/page,_N_T_/legal/privacy", vary: "RSC, Next-Router-State-Tree, Next-Router-Prefetch", "content-type": "text/x-component" } }, "/legal/terms.html": { type: "override", path: "/legal/terms.html", headers: { "x-next-cache-tags": "_N_T_/layout,_N_T_/legal/layout,_N_T_/legal/terms/layout,_N_T_/legal/terms/page,_N_T_/legal/terms", vary: "RSC, Next-Router-State-Tree, Next-Router-Prefetch" } }, "/legal/terms": { type: "override", path: "/legal/terms.html", headers: { "x-next-cache-tags": "_N_T_/layout,_N_T_/legal/layout,_N_T_/legal/terms/layout,_N_T_/legal/terms/page,_N_T_/legal/terms", vary: "RSC, Next-Router-State-Tree, Next-Router-Prefetch" } }, "/legal/terms.rsc": { type: "override", path: "/legal/terms.rsc", headers: { "x-next-cache-tags": "_N_T_/layout,_N_T_/legal/layout,_N_T_/legal/terms/layout,_N_T_/legal/terms/page,_N_T_/legal/terms", vary: "RSC, Next-Router-State-Tree, Next-Router-Prefetch", "content-type": "text/x-component" } }, "/submit.html": { type: "override", path: "/submit.html", headers: { "x-next-cache-tags": "_N_T_/layout,_N_T_/submit/layout,_N_T_/submit/page,_N_T_/submit", vary: "RSC, Next-Router-State-Tree, Next-Router-Prefetch" } }, "/submit": { type: "override", path: "/submit.html", headers: { "x-next-cache-tags": "_N_T_/layout,_N_T_/submit/layout,_N_T_/submit/page,_N_T_/submit", vary: "RSC, Next-Router-State-Tree, Next-Router-Prefetch" } }, "/submit.rsc": { type: "override", path: "/submit.rsc", headers: { "x-next-cache-tags": "_N_T_/layout,_N_T_/submit/layout,_N_T_/submit/page,_N_T_/submit", vary: "RSC, Next-Router-State-Tree, Next-Router-Prefetch", "content-type": "text/x-component" } } };
});
var q = V((ze, F) => {
  "use strict";
  l();
  u();
  p();
  function R(e, t) {
    e = String(e || "").trim();
    let a = e, s, n = "";
    if (/^[^a-zA-Z\\\s]/.test(e)) {
      s = e[0];
      let o = e.lastIndexOf(s);
      n += e.substring(o + 1), e = e.substring(1, o);
    }
    let r = 0;
    return e = pe(e, (o) => {
      if (/^\(\?[P<']/.test(o)) {
        let c = /^\(\?P?[<']([^>']+)[>']/.exec(o);
        if (!c) throw new Error(`Failed to extract named captures from ${JSON.stringify(o)}`);
        let h = o.substring(c[0].length, o.length - 1);
        return t && (t[r] = c[1]), r++, `(${h})`;
      }
      return o.substring(0, 3) === "(?:" || r++, o;
    }), e = e.replace(/\[:([^:]+):\]/g, (o, c) => R.characterClasses[c] || o), new R.PCRE(e, n, a, n, s);
  }
  __name(R, "R");
  function pe(e, t) {
    let a = 0, s = 0, n = false;
    for (let i = 0; i < e.length; i++) {
      let r = e[i];
      if (n) {
        n = false;
        continue;
      }
      switch (r) {
        case "(":
          s === 0 && (a = i), s++;
          break;
        case ")":
          if (s > 0 && (s--, s === 0)) {
            let o = i + 1, c = a === 0 ? "" : e.substring(0, a), h = e.substring(o), d = String(t(e.substring(a, o)));
            e = c + d + h, i = a;
          }
          break;
        case "\\":
          n = true;
          break;
        default:
          break;
      }
    }
    return e;
  }
  __name(pe, "pe");
  (function(e) {
    class t extends RegExp {
      static {
        __name(this, "t");
      }
      constructor(s, n, i, r, o) {
        super(s, n), this.pcrePattern = i, this.pcreFlags = r, this.delimiter = o;
      }
    }
    e.PCRE = t, e.characterClasses = { alnum: "[A-Za-z0-9]", word: "[A-Za-z0-9_]", alpha: "[A-Za-z]", blank: "[ \\t]", cntrl: "[\\x00-\\x1F\\x7F]", digit: "\\d", graph: "[\\x21-\\x7E]", lower: "[a-z]", print: "[\\x20-\\x7E]", punct: "[\\]\\[!\"#$%&'()*+,./:;<=>?@\\\\^_`{|}~-]", space: "\\s", upper: "[A-Z]", xdigit: "[A-Fa-f0-9]" };
  })(R || (R = {}));
  R.prototype = R.PCRE.prototype;
  F.exports = R;
});
var Q = V((H) => {
  "use strict";
  l();
  u();
  p();
  H.parse = be;
  H.serialize = Pe;
  var we = Object.prototype.toString, k = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;
  function be(e, t) {
    if (typeof e != "string") throw new TypeError("argument str must be a string");
    for (var a = {}, s = t || {}, n = s.decode || Te, i = 0; i < e.length; ) {
      var r = e.indexOf("=", i);
      if (r === -1) break;
      var o = e.indexOf(";", i);
      if (o === -1) o = e.length;
      else if (o < r) {
        i = e.lastIndexOf(";", r - 1) + 1;
        continue;
      }
      var c = e.slice(i, r).trim();
      if (a[c] === void 0) {
        var h = e.slice(r + 1, o).trim();
        h.charCodeAt(0) === 34 && (h = h.slice(1, -1)), a[c] = Ce(h, n);
      }
      i = o + 1;
    }
    return a;
  }
  __name(be, "be");
  function Pe(e, t, a) {
    var s = a || {}, n = s.encode || Se;
    if (typeof n != "function") throw new TypeError("option encode is invalid");
    if (!k.test(e)) throw new TypeError("argument name is invalid");
    var i = n(t);
    if (i && !k.test(i)) throw new TypeError("argument val is invalid");
    var r = e + "=" + i;
    if (s.maxAge != null) {
      var o = s.maxAge - 0;
      if (isNaN(o) || !isFinite(o)) throw new TypeError("option maxAge is invalid");
      r += "; Max-Age=" + Math.floor(o);
    }
    if (s.domain) {
      if (!k.test(s.domain)) throw new TypeError("option domain is invalid");
      r += "; Domain=" + s.domain;
    }
    if (s.path) {
      if (!k.test(s.path)) throw new TypeError("option path is invalid");
      r += "; Path=" + s.path;
    }
    if (s.expires) {
      var c = s.expires;
      if (!Ne(c) || isNaN(c.valueOf())) throw new TypeError("option expires is invalid");
      r += "; Expires=" + c.toUTCString();
    }
    if (s.httpOnly && (r += "; HttpOnly"), s.secure && (r += "; Secure"), s.priority) {
      var h = typeof s.priority == "string" ? s.priority.toLowerCase() : s.priority;
      switch (h) {
        case "low":
          r += "; Priority=Low";
          break;
        case "medium":
          r += "; Priority=Medium";
          break;
        case "high":
          r += "; Priority=High";
          break;
        default:
          throw new TypeError("option priority is invalid");
      }
    }
    if (s.sameSite) {
      var d = typeof s.sameSite == "string" ? s.sameSite.toLowerCase() : s.sameSite;
      switch (d) {
        case true:
          r += "; SameSite=Strict";
          break;
        case "lax":
          r += "; SameSite=Lax";
          break;
        case "strict":
          r += "; SameSite=Strict";
          break;
        case "none":
          r += "; SameSite=None";
          break;
        default:
          throw new TypeError("option sameSite is invalid");
      }
    }
    return r;
  }
  __name(Pe, "Pe");
  function Te(e) {
    return e.indexOf("%") !== -1 ? decodeURIComponent(e) : e;
  }
  __name(Te, "Te");
  function Se(e) {
    return encodeURIComponent(e);
  }
  __name(Se, "Se");
  function Ne(e) {
    return we.call(e) === "[object Date]" || e instanceof Date;
  }
  __name(Ne, "Ne");
  function Ce(e, t) {
    try {
      return t(e);
    } catch {
      return e;
    }
  }
  __name(Ce, "Ce");
});
l();
u();
p();
l();
u();
p();
l();
u();
p();
var w = "INTERNAL_SUSPENSE_CACHE_HOSTNAME.local";
l();
u();
p();
l();
u();
p();
l();
u();
p();
l();
u();
p();
var D = $(q());
function S(e, t, a) {
  if (t == null) return { match: null, captureGroupKeys: [] };
  let s = a ? "" : "i", n = [];
  return { match: (0, D.default)(`%${e}%${s}`, n).exec(t), captureGroupKeys: n };
}
__name(S, "S");
function b(e, t, a, { namedOnly: s } = {}) {
  return e.replace(/\$([a-zA-Z0-9_]+)/g, (n, i) => {
    let r = a.indexOf(i);
    return s && r === -1 ? n : (r === -1 ? t[parseInt(i, 10)] : t[r + 1]) || "";
  });
}
__name(b, "b");
function j(e, { url: t, cookies: a, headers: s, routeDest: n }) {
  switch (e.type) {
    case "host":
      return { valid: t.hostname === e.value };
    case "header":
      return e.value !== void 0 ? I(e.value, s.get(e.key), n) : { valid: s.has(e.key) };
    case "cookie": {
      let i = a[e.key];
      return i && e.value !== void 0 ? I(e.value, i, n) : { valid: i !== void 0 };
    }
    case "query":
      return e.value !== void 0 ? I(e.value, t.searchParams.get(e.key), n) : { valid: t.searchParams.has(e.key) };
  }
}
__name(j, "j");
function I(e, t, a) {
  let { match: s, captureGroupKeys: n } = S(e, t);
  return a && s && n.length ? { valid: !!s, newRouteDest: b(a, s, n, { namedOnly: true }) } : { valid: !!s };
}
__name(I, "I");
l();
u();
p();
function B(e) {
  let t = new Headers(e.headers);
  return e.cf && (t.set("x-vercel-ip-city", encodeURIComponent(e.cf.city)), t.set("x-vercel-ip-country", e.cf.country), t.set("x-vercel-ip-country-region", e.cf.regionCode), t.set("x-vercel-ip-latitude", e.cf.latitude), t.set("x-vercel-ip-longitude", e.cf.longitude)), t.set("x-vercel-sc-host", w), new Request(e, { headers: t });
}
__name(B, "B");
l();
u();
p();
function y(e, t, a) {
  let s = t instanceof Headers ? t.entries() : Object.entries(t);
  for (let [n, i] of s) {
    let r = n.toLowerCase(), o = a?.match ? b(i, a.match, a.captureGroupKeys) : i;
    r === "set-cookie" ? e.append(r, o) : e.set(r, o);
  }
}
__name(y, "y");
function P(e) {
  return /^https?:\/\//.test(e);
}
__name(P, "P");
function x(e, t) {
  for (let [a, s] of t.entries()) {
    let n = /^nxtP(.+)$/.exec(a), i = /^nxtI(.+)$/.exec(a);
    n?.[1] ? (e.set(a, s), e.set(n[1], s)) : i?.[1] ? e.set(i[1], s.replace(/(\(\.+\))+/, "")) : (!e.has(a) || !!s && !e.getAll(a).includes(s)) && e.append(a, s);
  }
}
__name(x, "x");
function A(e, t) {
  let a = new URL(t, e.url);
  return x(a.searchParams, new URL(e.url).searchParams), a.pathname = a.pathname.replace(/\/index.html$/, "/").replace(/\.html$/, ""), new Request(a, e);
}
__name(A, "A");
function T(e) {
  return new Response(e.body, e);
}
__name(T, "T");
function L(e) {
  return e.split(",").map((t) => {
    let [a, s] = t.split(";"), n = parseFloat((s ?? "q=1").replace(/q *= */gi, ""));
    return [a.trim(), isNaN(n) ? 1 : n];
  }).sort((t, a) => a[1] - t[1]).map(([t]) => t === "*" || t === "" ? [] : t).flat();
}
__name(L, "L");
l();
u();
p();
function O(e) {
  switch (e) {
    case "none":
      return "filesystem";
    case "filesystem":
      return "rewrite";
    case "rewrite":
      return "resource";
    case "resource":
      return "miss";
    default:
      return "miss";
  }
}
__name(O, "O");
async function N(e, { request: t, assetsFetcher: a, ctx: s }, { path: n, searchParams: i }) {
  let r, o = new URL(t.url);
  x(o.searchParams, i);
  let c = new Request(o, t);
  try {
    switch (e?.type) {
      case "function":
      case "middleware": {
        let h = await import(e.entrypoint);
        try {
          r = await h.default(c, s);
        } catch (d) {
          let _ = d;
          throw _.name === "TypeError" && _.message.endsWith("default is not a function") ? new Error(`An error occurred while evaluating the target edge function (${e.entrypoint})`) : d;
        }
        break;
      }
      case "override": {
        r = T(await a.fetch(A(c, e.path ?? n))), e.headers && y(r.headers, e.headers);
        break;
      }
      case "static": {
        r = await a.fetch(A(c, n));
        break;
      }
      default:
        r = new Response("Not Found", { status: 404 });
    }
  } catch (h) {
    return console.error(h), new Response("Internal Server Error", { status: 500 });
  }
  return T(r);
}
__name(N, "N");
function G(e, t) {
  let a = "^//?(?:", s = ")/(.*)$";
  return !e.startsWith(a) || !e.endsWith(s) ? false : e.slice(a.length, -s.length).split("|").every((i) => t.has(i));
}
__name(G, "G");
l();
u();
p();
function he(e, { protocol: t, hostname: a, port: s, pathname: n }) {
  return !(t && e.protocol.replace(/:$/, "") !== t || !new RegExp(a).test(e.hostname) || s && !new RegExp(s).test(e.port) || n && !new RegExp(n).test(e.pathname));
}
__name(he, "he");
function de(e, t) {
  if (e.method !== "GET") return;
  let { origin: a, searchParams: s } = new URL(e.url), n = s.get("url"), i = Number.parseInt(s.get("w") ?? "", 10), r = Number.parseInt(s.get("q") ?? "75", 10);
  if (!n || Number.isNaN(i) || Number.isNaN(r) || !t?.sizes?.includes(i) || r < 0 || r > 100) return;
  let o = new URL(n, a);
  if (o.pathname.endsWith(".svg") && !t?.dangerouslyAllowSVG) return;
  let c = n.startsWith("//"), h = n.startsWith("/") && !c;
  if (!h && !t?.domains?.includes(o.hostname) && !t?.remotePatterns?.find((v) => he(o, v))) return;
  let d = e.headers.get("Accept") ?? "", _ = t?.formats?.find((v) => d.includes(v))?.replace("image/", "");
  return { isRelative: h, imageUrl: o, options: { width: i, quality: r, format: _ } };
}
__name(de, "de");
function fe(e, t, a) {
  let s = new Headers();
  if (a?.contentSecurityPolicy && s.set("Content-Security-Policy", a.contentSecurityPolicy), a?.contentDispositionType) {
    let i = t.pathname.split("/").pop(), r = i ? `${a.contentDispositionType}; filename="${i}"` : a.contentDispositionType;
    s.set("Content-Disposition", r);
  }
  e.headers.has("Cache-Control") || s.set("Cache-Control", `public, max-age=${a?.minimumCacheTTL ?? 60}`);
  let n = T(e);
  return y(n.headers, s), n;
}
__name(fe, "fe");
async function K(e, { buildOutput: t, assetsFetcher: a, imagesConfig: s }) {
  let n = de(e, s);
  if (!n) return new Response("Invalid image resizing request", { status: 400 });
  let { isRelative: i, imageUrl: r } = n, c = await (i && r.pathname in t ? a.fetch.bind(a) : fetch)(r);
  return fe(c, r, s);
}
__name(K, "K");
l();
u();
p();
l();
u();
p();
l();
u();
p();
async function C(e) {
  return import(e);
}
__name(C, "C");
var me = "x-vercel-cache-tags";
var ge = "x-next-cache-soft-tags";
var _e = /* @__PURE__ */ Symbol.for("__cloudflare-request-context__");
async function J(e) {
  let t = `https://${w}/v1/suspense-cache/`;
  if (!e.url.startsWith(t)) return null;
  try {
    let a = new URL(e.url), s = await ye();
    if (a.pathname === "/v1/suspense-cache/revalidate") {
      let i = a.searchParams.get("tags")?.split(",") ?? [];
      for (let r of i) await s.revalidateTag(r);
      return new Response(null, { status: 200 });
    }
    let n = a.pathname.replace("/v1/suspense-cache/", "");
    if (!n.length) return new Response("Invalid cache key", { status: 400 });
    switch (e.method) {
      case "GET": {
        let i = z(e, ge), r = await s.get(n, { softTags: i });
        return r ? new Response(JSON.stringify(r.value), { status: 200, headers: { "Content-Type": "application/json", "x-vercel-cache-state": "fresh", age: `${(Date.now() - (r.lastModified ?? Date.now())) / 1e3}` } }) : new Response(null, { status: 404 });
      }
      case "POST": {
        let i = globalThis[_e], r = /* @__PURE__ */ __name(async () => {
          let o = await e.json();
          o.data.tags === void 0 && (o.tags ??= z(e, me) ?? []), await s.set(n, o);
        }, "r");
        return i ? i.ctx.waitUntil(r()) : await r(), new Response(null, { status: 200 });
      }
      default:
        return new Response(null, { status: 405 });
    }
  } catch (a) {
    return console.error(a), new Response("Error handling cache request", { status: 500 });
  }
}
__name(J, "J");
async function ye() {
  return process.env.__NEXT_ON_PAGES__KV_SUSPENSE_CACHE ? W("kv") : W("cache-api");
}
__name(ye, "ye");
async function W(e) {
  let t = `./__next-on-pages-dist__/cache/${e}.js`, a = await C(t);
  return new a.default();
}
__name(W, "W");
function z(e, t) {
  return e.headers.get(t)?.split(",")?.filter(Boolean);
}
__name(z, "z");
function X() {
  globalThis[Z] || (xe(), globalThis[Z] = true);
}
__name(X, "X");
function xe() {
  let e = globalThis.fetch;
  globalThis.fetch = async (...t) => {
    let a = new Request(...t), s = await Re(a);
    return s || (s = await J(a), s) ? s : (ve(a), e(a));
  };
}
__name(xe, "xe");
async function Re(e) {
  if (e.url.startsWith("blob:")) try {
    let a = `./__next-on-pages-dist__/assets/${new URL(e.url).pathname}.bin`, s = (await C(a)).default, n = { async arrayBuffer() {
      return s;
    }, get body() {
      return new ReadableStream({ start(i) {
        let r = Buffer.from(s);
        i.enqueue(r), i.close();
      } });
    }, async text() {
      return Buffer.from(s).toString();
    }, async json() {
      let i = Buffer.from(s);
      return JSON.stringify(i.toString());
    }, async blob() {
      return new Blob(s);
    } };
    return n.clone = () => ({ ...n }), n;
  } catch {
  }
  return null;
}
__name(Re, "Re");
function ve(e) {
  e.headers.has("user-agent") || e.headers.set("user-agent", "Next.js Middleware");
}
__name(ve, "ve");
var Z = /* @__PURE__ */ Symbol.for("next-on-pages fetch patch");
l();
u();
p();
var Y = $(Q());
var E = class {
  static {
    __name(this, "E");
  }
  constructor(t, a, s, n, i) {
    this.routes = t;
    this.output = a;
    this.reqCtx = s;
    this.url = new URL(s.request.url), this.cookies = (0, Y.parse)(s.request.headers.get("cookie") || ""), this.path = this.url.pathname || "/", this.headers = { normal: new Headers(), important: new Headers() }, this.searchParams = new URLSearchParams(), x(this.searchParams, this.url.searchParams), this.checkPhaseCounter = 0, this.middlewareInvoked = [], this.wildcardMatch = i?.find((r) => r.domain === this.url.hostname), this.locales = new Set(n.collectedLocales);
  }
  url;
  cookies;
  wildcardMatch;
  path;
  status;
  headers;
  searchParams;
  body;
  checkPhaseCounter;
  middlewareInvoked;
  locales;
  checkRouteMatch(t, { checkStatus: a, checkIntercept: s }) {
    let n = S(t.src, this.path, t.caseSensitive);
    if (!n.match || t.methods && !t.methods.map((r) => r.toUpperCase()).includes(this.reqCtx.request.method.toUpperCase())) return;
    let i = { url: this.url, cookies: this.cookies, headers: this.reqCtx.request.headers, routeDest: t.dest };
    if (!t.has?.find((r) => {
      let o = j(r, i);
      return o.newRouteDest && (i.routeDest = o.newRouteDest), !o.valid;
    }) && !t.missing?.find((r) => j(r, i).valid) && !(a && t.status !== this.status)) {
      if (s && t.dest) {
        let r = /\/(\(\.+\))+/, o = r.test(t.dest), c = r.test(this.path);
        if (o && !c) return;
      }
      return { routeMatch: n, routeDest: i.routeDest };
    }
  }
  processMiddlewareResp(t) {
    let a = "x-middleware-override-headers", s = t.headers.get(a);
    if (s) {
      let c = new Set(s.split(",").map((h) => h.trim()));
      for (let h of c.keys()) {
        let d = `x-middleware-request-${h}`, _ = t.headers.get(d);
        this.reqCtx.request.headers.get(h) !== _ && (_ ? this.reqCtx.request.headers.set(h, _) : this.reqCtx.request.headers.delete(h)), t.headers.delete(d);
      }
      t.headers.delete(a);
    }
    let n = "x-middleware-rewrite", i = t.headers.get(n);
    if (i) {
      let c = new URL(i, this.url), h = this.url.hostname !== c.hostname;
      this.path = h ? `${c}` : c.pathname, x(this.searchParams, c.searchParams), t.headers.delete(n);
    }
    let r = "x-middleware-next";
    t.headers.get(r) ? t.headers.delete(r) : !i && !t.headers.has("location") ? (this.body = t.body, this.status = t.status) : t.headers.has("location") && t.status >= 300 && t.status < 400 && (this.status = t.status), y(this.reqCtx.request.headers, t.headers), y(this.headers.normal, t.headers), this.headers.middlewareLocation = t.headers.get("location");
  }
  async runRouteMiddleware(t) {
    if (!t) return true;
    let a = t && this.output[t];
    if (!a || a.type !== "middleware") return this.status = 500, false;
    let s = await N(a, this.reqCtx, { path: this.path, searchParams: this.searchParams, headers: this.headers, status: this.status });
    return this.middlewareInvoked.push(t), s.status === 500 ? (this.status = s.status, false) : (this.processMiddlewareResp(s), true);
  }
  applyRouteOverrides(t) {
    !t.override || (this.status = void 0, this.headers.normal = new Headers(), this.headers.important = new Headers());
  }
  applyRouteHeaders(t, a, s) {
    !t.headers || (y(this.headers.normal, t.headers, { match: a, captureGroupKeys: s }), t.important && y(this.headers.important, t.headers, { match: a, captureGroupKeys: s }));
  }
  applyRouteStatus(t) {
    !t.status || (this.status = t.status);
  }
  applyRouteDest(t, a, s) {
    if (!t.dest) return this.path;
    let n = this.path, i = t.dest;
    this.wildcardMatch && /\$wildcard/.test(i) && (i = i.replace(/\$wildcard/g, this.wildcardMatch.value)), this.path = b(i, a, s);
    let r = /\/index\.rsc$/i.test(this.path), o = /^\/(?:index)?$/i.test(n), c = /^\/__index\.prefetch\.rsc$/i.test(n);
    r && !o && !c && (this.path = n);
    let h = /\.rsc$/i.test(this.path), d = /\.prefetch\.rsc$/i.test(this.path), _ = this.path in this.output;
    h && !d && !_ && (this.path = this.path.replace(/\.rsc/i, ""));
    let v = new URL(this.path, this.url);
    return x(this.searchParams, v.searchParams), P(this.path) || (this.path = v.pathname), n;
  }
  applyLocaleRedirects(t) {
    if (!t.locale?.redirect || !/^\^(.)*$/.test(t.src) && t.src !== this.path || this.headers.normal.has("location")) return;
    let { locale: { redirect: s, cookie: n } } = t, i = n && this.cookies[n], r = L(i ?? ""), o = L(this.reqCtx.request.headers.get("accept-language") ?? ""), d = [...r, ...o].map((_) => s[_]).filter(Boolean)[0];
    if (d) {
      !this.path.startsWith(d) && (this.headers.normal.set("location", d), this.status = 307);
      return;
    }
  }
  getLocaleFriendlyRoute(t, a) {
    return !this.locales || a !== "miss" ? t : G(t.src, this.locales) ? { ...t, src: t.src.replace(/\/\(\.\*\)\$$/, "(?:/(.*))?$") } : t;
  }
  async checkRoute(t, a) {
    let s = this.getLocaleFriendlyRoute(a, t), { routeMatch: n, routeDest: i } = this.checkRouteMatch(s, { checkStatus: t === "error", checkIntercept: t === "rewrite" }) ?? {}, r = { ...s, dest: i };
    if (!n?.match || r.middlewarePath && this.middlewareInvoked.includes(r.middlewarePath)) return "skip";
    let { match: o, captureGroupKeys: c } = n;
    if (this.applyRouteOverrides(r), this.applyLocaleRedirects(r), !await this.runRouteMiddleware(r.middlewarePath)) return "error";
    if (this.body !== void 0 || this.headers.middlewareLocation) return "done";
    this.applyRouteHeaders(r, o, c), this.applyRouteStatus(r);
    let d = this.applyRouteDest(r, o, c);
    if (r.check && !P(this.path)) if (d === this.path) {
      if (t !== "miss") return this.checkPhase(O(t));
      this.status = 404;
    } else if (t === "miss") {
      if (!(this.path in this.output) && !(this.path.replace(/\/$/, "") in this.output)) return this.checkPhase("filesystem");
      this.status === 404 && (this.status = void 0);
    } else return this.checkPhase("none");
    return !r.continue || r.status && r.status >= 300 && r.status <= 399 ? "done" : "next";
  }
  async checkPhase(t) {
    if (this.checkPhaseCounter++ >= 50) return console.error(`Routing encountered an infinite loop while checking ${this.url.pathname}`), this.status = 500, "error";
    this.middlewareInvoked = [];
    let a = true;
    for (let i of this.routes[t]) {
      let r = await this.checkRoute(t, i);
      if (r === "error") return "error";
      if (r === "done") {
        a = false;
        break;
      }
    }
    if (t === "hit" || P(this.path) || this.headers.normal.has("location") || !!this.body) return "done";
    if (t === "none") for (let i of this.locales) {
      let r = new RegExp(`/${i}(/.*)`), c = this.path.match(r)?.[1];
      if (c && c in this.output) {
        this.path = c;
        break;
      }
    }
    let s = this.path in this.output;
    if (!s && this.path.endsWith("/")) {
      let i = this.path.replace(/\/$/, "");
      s = i in this.output, s && (this.path = i);
    }
    if (t === "miss" && !s) {
      let i = !this.status || this.status < 400;
      this.status = i ? 404 : this.status;
    }
    let n = "miss";
    return s || t === "miss" || t === "error" ? n = "hit" : a && (n = O(t)), this.checkPhase(n);
  }
  async run(t = "none") {
    this.checkPhaseCounter = 0;
    let a = await this.checkPhase(t);
    return this.headers.normal.has("location") && (!this.status || this.status < 300 || this.status >= 400) && (this.status = 307), a;
  }
};
async function ee(e, t, a, s) {
  let n = new E(t.routes, a, e, s, t.wildcard), i = await te(n);
  return ke(e, i, a);
}
__name(ee, "ee");
async function te(e, t = "none", a = false) {
  return await e.run(t) === "error" || !a && e.status && e.status >= 400 ? te(e, "error", true) : { path: e.path, status: e.status, headers: e.headers, searchParams: e.searchParams, body: e.body };
}
__name(te, "te");
async function ke(e, { path: t = "/404", status: a, headers: s, searchParams: n, body: i }, r) {
  let o = s.normal.get("location");
  if (o) {
    if (o !== s.middlewareLocation) {
      let d = [...n.keys()].length ? `?${n.toString()}` : "";
      s.normal.set("location", `${o ?? "/"}${d}`);
    }
    return new Response(null, { status: a, headers: s.normal });
  }
  let c;
  if (i !== void 0) c = new Response(i, { status: a });
  else if (P(t)) {
    let d = new URL(t);
    x(d.searchParams, n), c = await fetch(d, e.request);
  } else c = await N(r[t], e, { path: t, status: a, headers: s, searchParams: n });
  let h = s.normal;
  return y(h, c.headers), y(h, s.important), c = new Response(c.body, { ...c, status: a || c.status, headers: h }), c;
}
__name(ke, "ke");
l();
u();
p();
function se() {
  globalThis.__nextOnPagesRoutesIsolation ??= { _map: /* @__PURE__ */ new Map(), getProxyFor: Ee };
}
__name(se, "se");
function Ee(e) {
  let t = globalThis.__nextOnPagesRoutesIsolation._map.get(e);
  if (t) return t;
  let a = Me();
  return globalThis.__nextOnPagesRoutesIsolation._map.set(e, a), a;
}
__name(Ee, "Ee");
function Me() {
  let e = /* @__PURE__ */ new Map();
  return new Proxy(globalThis, { get: /* @__PURE__ */ __name((t, a) => e.has(a) ? e.get(a) : Reflect.get(globalThis, a), "get"), set: /* @__PURE__ */ __name((t, a, s) => Ie.has(a) ? Reflect.set(globalThis, a, s) : (e.set(a, s), true), "set") });
}
__name(Me, "Me");
var Ie = /* @__PURE__ */ new Set(["_nextOriginalFetch", "fetch", "__incrementalCache"]);
var je = Object.defineProperty;
var Ae = /* @__PURE__ */ __name((...e) => {
  let t = e[0], a = e[1], s = "__import_unsupported";
  if (!(a === s && typeof t == "object" && t !== null && s in t)) return je(...e);
}, "Ae");
globalThis.Object.defineProperty = Ae;
globalThis.AbortController = class extends AbortController {
  constructor() {
    try {
      super();
    } catch (t) {
      if (t instanceof Error && t.message.includes("Disallowed operation called within global scope")) return { signal: { aborted: false, reason: null, onabort: /* @__PURE__ */ __name(() => {
      }, "onabort"), throwIfAborted: /* @__PURE__ */ __name(() => {
      }, "throwIfAborted") }, abort() {
      } };
      throw t;
    }
  }
};
var Ts = { async fetch(e, t, a) {
  se(), X();
  let s = await __ALSes_PROMISE__;
  if (!s) {
    let r = new URL(e.url), o = await t.ASSETS.fetch(`${r.protocol}//${r.host}/cdn-cgi/errors/no-nodejs_compat.html`), c = o.ok ? o.body : "Error: Could not access built-in Node.js modules. Please make sure that your Cloudflare Pages project has the 'nodejs_compat' compatibility flag set.";
    return new Response(c, { status: 503 });
  }
  let { envAsyncLocalStorage: n, requestContextAsyncLocalStorage: i } = s;
  return n.run({ ...t, NODE_ENV: "production", SUSPENSE_CACHE_URL: w }, async () => i.run({ env: t, ctx: a, cf: e.cf }, async () => {
    if (new URL(e.url).pathname.startsWith("/_next/image")) return K(e, { buildOutput: m, assetsFetcher: t.ASSETS, imagesConfig: f.images });
    let o = B(e);
    return ee({ request: o, ctx: a, assetsFetcher: t.ASSETS }, f, m, g);
  }));
} };
export {
  Ts as default
};
/*!
 * cookie
 * Copyright(c) 2012-2014 Roman Shtylman
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */
//# sourceMappingURL=bundledWorker-0.23631655032595744.mjs.map
