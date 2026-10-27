/* SWISS GRID SUPREME — v8 production JS (design champion extract; locale-aware digits).
   Selector-audit per b8 final-tech.md §2: no closest() with invalid selectors; t.me links are plain anchors. */

(function(){
  "use strict";
  var RM = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var LOC = { fa: "fa-IR", ar: "ar-EG" }[document.documentElement.lang] || "en-US";
  var fa = function(n){ return n.toLocaleString(LOC); };

  /* progress hairline */
  var pb = document.querySelector(".prog");
  function setP(){
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    pb.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0).toFixed(2) + "%";
  }
  addEventListener("scroll", setP, { passive:true }); setP();

  /* Tehran clock */
  try{
    var clk = document.getElementById("clk");
    var f = new Intl.DateTimeFormat("en-GB", { timeZone:"Asia/Tehran", hour:"2-digit", minute:"2-digit", second:"2-digit", hour12:false });
    var tick = function(){ clk.textContent = f.format(new Date()); };
    tick(); setInterval(tick, 1000);
  }catch(e){}

  /* count-up — final values are already in the markup (no-JS safe) */
  var nums = Array.prototype.slice.call(document.querySelectorAll(".num"));
  function finish(el){ el.textContent = fa(+el.dataset.to); }
  if (RM || !("IntersectionObserver" in window)) {
    nums.forEach(finish);
  } else {
    var io = new IntersectionObserver(function(es){
      es.forEach(function(en){
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        var el = en.target, to = +el.dataset.to || 0, t0 = null, dur = 950;
        function frame(t){
          if (!t0) t0 = t;
          var p = Math.min((t - t0) / dur, 1);
          var e = 1 - Math.pow(1 - p, 3); /* easeOutCubic */
          el.textContent = fa(Math.round(to * e));
          if (p < 1) requestAnimationFrame(frame); else finish(el);
        }
        requestAnimationFrame(frame);
      });
    }, { threshold:.5 });
    nums.forEach(function(el){ io.observe(el); });
  }

})();
