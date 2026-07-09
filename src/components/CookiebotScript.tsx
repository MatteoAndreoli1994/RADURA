const cookiebotId = process.env.NEXT_PUBLIC_COOKIEBOT_ID;

/**
 * Cookiebot must be the first script in <head>. Next.js injects its own chunks
 * before custom tags, so we bootstrap with a tiny inline loader that prepends uc.js.
 */
export function CookiebotScript() {
  if (!cookiebotId) return null;

  const loader = `(function(){var id=${JSON.stringify(cookiebotId)};if(document.getElementById("Cookiebot"))return;var s=document.createElement("script");s.id="Cookiebot";s.src="https://consent.cookiebot.com/uc.js";s.setAttribute("data-cbid",id);s.setAttribute("data-blockingmode","auto");s.type="text/javascript";var h=document.head||document.getElementsByTagName("head")[0];if(h){h.insertBefore(s,h.firstChild);}})();`;

  return (
    <script
      id="cookiebot-loader"
      dangerouslySetInnerHTML={{ __html: loader }}
    />
  );
}
