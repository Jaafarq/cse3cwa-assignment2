// Builds a standalone HTML document string with inline CSS and JS only (no classes)
// Meets: "Output html5 code with JS and inline CSS (no CSS Classes)."
export type Tab = { title: string; content: string };

export function buildTabsHTML(title: string, tabs: Tab[]): string {
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const buttons = tabs
    .map((t, i) => {
      // inline styles only
      return `<button role="tab" id="tab-${i}" aria-controls="panel-${i}" aria-selected="${i===0?"true":"false"}"
style="padding:8px 12px;border:1px solid #ccc;border-radius:8px;margin-right:6px;background:${i===0?"#2563eb":"#f5f5f5"};color:${i===0?"#fff":"#111"};cursor:pointer;"
onclick="selectTab(${i})">${esc(t.title)}</button>`;
    })
    .join("");

  const panels = tabs
    .map((t, i) => {
      return `<div role="tabpanel" id="panel-${i}" aria-labelledby="tab-${i}"
style="display:${i===0?"block":"none"};border:1px solid #ddd;border-radius:12px;padding:12px;margin-top:10px;">
${t.content}
</div>`;
    })
    .join("\n");

  // cookie helpers (remember which tab user last used)
  const cookieFns = `
function setCookie(n,v,d){var e=new Date(Date.now()+d*864e5).toUTCString();document.cookie=encodeURIComponent(n)+"="+encodeURIComponent(v)+"; Path=/; Expires="+e+"; SameSite=Lax";}
function getCookie(n){return document.cookie.split("; ").reduce(function(r,v){var p=v.split("=");return p[0]===encodeURIComponent(n)?decodeURIComponent(p.slice(1).join("=")):r},null);}
`;

  const script = `
${cookieFns}
function selectTab(idx){
  var tabs=document.querySelectorAll('[role="tab"]');
  var panels=document.querySelectorAll('[role="tabpanel"]');
  for(var i=0;i<tabs.length;i++){
    var active = i===idx;
    tabs[i].setAttribute('aria-selected', active ? 'true':'false');
    tabs[i].style.background = active ? '#2563eb' : '#f5f5f5';
    tabs[i].style.color = active ? '#fff' : '#111';
    panels[i].style.display = active ? 'block' : 'none';
  }
  setCookie('activeTabIndex', String(idx), 30);
}
window.addEventListener('DOMContentLoaded', function(){
  var c = getCookie('activeTabIndex');
  if(c){ var i = parseInt(c,10); if(!isNaN(i)) selectTab(i); }
});
`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${esc(title)}</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; line-height:1.5; color:#111; background:#fff; padding:16px;">
  <h1 style="margin-top:0;">${esc(title)}</h1>
  <div role="tablist" aria-label="Tab list" style="margin-bottom:6px;">
    ${buttons}
  </div>
  ${panels}
<script>
${script}
</script>
</body>
</html>`;
}
