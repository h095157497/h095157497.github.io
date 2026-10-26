/* InstaDownloadai v7 — shared behavior (Holographic Luxury Dark)
   spotlight · reveal · count-up · sticky header · mobile menu · t.me opener */
(function(){
'use strict';
var d=document,rm=matchMedia('(prefers-reduced-motion: reduce)').matches;
/* hover spotlight follows cursor */
d.addEventListener('pointermove',function(e){
  var t=e.target.closest&&e.target.closest('.spot');if(!t)return;
  var r=t.getBoundingClientRect();
  t.style.setProperty('--mx',(e.clientX-r.left)+'px');
  t.style.setProperty('--my',(e.clientY-r.top)+'px');
},{passive:true});
/* scroll reveal */
var els=[].slice.call(d.querySelectorAll('.rv'));
if(rm||!('IntersectionObserver'in window)){els.forEach(function(el){el.classList.add('in')});}
else{
  var io=new IntersectionObserver(function(es){es.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}})},{threshold:.12,rootMargin:'0px 0px -5% 0px'});
  els.forEach(function(el){io.observe(el)});
}
/* stat count-up on scroll (latin for [lang=en], Arabic-Indic for [lang=ar], Persian otherwise) */
var faD='۰۱۲۳۴۵۶۷۸۹',arD='٠١٢٣٤٥٦٧٨٩';
function fmt(n,en,ar){var s=String(n);if(!en)s=s.replace(/\d/g,function(x){return (ar?arD:faD)[+x]});return s}
var counters=[].slice.call(d.querySelectorAll('[data-count]'));
if(!rm&&'IntersectionObserver'in window&&counters.length){
  var so=new IntersectionObserver(function(es){es.forEach(function(x){
    if(!x.isIntersecting)return;so.unobserve(x.target);
    var el=x.target,tgt=+el.getAttribute('data-count'),suf=el.getAttribute('data-suffix')||'',t0=null,dur=1200;
    var en=!!el.closest('[lang="en"]'),ar=!en&&!!el.closest('[lang="ar"]');
    function step(t){if(t0===null)t0=t;var p=Math.min((t-t0)/dur,1);p=1-Math.pow(1-p,3);
      el.textContent=fmt(Math.round(tgt*p),en,ar)+suf;if(p<1)requestAnimationFrame(step)}
    requestAnimationFrame(step);
  })},{threshold:.6});
  counters.forEach(function(el){so.observe(el)});
}
/* sticky header state */
var h=d.querySelector('.hdr');
if(h)addEventListener('scroll',function(){h.classList.toggle('sc',scrollY>8)},{passive:true});
/* mobile menu */
var m=d.getElementById('mm'),lk=d.getElementById('lk');
if(m&&lk){
  m.addEventListener('click',function(){var o=lk.classList.toggle('open');m.setAttribute('aria-expanded',o?'true':'false')});
  lk.addEventListener('click',function(e){if(e.target.closest&&e.target.closest('a')){lk.classList.remove('open');m.setAttribute('aria-expanded','false')}});
}
/* Telegram WebApp: route t.me links through the in-app opener (fixed selector, guarded) */
try{
  var tg=window.Telegram&&window.Telegram.WebApp;
  if(tg){
    try{tg.ready();tg.expand();tg.setHeaderColor&&tg.setHeaderColor('#05030a');tg.setBackgroundColor&&tg.setBackgroundColor('#05030a')}catch(e){}
    d.addEventListener('click',function(ev){
      var a=ev.target.closest&&ev.target.closest('a[href*="t.me/"]');
      if(!a)return;
      ev.preventDefault();
      try{tg.openTelegramLink(a.href)}catch(e){window.open(a.href,'_blank')}
    },false);
  }
}catch(e){}
})();
