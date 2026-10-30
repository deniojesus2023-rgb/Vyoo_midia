// Funil Caso 001: parâmetros (UTM/fbclid), tracking com deduplicação e estado da triagem.
(function () {
  var KEY_RESULT = 'ac001_triagem', KEY_PARAMS = 'ac001_params', KEY_EVENTS = 'ac001_events';
  var KEEP = /^(utm_[a-z_]+|fbclid|gclid|ttclid|src|sck|ref|xcod)$/i;
  function sget(k) { try { return JSON.parse(sessionStorage.getItem(k) || 'null'); } catch (e) { return null; } }
  function sset(k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function captureParams() {
    var stored = sget(KEY_PARAMS) || {};
    try { new URLSearchParams(location.search).forEach(function (v, k) { if (KEEP.test(k)) stored[k] = v; }); } catch (e) {}
    sset(KEY_PARAMS, stored);
    return stored;
  }
  function withParams(url) {
    var p = captureParams();
    try {
      var u = new URL(url, location.href);
      Object.keys(p).forEach(function (k) { if (!u.searchParams.has(k)) u.searchParams.set(k, p[k]); });
      return u.toString();
    } catch (e) { return url; }
  }
  // Mapeamento para eventos padrão do Meta Pixel. Compra NÃO é disparada aqui: deve vir da plataforma de checkout.
  var FB_STD = { view_offer: 'ViewContent', initiate_checkout: 'InitiateCheckout' };
  function track(name, data, opts) {
    data = data || {}; opts = opts || {};
    var id = opts.onceKey || (opts.once ? name : null);
    if (id) {
      var fired = sget(KEY_EVENTS) || [];
      if (fired.indexOf(id) !== -1) return;
      fired.push(id); sset(KEY_EVENTS, fired);
    }
    var payload = Object.assign({ event: name, funnel: 'caso001_desafio10' }, captureParams(), data);
    (window.dataLayer = window.dataLayer || []).push(payload);
    if (typeof window.fbq === 'function') {
      if (FB_STD[name]) window.fbq('track', FB_STD[name], data); else window.fbq('trackCustom', name, data);
    }
    if (window.FUNNEL_DEBUG) console.log('[funnel]', payload);
  }
  window.Funnel = {
    track: track, withParams: withParams, captureParams: captureParams,
    getResult: function () { return sget(KEY_RESULT); },
    setResult: function (r) { sset(KEY_RESULT, r); }
  };
  captureParams();
})();
