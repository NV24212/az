/// <reference types="@cloudflare/workers-types" />

interface Env {
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // A simple regex to detect paths that likely map to a static file.
    // This is not exhaustive, but covers common cases for this app.
    const isStaticAsset = /^\/assets\/|^\/vite.svg$|\.(ico|png|jpg|jpeg|gif)$/.test(pathname);

    if (isStaticAsset) {
      // If it's a static asset, fetch it from the ASSETS service binding.
      return env.ASSETS.fetch(request);
    }

    // For all other requests, serve index.html for the SPA.
    const spaUrl = new URL('/index.html', request.url);
    return env.ASSETS.fetch(new Request(spaUrl, request));
  },
};
