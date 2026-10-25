/* InstaDownloadai — site.js v4 (shared by all pages, zero deps)
 * 1) reveal-on-scroll (IO)  2) scroll progress bar  3) card spotlight + conic border position
 * 4) interactive demo widget (labels from #demo-data — localized)
 * v5 features: 5) dark/light theme toggle (persist + system + view-transition)
 *              6) header elevation on scroll  7) stats count-up (latin + ۰-۹)
 *              8) phone 3D tilt  9) pointer-glow on CTAs/stats
 */
(function () {
  'use strict';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };

  /* ---------- 5) theme ---------- */
  var root = document.documentElement;
  var themeMeta = $('meta[name="theme-color"]');
  var TCOL = { dark: '#050e0b', light: '#eef7f2' };
  var curTheme = function () { return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark'; };
  var paintTheme = function (t) {
    root.setAttribute('data-theme', t);
    if (themeMeta) themeMeta.setAttribute('content', TCOL[t]);
    $$('.theme-btn .ti').forEach(function (i) { i.textContent = t === 'light' ? '🌙' : '☀️'; });
  };
  paintTheme(curTheme());
  $$('.theme-btn').forEach(function (b) {
    b.addEventListener('click', function () {
      var next = curTheme() === 'light' ? 'dark' : 'light';
      try { localStorage.setItem('id-theme', next); } catch (e) {}
      if (document.startViewTransition && !reduce) document.startViewTransition(function () { paintTheme(next); });
      else paintTheme(next);
    });
  });

  /* ---------- 6) header elevation ---------- */
  var head = $('.site-head');
  if (head) {
    var hUpd = function () { head.classList.toggle('scrolled', (window.scrollY || 0) > 10); };
    addEventListener('scroll', hUpd, { passive: true }); hUpd();
  }

  /* ---------- 1) reveal-on-scroll ---------- */
  var els = $$('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    els.forEach(function (e) { e.classList.add('in'); });
  } else {
    var o = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); o.unobserve(en.target); }
      });
    }, { threshold: 0.1 });
    els.forEach(function (e) { e.classList.add('rv'); o.observe(e); });
  }

  /* ---------- 2) scroll progress bar ---------- */
  var pb = document.getElementById('pbar');
  if (pb) {
    var upd = function () {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      pb.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
    };
    addEventListener('scroll', upd, { passive: true }); upd();
  }

  /* ---------- 3) spotlight + glow positions ---------- */
  if (matchMedia('(hover:hover)').matches && !reduce) {
    var track = function (el, opts) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var x = e.clientX - r.left, y = e.clientY - r.top;
        if (opts.mx) { el.style.setProperty('--mx', x + 'px'); el.style.setProperty('--my', y + 'px'); }
        if (opts.px) { el.style.setProperty('--px', x + 'px'); el.style.setProperty('--py', y + 'px'); }
        if (opts.gx) {
          el.style.setProperty('--gx', ((x / r.width) * 100).toFixed(1) + '%');
          el.style.setProperty('--gy', ((y / r.height) * 100).toFixed(1) + '%');
        }
      });
    };
    $$('.feat').forEach(function (c) { track(c, { mx: 1, gx: 1 }); });
    $$('.cta, .ghost, .stat').forEach(function (c) { track(c, { px: 1 }); });
    /* ---------- 8) phone 3D tilt ---------- */
    var phone = $('.phone');
    if (phone) {
      phone.addEventListener('pointermove', function (e) {
        var r = phone.getBoundingClientRect();
        var yr = (e.clientY - r.top) / r.height, xr = (e.clientX - r.left) / r.width;
        phone.style.setProperty('--rx', ((0.5 - yr) * 9).toFixed(2) + 'deg');
        phone.style.setProperty('--ry', ((xr - 0.5) * 11).toFixed(2) + 'deg');
      });
      phone.addEventListener('pointerleave', function () {
        phone.style.setProperty('--rx', '0deg'); phone.style.setProperty('--ry', '0deg');
      });
    }
  }

  /* ---------- 7) stats count-up (latin + Persian digits) ---------- */
  var FA = '۰۱۲۳۴۵۶۷۸۹';
  var toFa = function (s) { return String(s).replace(/[0-9]/g, function (d) { return FA[+d]; }); };
  var ease = function (t) { return 1 - Math.pow(1 - t, 3); };
  $$('.stat b').forEach(function (el) {
    var txt = (el.textContent || '').trim();
    var m = txt.match(/^([^0-9\u06F0-\u06F9]*)([0-9\u06F0-\u06F9]+)([^0-9\u06F0-\u06F9]*)$/);
    if (!m) return;
    var isFa = /[\u06F0-\u06F9]/.test(m[2]);
    var n = parseInt(m[2].replace(/[\u06F0-\u06F9]/g, function (d) { return String(FA.indexOf(d)); }), 10);
    if (!isFinite(n) || n === 0) return;
    if (reduce || !('IntersectionObserver' in window)) return; /* keep static */
    el.textContent = txt;
    var seen = false;
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        if (!en.isIntersecting || seen) return;
        seen = true; io.disconnect();
        var t0 = null;
        var step = function (ts) {
          if (t0 === null) t0 = ts;
          var p = Math.min(1, (ts - t0) / 950);
          var v = String(Math.round(n * ease(p)));
          el.textContent = m[1] + (isFa ? toFa(v) : v) + m[3];
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });
    io.observe(el);
  });

  /* ---------- 4) demo widget ---------- */
  var form = $('.demo-form');
  if (form) {
    var data = {};
    var tag = document.getElementById('demo-data');
    try { data = JSON.parse(tag ? tag.textContent : '{}'); } catch (e) { data = {}; }
    var input = $('.demo-input', form);
    var btn = $('.demo-btn', form);
    var log = form.parentElement.querySelector('.demo-log');
    var done = form.parentElement.querySelector('.demo-done');
    var cta = done ? done.querySelector('a') : null;
    if (cta && data.ctaText) cta.textContent = data.ctaText;
    if (data.lab) {
      var lab = form.parentElement.querySelector('.demo-lab b');
      if (lab) lab.textContent = data.lab;
    }
    var timer = null;
    var addLine = function (txt, instant) {
      var d = document.createElement('div');
      d.className = 'dline';
      var sp = document.createElement('span');
      sp.className = 'sp';
      d.appendChild(sp);
      var t = document.createElement('span');
      t.textContent = txt;
      d.appendChild(t);
      log.appendChild(d);
      if (instant || reduce) { d.classList.add('on'); return d; }
      requestAnimationFrame(function () { requestAnimationFrame(function () { d.classList.add('on'); }); });
      return d;
    };
    var finish = function (lastLine) {
      if (lastLine) {
        lastLine.classList.add('ok');
        lastLine.querySelector('.sp').textContent = '✓';
      }
      if (done) done.classList.add('on');
      if (btn) btn.disabled = false;
    };
    var run = function () {
      var v = (input.value || '').trim();
      var isLink = /^https?:\/\//i.test(v) || /instagram\.com|pinterest\.com|pin\.it/i.test(v);
      var steps = isLink ? (data.link || []) : (data.song || []);
      if (!steps.length) return;
      log.innerHTML = '';
      log.classList.add('on');
      if (done) done.classList.remove('on');
      if (btn) btn.disabled = true;
      var prev = null;
      steps.forEach(function (s, i) {
        timer = setTimeout(function () {
          if (prev) { prev.classList.add('ok'); prev.querySelector('.sp').textContent = '✓'; }
          prev = addLine(s);
          if (i === steps.length - 1) {
            timer = setTimeout(function () { finish(prev); }, reduce ? 0 : 550);
          }
        }, reduce ? 0 : 650 * (i + 1));
      });
    };
    form.addEventListener('submit', function (e) { e.preventDefault(); clearTimeout(timer); run(); });
  }
})();
