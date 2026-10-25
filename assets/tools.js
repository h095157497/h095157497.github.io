
(function(){
'use strict';
var $=function(id){return document.getElementById(id)};
function spin(on){return on?'<span class="spin"></span>':''}
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
// ── QR ──
var qrSizes={s:256,m:384,l:512};
function buildQr(){
 var txt=$('qrtxt').value.trim(),box=$('qrout'),err=$('qrerr');
 err.textContent='';if(!txt){return}
 try{
  var size=qrSizes[$('qrsize').value]||384;
  var qr=qrcode(0,'M');qr.addData(txt);qr.make();
  var n=qr.getModuleCount(),cell=Math.max(2,Math.floor(size/n)),cv=$('qrcv');
  cv.width=n*cell;cv.height=n*cell;
  var ctx=cv.getContext('2d');ctx.fillStyle='#ffffff';ctx.fillRect(0,0,cv.width,cv.height);ctx.fillStyle='#0d0d15';
  for(var r=0;r<n;r++)for(var c=0;c<n;c++)if(qr.isDark(r,c))ctx.fillRect(c*cell,r*cell,cell,cell);
  box.style.display='flex';
  var dl=$('qrdl');dl.href=cv.toDataURL('image/png');dl.download='qr.png';
  $('qrdl').style.display='inline-flex';
 }catch(e){err.textContent=$('qrerr').getAttribute('data-msg')}
}
if($('qrgo')){$('qrgo').addEventListener('click',buildQr);$('qrtxt').addEventListener('keydown',function(e){if(e.key==='Enter')buildQr()});}
// ── rates ──
function cacheKey(a,b){return 'id-rate-'+a+'-'+b}
function getRate(){
 var amt=parseFloat(($('ramt').value||'1').replace(/[^\d.]/g,''))||1;
 var a=$('rfrom').value.trim().toUpperCase(),b=$('rto').value.trim().toUpperCase();
 var out=$('rout');out.className='res';
 if(!/^[A-Z]{3,4}$/.test(a)||!/^[A-Z]{3,4}$/.test(b)){out.className='res err';out.textContent=$('rout').getAttribute('data-unknown');return}
 out.innerHTML=spin(1)+'…';
 var ck=cacheKey(a,b),hit=null;
 try{var raw=sessionStorage.getItem(ck);if(raw){var o=JSON.parse(raw);if(Date.now()-o.t<600000)hit=o}}catch(e){}
 if(hit){return showRate(amt,a,b,hit.r)}
 fetch('https://open.er-api.com/v6/latest/'+a).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(j){
  if(!j||!j.rates||!(b in j.rates))throw 0;
  try{sessionStorage.setItem(ck,JSON.stringify({t:Date.now(),r:j.rates[b]}))}catch(e){}
  showRate(amt,a,b,j.rates[b]);
 }).catch(function(){out.className='res err';out.textContent=$('rout').getAttribute('data-msg')});
}
function showRate(amt,a,b,r){
 var v=amt*r,vf=v>=100?Math.round(v).toLocaleString('en-US'):v.toFixed(v>=1?3:6);
 var rf=r>=100?Math.round(r).toLocaleString('en-US'):r.toFixed(r>=1?4:6);
 $('rout').className='res ok';
 $('rout').innerHTML='<span class="big">'+esc(String(amt))+' '+esc(a)+' = '+vf+' '+esc(b)+'</span><div class="mut" dir="ltr">1 '+esc(a)+' = '+rf+' '+esc(b)+' — open.er-api.com</div>';
}
if($('rgo')){$('rgo').addEventListener('click',getRate);
 document.querySelectorAll('[data-cur]').forEach(function(el){el.addEventListener('click',function(){$('rto').value=el.getAttribute('data-cur');getRate()})});}
// ── weather (open-meteo: geocode + forecast) ──
var WMO={0:['☀️','صاف'],1:['🌤️','عمدتاً صاف'],2:['⛅','نیم‌ابری'],3:['☁️','ابری'],45:['🌫️','مه'],48:['🌫️','مه یخ‌زده'],51:['🌦️','نم‌نم خفیف'],53:['🌦️','نم‌نم'],55:['🌧️','نم‌نم شدید'],61:['🌧️','باران خفیف'],63:['🌧️','باران'],65:['⛈️','باران شدید'],66:['🌧️','باران یخ‌زده'],67:['🌧️','باران یخ‌زده'],71:['🌨️','برف خفیف'],73:['❄️','برف'],75:['❄️','برف سنگین'],77:['🌨️','دانهٔ برف'],80:['🌦️','رگبار خفیف'],81:['🌧️','رگبار'],82:['⛈️','رگبار شدید'],85:['🌨️','رگبار برف'],86:['❄️','رگبار برف'],95:['⛈️','رعدوبرق'],96:['⛈️','رعدوبرق با تگرگ'],99:['⛈️','رعدوبرق با تگرگ']};
function weather(){
 var city=$('wcity').value.trim(),out=$('wout'),D=$('wout').getAttribute('data-days').split('|');
 out.className='res';
 if(!city)return;
 out.innerHTML=spin(1)+'…';
 fetch('https://geocoding-api.open-meteo.com/v1/search?count=1&language=fa&name='+encodeURIComponent(city))
 .then(function(r){if(!r.ok)throw 0;return r.json()})
 .then(function(g){
  var p=g&&g.results&&g.results[0];if(!p)throw 'nf';
  return fetch('https://api.open-meteo.com/v1/forecast?latitude='+p.latitude+'&longitude='+p.longitude+'&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=3&timezone=auto').then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(f){return{p:p,f:f}});
 })
 .then(function(o){
  var c=o.f.current,w0=WMO[c.weather_code]||['🌡️',''];
  var days=o.f.daily,i,html='';
  for(i=1;i<3;i++){var wm=WMO[days.weather_code[i]]||['🌡️',''];
   html+='<div class="wday"><div class="d">'+esc(D[i]||'')+'</div><div class="e">'+wm[0]+'</div><div class="t">'+Math.round(days.temperature_2m_max[i])+'° / '+Math.round(days.temperature_2m_min[i])+'°</div></div>';}
  out.className='res ok';
  out.innerHTML='<div class="wnow"><div class="t">'+Math.round(c.temperature_2m)+'°C</div><div><div><b>'+esc(o.p.name)+'</b>'+(o.p.admin1?', '+esc(o.p.admin1):'')+'</div><div class="mut">'+w0[0]+' '+esc(w0[1])+' · <bdi>'+$('wout').getAttribute('data-feel')+' '+Math.round(c.apparent_temperature)+'°</bdi> · <bdi>'+$('wout').getAttribute('data-wind')+' '+Math.round(c.wind_speed_10m)+' km/h</bdi> · <bdi>'+$('wout').getAttribute('data-hum')+' '+c.relative_humidity_2m+'%</bdi></div></div></div><div class="wgrid"><div class="wday"><div class="d">'+esc(D[0])+'</div><div class="e">'+w0[0]+'</div><div class="t">'+Math.round(days.temperature_2m_max[0])+'° / '+Math.round(days.temperature_2m_min[0])+'°</div></div>'+html+'</div><div class="mut" style="margin-top:8px">open-meteo.com</div>';
 })
 .catch(function(e){out.className='res err';out.textContent=e==='nf'?$('wout').getAttribute('data-none'):$('wout').getAttribute('data-msg')});
}
if($('wgo')){$('wgo').addEventListener('click',weather);$('wcity').addEventListener('keydown',function(e){if(e.key==='Enter')weather()});}
// ── lyrics (lrclib) ──
function lyrics(){
 var ar=$('lart').value.trim(),tr=$('ltrk').value.trim(),out=$('lout');
 out.className='res';
 if(!ar&&!tr)return;
 out.innerHTML=spin(1)+'…';
 var url='https://lrclib.net/api/search?limit=5'+(ar?'&artist_name='+encodeURIComponent(ar):'')+(tr?'&track_name='+encodeURIComponent(tr):'');
 fetch(url).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(list){
  if(!Array.isArray(list)||!list.length)throw 'nf';
  var best=null,i;for(i=0;i<list.length;i++){if(list[i].plainLyrics){best=list[i];break}if(!best&&list[i].syncedLyrics)best=list[i]}
  if(!best)throw 'nf';
  var txt=(best.plainLyrics||best.syncedLyrics||'').trim();
  var lines=txt.split('\n'),cap=60,cut=lines.length>cap;
  out.className='res ok';
  out.innerHTML='<div class="mut" dir="ltr" style="margin-bottom:8px"><b>'+esc(best.artistName)+'</b> — '+esc(best.trackName)+(best.albumName?' · '+esc(best.albumName):'')+' · lrclib.net</div><div class="lyr" id="lbody"></div>'+(cut?'<button class="btn btn-ghost" id="lmore" style="margin-top:10px">'+$('lout').getAttribute('data-more')+'</button>':'');
  var body=document.getElementById('lbody');body.textContent=(cut?lines.slice(0,cap).join('\n'):txt);
  if(cut)document.getElementById('lmore').addEventListener('click',function(){body.textContent=txt;this.remove()});
 }).catch(function(e){out.className='res err';out.textContent=e==='nf'?$('lout').getAttribute('data-none'):$('lout').getAttribute('data-msg')});
}
if($('lgo')){$('lgo').addEventListener('click',lyrics);
 $('ltrk').addEventListener('keydown',function(e){if(e.key==='Enter')lyrics()});}
// ── copy /tr command ──
var cp=$('trcopy');
if(cp){cp.addEventListener('click',function(){
 var t=$('trcmd').textContent.trim();
 (navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(function(){cp.textContent=cp.getAttribute('data-ok')}).catch(function(){
  var ta=document.createElement('textarea');ta.value=t;document.body.appendChild(ta);ta.select();try{document.execCommand('copy');cp.textContent=cp.getAttribute('data-ok')}catch(e){}
  ta.remove()});
 setTimeout(function(){cp.textContent=cp.getAttribute('data-cp')},1600)});
}
})();
