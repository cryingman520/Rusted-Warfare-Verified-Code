const canonicalOrigin = 'https://rwmod.noaushio.uk';
const verificationPath = '/baidu_verify_codeva-GrZg8N53Sg.html';
const verificationContent = '31bc3cfebb2fabcfa445fe7cc66b93bd';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!['GET', 'HEAD'].includes(request.method)) {
      return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET, HEAD' } });
    }
    if (url.pathname === verificationPath) {
      return new Response(request.method === 'HEAD' ? null : verificationContent, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=300', 'X-Robots-Tag': 'noindex' }
      });
    }
    if (url.pathname === '/index.html') {
      return Response.redirect(canonicalOrigin + '/' + url.search, 301);
    }
    const response = await env.ASSETS.fetch(request);
    if (url.pathname !== '/' || url.searchParams.get('lang') !== 'en' || response.status !== 200) return response;
    const headers = new Headers(response.headers);
    headers.set('Content-Language', 'en');
    headers.set('Link', `<${canonicalOrigin}/?lang=en>; rel="canonical"`);
    if (request.method === 'HEAD') return new Response(null, { status: response.status, headers });
    return new HTMLRewriter()
      .on('html', { element(element) { element.setAttribute('lang', 'en'); } })
      .on('title', { element(element) { element.setInnerContent('Rusted Warfare Mod Workshop · Create your battlefield'); } })
      .on('meta[name="description"]', { element(element) { element.setAttribute('content', 'Learn Rusted Warfare modding with guided courses, example mods, unit and map editors, pixel art tools and free cloud AI'); } })
      .on('link[rel="canonical"]', { element(element) { element.setAttribute('href', canonicalOrigin + '/?lang=en'); } })
      .transform(new Response(response.body, { status: response.status, headers }));
  }
};
