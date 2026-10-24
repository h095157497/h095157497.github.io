/* InstaDownloadai — site.js v3 (shared by all pages)
 * 1) reveal-on-scroll  2) scroll progress bar  3) feature-card spotlight
 * 4) interactive demo widget (labels come from #demo-data JSON — localized)
 */
(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1) reveal-on-scroll ---------- */
  var els = [].slice.call(document.querySelectorAll('.reveal'));
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
    addEventListener('scroll', upd, { passive: true });
    upd();
  }

  /* ---------- 3) feature-card spotlight (--mx / --my) ---------- */
  if (matchMedia('(hover:hover)').matches) {
    document.querySelectorAll('.feat').forEach(function (c) {
      c.addEventListener('pointermove', function (e) {
        var r = c.getBoundingClientRect();
        c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        c.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* ---------- 4) demo widget ---------- */
  var form = document.querySelector('.demo-form');
  if (form) {
    var data = {};
    var tag = document.getElementById('demo-data');
    try { data = JSON.parse(tag ? tag.textContent : '{}'); } catch (e) { data = {}; }
    var input = form.querySelector('.demo-input');
    var btn = form.querySelector('.demo-btn');
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
      if (instant || reduce) { d.classList.add('on'); return; }
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
