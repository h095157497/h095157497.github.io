
(function(){
'use strict';
var d=document,w=window,tg=w.Telegram&&w.Telegram.WebApp;
// theme: stored pref > Telegram colorScheme > system
function cur(){return d.documentElement.getAttribute('data-theme')||'dark'}
function set(t){d.documentElement.setAttribute('data-theme',t);try{localStorage.setItem('id-theme',t)}catch(e){}}
var saved=null;try{saved=localStorage.getItem('id-theme')}catch(e){}
if(!saved&&tg&&tg.colorScheme==='light')set('light');
var btn=d.getElementById('thm');
if(btn){btn.addEventListener('click',function(){set(cur()==='dark'?'light':'dark')});}
// Telegram WebApp integration
if(tg){try{tg.ready();tg.expand();tg.setHeaderColor&&tg.setHeaderColor('#0d0d15');tg.setBackgroundColor&&tg.setBackgroundColor('#0d0d15')}catch(e){}
 // route t.me links through the in-app opener
 d.addEventListener('click',function(ev){var a=ev.target.closest&&ev.target.closest('a[href*="t.me/"]');if(a){ev.preventDefault();try{tg.openTelegramLink(a.href)}catch(e){w.open(a.href,'_blank')}}},false);}
// header shadow
var hd=d.querySelector('header');
w.addEventListener('scroll',function(){if(hd)hd.classList.toggle('sc',w.scrollY>8)},{passive:true});
// mobile menu
var mm=d.getElementById('mm'),lk=d.getElementById('lk');
if(mm&&lk){mm.addEventListener('click',function(){lk.classList.toggle('open');mm.setAttribute('aria-expanded',lk.classList.contains('open'))});
 lk.addEventListener('click',function(ev){if(ev.target.tagName==='A')lk.classList.remove('open')});}
// reveal on scroll
if('IntersectionObserver' in w){var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){en.target.classList.add('on');io.unobserve(en.target)}})},{threshold:.12});
 document.querySelectorAll('.rv').forEach(function(el){io.observe(el)})}else{document.querySelectorAll('.rv').forEach(function(el){el.classList.add('on')})}
// hero typewriter
var ph=d.getElementById('tw');
if(ph){var words=JSON.parse(ph.getAttribute('data-words')||'[]');var wi=0,ci=0,del=false;
 var reduce=w.matchMedia&&w.matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(reduce||!words.length){if(words.length)ph.textContent=words[0];}
 else{(function tick(){var word=words[wi];ci+=del?-1:1;ph.textContent=word.slice(0,ci);
  var wait=del?28:60;
  if(!del&&ci===word.length){wait=1400;del=true}else if(del&&ci===0){del=false;wi=(wi+1)%words.length;wait=300}
  setTimeout(tick,wait)})()}}
})();
