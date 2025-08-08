(function(){
  try {
    var s = document.currentScript;
    var src = s && s.src ? s.src : '';
    var url = new URL(src);
    var id = url.searchParams.get('id');
    if (!id) { console.warn('[Embed] Missing ?id=CHATBOT_ID in script src'); return; }

    var params = new URLSearchParams();
    ['skipWelcome','maximizable','theme','primaryColor','botName','autoOpenDelay'].forEach(function(key){
      var v = url.searchParams.get(key);
      if (v !== null && v !== undefined && v !== '') params.set(key, v);
    });

    var container = document.createElement('div');
    container.id = 'chatbot-embed-container-' + id;
    container.style.position = 'fixed';
    container.style.bottom = '20px';
    container.style.right = '20px';
    container.style.zIndex = '999999';
    document.body.appendChild(container);

    var iframe = document.createElement('iframe');
    iframe.src = location.origin + '/embed/' + encodeURIComponent(id) + (params.toString() ? ('?' + params.toString()) : '');
    iframe.style.width = '400px';
    iframe.style.height = '600px';
    iframe.style.border = '0';
    iframe.style.borderRadius = '12px';
    iframe.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)';
    iframe.allow = 'clipboard-write;';
    iframe.title = 'Chatbot';

    container.appendChild(iframe);
  } catch (e) {
    console.error('[Embed] failed to initialize', e);
  }
})();