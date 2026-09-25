/* =========================================================
   DIVYA DHANAK — Portfolio interactions
   - Loader hand-off (animation in js/loader.js)
   - Header, nav, scroll progress
   - Headline "decode" effect
   - Scroll reveals, counters, skill bars, process line
   - Neural-network hero canvas, data-field backgrounds
   - AI Lab 3D neural sphere (no external libraries)
   ========================================================= */
(function () {
  "use strict";
  document.documentElement.classList.add("js");

  var RM = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  document.addEventListener("DOMContentLoaded", function () {
    loader(function () { setTimeout(decode, 60); });
    nav();
    skillBars();
    architecture();
    reveals();
    counters();
    spotlight();
    filters();
    heroNet();
    $$(".page-hero, .profile").forEach(field);
    if (document.getElementById("aiCanvas")) initAI();
  });

  /* ---------------- Loader ----------------
     The animated loader lives in js/loader.js. It adds body.ready
     and fires "dd:loaded" when the page has finished loading. */
  function loader(cb) {
    if (window.DDLoader && !window.DDLoader.done) {
      document.addEventListener("dd:loaded", cb, { once: true });
      return;
    }
    document.body.classList.add("ready");
    cb();
  }

  /* ---------------- Header / nav ---------------- */
  function nav() {
    var header = $("header"), toggle = $(".nav-toggle"), links = $(".nav-links"), prog = $("#progress");
    if (toggle && links) {
      toggle.setAttribute("aria-label", "Toggle menu");
      toggle.setAttribute("aria-expanded", "false");
      toggle.addEventListener("click", function () {
        var open = links.classList.toggle("open");
        toggle.classList.toggle("open", open);
        toggle.setAttribute("aria-expanded", String(open));
      });
      $$("a", links).forEach(function (a) {
        a.addEventListener("click", function () { links.classList.remove("open"); toggle.classList.remove("open"); });
      });
    }
    var page = location.pathname.split("/").pop() || "index.html";
    $$(".nav-links a").forEach(function (a) {
      if ((a.getAttribute("href") || "") === page) a.classList.add("active");
    });
    var onScroll = function () {
      if (header) header.classList.toggle("scrolled", window.scrollY > 20);
      var h = document.documentElement.scrollHeight - innerHeight;
      if (prog) prog.style.transform = "scaleX(" + (h > 0 ? scrollY / h : 0) + ")";
    };
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------------- Headline decode ---------------- */
  function decode() {
    if (RM) return;
    var glyphs = "01<>/{}[]#_=+*$";
    $$(".hero h1, .page-hero h1").forEach(function (h) {
      h.setAttribute("aria-label", h.textContent.replace(/\s+/g, " ").trim());
      var nodes = [], w = document.createTreeWalker(h, NodeFilter.SHOW_TEXT), n, total = 0;
      while ((n = w.nextNode())) {
        if (n.nodeValue.trim()) { nodes.push({ n: n, f: n.nodeValue, o: total }); total += n.nodeValue.length; }
      }
      var dur = Math.min(1300, 380 + total * 18), start = performance.now(), last = 0;
      (function frame(now) {
        var p = (now - start) / dur, tick = now - last > 45;
        if (tick) last = now;
        nodes.forEach(function (o) {
          if (!tick && p < 1) return;
          var out = "";
          for (var i = 0; i < o.f.length; i++) {
            var c = o.f[i], at = (o.o + i) / total;
            out += (/\s/.test(c) || p >= at * 0.85 + 0.15 || p >= 1) ? c : glyphs[(Math.random() * glyphs.length) | 0];
          }
          o.n.nodeValue = out;
        });
        if (p < 1) requestAnimationFrame(frame);
      })(start);
    });
  }

  /* ---------------- Skill bars ---------------- */
  function skillBars() {
    $$(".skill-row").forEach(function (row) {
      var bar = $("i", row), label = $("b", row);
      if (!bar) return;
      var w = bar.style.width || "0%";
      bar.dataset.w = w;
      if (label && !$("em", label)) { var em = document.createElement("em"); em.textContent = w; label.appendChild(em); }
      bar.style.width = "0%";
    });
  }

  /* ---------------- Architecture flow (case study) ---------------- */
  function architecture() {
    $$(".architecture").forEach(function (a) {
      var raw = a.textContent.trim(), parts = raw.split("→").map(function (s) { return s.trim(); }).filter(Boolean);
      if (parts.length < 2) return;
      a.setAttribute("aria-label", raw);
      a.textContent = "";
      parts.forEach(function (p, i) {
        if (i) { var l = document.createElement("span"); l.className = "arch-link"; l.setAttribute("aria-hidden", "true"); a.appendChild(l); }
        var s = document.createElement("span"); s.className = "arch-node"; s.style.setProperty("--i", i); s.textContent = p; a.appendChild(s);
      });
    });
  }

  /* ---------------- Reveals ---------------- */
  function reveals() {
    var sel = ".reveal,.section-head,.section-heading,.glass,.process,.feature,.stats .row,.timeline-mini,.journey-points,.future-section,.contact-info>div,.architecture";
    var list = $$(sel).filter(function (e) { return !e.closest(".hero,.page-hero,header,#loader"); });
    list = list.filter(function (e) { return !list.some(function (p) { return p !== e && p.contains(e); }); });
    var bars = function (root) {
      $$(".skill-row i", root).forEach(function (b, i) {
        setTimeout(function () { b.style.width = b.dataset.w; }, 150 + i * 70);
      });
    };
    if (!("IntersectionObserver" in window) || RM) {
      list.forEach(function (e) { e.classList.add("in"); bars(e); });
      return;
    }
    list.forEach(function (e) { e.classList.add("rv"); });
    var io = new IntersectionObserver(function (entries) {
      var k = 0;
      entries.filter(function (x) { return x.isIntersecting; })
        .sort(function (a, b) { return a.target.compareDocumentPosition(b.target) & 4 ? -1 : 1; })
        .forEach(function (x) {
          var el = x.target;
          el.style.setProperty("--d", Math.min(k++, 6) * 0.08 + "s");
          el.classList.add("in");
          bars(el);
          io.unobserve(el);
        });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    list.forEach(function (e) { io.observe(e); });
  }

  /* ---------------- Counters ---------------- */
  function counters() {
    var els = $$("[data-count]");
    var run = function (e) {
      var n = +e.dataset.count, t0 = performance.now(), d = RM ? 1 : 1500;
      (function f(now) {
        var p = Math.min(1, (now - t0) / d), v = Math.round(n * (1 - Math.pow(1 - p, 3)));
        e.textContent = v;
        if (p < 1) requestAnimationFrame(f);
      })(t0);
    };
    if (!("IntersectionObserver" in window)) { els.forEach(run); return; }
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { run(x.target); io.unobserve(x.target); } });
    }, { threshold: 0.5 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---------------- Card spotlight ---------------- */
  function spotlight() {
    if (window.matchMedia && matchMedia("(hover: none)").matches) return;
    document.addEventListener("pointermove", function (e) {
      var c = e.target.closest && e.target.closest(".glass,.process-card,.feature,.stat");
      if (!c) return;
      var r = c.getBoundingClientRect();
      c.style.setProperty("--mx", e.clientX - r.left + "px");
      c.style.setProperty("--my", e.clientY - r.top + "px");
    }, { passive: true });
  }

  /* ---------------- Project filters ---------------- */
  function filters() {
    var btns = $$(".filters button");
    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        btns.forEach(function (x) { x.classList.remove("active"); });
        b.classList.add("active");
        var f = b.dataset.filter;
        $$(".project-wrap").forEach(function (w) {
          var show = f === "all" || (w.dataset.category || "").indexOf(f) > -1;
          w.style.display = show ? "" : "none";
          if (show) {
            w.classList.remove("pop"); void w.offsetWidth; w.classList.add("pop");
            var card = $(".rv", w); if (card) card.classList.add("in");
          }
        });
      });
    });
  }

  /* ---------------- Canvas helpers ---------------- */
  function makeCanvas(host, cls) {
    var cv = document.createElement("canvas");
    cv.className = cls;
    cv.setAttribute("aria-hidden", "true");
    host.insertBefore(cv, host.firstChild);
    return cv;
  }
  function loopWhenVisible(host, draw) {
    var visible = true, raf = 0, last = performance.now();
    var tick = function (now) {
      var dt = Math.min(50, now - last); last = now;
      draw(now, dt);
      raf = visible && !RM ? requestAnimationFrame(tick) : 0;
    };
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) {
        visible = en[0].isIntersecting;
        if (visible && !raf && !RM) { last = performance.now(); raf = requestAnimationFrame(tick); }
      }).observe(host);
    }
    raf = requestAnimationFrame(tick);
  }
  function sizeCanvas(cv, host, ctx) {
    var r = host.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.max(1, r.width * dpr); cv.height = Math.max(1, r.height * dpr);
    cv.style.width = r.width + "px"; cv.style.height = r.height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { w: r.width, h: r.height };
  }
  function onResize(host, fn) {
    if ("ResizeObserver" in window) new ResizeObserver(fn).observe(host);
    else addEventListener("resize", fn);
  }

  /* ---------------- Hero neural network ---------------- */
  function heroNet() {
    var ws = $(".workspace");
    if (!ws) return;
    var cv = makeCanvas(ws, "net-canvas"), ctx = cv.getContext("2d");
    var W = 0, H = 0, nodes = [], edges = [], out = [], pulses = [], seedT = 0;
    var mouse = { x: -999, y: -999 };
    var layers = [4, 6, 7, 6, 4];

    function build() {
      var s = sizeCanvas(cv, ws, ctx); W = s.w; H = s.h;
      nodes = []; edges = []; out = []; pulses = [];
      var px = W * 0.08, py = H * 0.1;
      layers.forEach(function (n, li) {
        var x = px + (W - 2 * px) * li / (layers.length - 1);
        for (var k = 0; k < n; k++) {
          var y = py + (H - 2 * py) * (k + 0.5) / n;
          nodes.push({ x: x, y: y, bx: x, by: y, l: li, ph: Math.random() * 6.283, g: 0 });
          out.push([]);
        }
      });
      nodes.forEach(function (a, ai) {
        var next = [];
        nodes.forEach(function (b, bi) { if (b.l === a.l + 1) next.push(bi); });
        next.forEach(function (bi) {
          if (Math.random() < 0.5) { edges.push({ a: ai, b: bi }); out[ai].push(edges.length - 1); }
        });
        if (next.length && !out[ai].length) { edges.push({ a: ai, b: next[(Math.random() * next.length) | 0] }); out[ai].push(edges.length - 1); }
      });
      draw(performance.now(), 16);
    }
    function spawn(nodeIndex) {
      var o = out[nodeIndex];
      if (!o || !o.length || pulses.length > 36) return;
      pulses.push({ e: o[(Math.random() * o.length) | 0], p: 0 });
    }
    function draw(now, dt) {
      ctx.clearRect(0, 0, W, H);
      nodes.forEach(function (n) {
        var ox = 0, oy = Math.sin(now * 0.0007 + n.ph) * 4;
        var dx = n.bx - mouse.x, dy = n.by - mouse.y, d = Math.sqrt(dx * dx + dy * dy);
        if (d < 110) { var f = (1 - d / 110) * 12; ox += dx / (d || 1) * f; oy += dy / (d || 1) * f; }
        n.x += (n.bx + ox - n.x) * 0.12; n.y += (n.by + oy - n.y) * 0.12;
        n.g *= 0.94;
      });
      ctx.lineWidth = 1;
      edges.forEach(function (e) {
        var a = nodes[e.a], b = nodes[e.b];
        var mx = (a.x + b.x) / 2 - mouse.x, my = (a.y + b.y) / 2 - mouse.y;
        var near = Math.max(0, 1 - Math.sqrt(mx * mx + my * my) / 160);
        ctx.strokeStyle = "rgba(127,166,255," + (0.07 + near * 0.18) + ")";
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      });
      if (!RM) {
        seedT += dt;
        if (seedT > 260) { seedT = 0; spawn(((Math.random() * layers[0]) | 0)); }
      }
      for (var i = pulses.length - 1; i >= 0; i--) {
        var pu = pulses[i], e = edges[pu.e], a = nodes[e.a], b = nodes[e.b];
        var len = Math.hypot(b.x - a.x, b.y - a.y);
        pu.p += dt * 0.22 / len;
        if (pu.p >= 1) {
          b.g = 1; pulses.splice(i, 1);
          if (Math.random() < 0.8) spawn(e.b);
          continue;
        }
        var x = a.x + (b.x - a.x) * pu.p, y = a.y + (b.y - a.y) * pu.p;
        var t = Math.max(0, pu.p - 0.18), tx = a.x + (b.x - a.x) * t, ty = a.y + (b.y - a.y) * t;
        var g = ctx.createLinearGradient(tx, ty, x, y);
        g.addColorStop(0, "rgba(94,220,198,0)"); g.addColorStop(1, "rgba(94,220,198,.85)");
        ctx.strokeStyle = g; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(x, y); ctx.stroke();
        ctx.fillStyle = "#BFF5EA"; ctx.beginPath(); ctx.arc(x, y, 1.8, 0, 6.283); ctx.fill();
      }
      nodes.forEach(function (n) {
        if (n.g > 0.05) {
          ctx.fillStyle = "rgba(94,220,198," + n.g * 0.25 + ")";
          ctx.beginPath(); ctx.arc(n.x, n.y, 4 + n.g * 8, 0, 6.283); ctx.fill();
        }
        ctx.fillStyle = "rgba(10,17,32,1)";
        ctx.beginPath(); ctx.arc(n.x, n.y, 3.6, 0, 6.283); ctx.fill();
        ctx.strokeStyle = n.g > 0.2 ? "rgba(94,220,198," + (0.5 + n.g * 0.5) + ")" : "rgba(127,166,255,.55)";
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(n.x, n.y, 3.6, 0, 6.283); ctx.stroke();
      });
    }
    ws.addEventListener("pointermove", function (e) { var r = ws.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
    ws.addEventListener("pointerleave", function () { mouse.x = mouse.y = -999; });
    build();
    onResize(ws, build);
    loopWhenVisible(ws, draw);
  }

  /* ---------------- Data field (page heroes, profile) ---------------- */
  function field(host) {
    var cv = makeCanvas(host, "field-canvas"), ctx = cv.getContext("2d");
    if (host.classList.contains("profile")) { cv.style.webkitMaskImage = cv.style.maskImage = "radial-gradient(circle at 50% 50%,#000 30%,transparent 75%)"; }
    var W = 0, H = 0, pts = [];
    function build() {
      var s = sizeCanvas(cv, host, ctx); W = s.w; H = s.h;
      var n = Math.max(18, Math.min(70, Math.round(W * H / 16000)));
      pts = [];
      for (var i = 0; i < n; i++) pts.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.18, vy: (Math.random() - 0.5) * 0.18, lit: Math.random() < 0.12 });
      draw(0, 16);
    }
    function draw(now, dt) {
      ctx.clearRect(0, 0, W, H);
      var k = dt / 16;
      pts.forEach(function (p) {
        p.x += p.vx * k; p.y += p.vy * k;
        if (p.x < -10) p.x = W + 10; if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10; if (p.y > H + 10) p.y = -10;
      });
      var R = 130;
      for (var i = 0; i < pts.length; i++) {
        for (var j = i + 1; j < pts.length; j++) {
          var dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y, d2 = dx * dx + dy * dy;
          if (d2 < R * R) {
            var a = (1 - Math.sqrt(d2) / R) * 0.22;
            ctx.strokeStyle = "rgba(127,166,255," + a + ")"; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke();
          }
        }
      }
      pts.forEach(function (p) {
        var tw = p.lit ? 0.55 + Math.sin(now * 0.002 + p.x) * 0.35 : 0.5;
        ctx.fillStyle = p.lit ? "rgba(94,220,198," + tw + ")" : "rgba(127,166,255,.5)";
        ctx.beginPath(); ctx.arc(p.x, p.y, p.lit ? 2 : 1.4, 0, 6.283); ctx.fill();
      });
    }
    build();
    onResize(host, build);
    loopWhenVisible(host, draw);
  }

  /* ---------------- AI Lab: 3D neural sphere ---------------- */
  function initAI() {
    var cv = document.getElementById("aiCanvas"), host = cv.parentElement, ctx = cv.getContext("2d");
    var W = 0, H = 0, N = 170, pts = [], edges = [], pulses = [], rotY = 0, tiltX = 0.35, tx = 0.35, ty = 0, seed = 0;
    var gold = Math.PI * (3 - Math.sqrt(5));
    for (var i = 0; i < N; i++) {
      var y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = gold * i;
      pts.push({ x: Math.cos(th) * r, y: y, z: Math.sin(th) * r });
    }
    var seen = {};
    pts.forEach(function (p, a) {
      var d = pts.map(function (q, b) { return { b: b, d: (p.x - q.x) * (p.x - q.x) + (p.y - q.y) * (p.y - q.y) + (p.z - q.z) * (p.z - q.z) }; })
        .sort(function (m, n) { return m.d - n.d; }).slice(1, 4);
      d.forEach(function (o) { var key = Math.min(a, o.b) + "-" + Math.max(a, o.b); if (!seen[key]) { seen[key] = 1; edges.push([a, o.b]); } });
    });
    function build() { var s = sizeCanvas(cv, host, ctx); W = s.w; H = s.h; }
    function draw(now, dt) {
      ctx.clearRect(0, 0, W, H);
      rotY += dt * 0.00016; tiltX += (tx - tiltX) * 0.04;
      var R = Math.min(W, H) * 0.38, cx = W / 2 + ty * 30, cy = H / 2, f = 3.2;
      var sy = Math.sin(rotY), cyR = Math.cos(rotY), sx = Math.sin(tiltX), cxR = Math.cos(tiltX);
      var proj = pts.map(function (p) {
        var x = p.x * cyR - p.z * sy, z = p.x * sy + p.z * cyR;
        var y = p.y * cxR - z * sx; z = p.y * sx + z * cxR;
        var s = f / (f + z);
        return { x: cx + x * R * s, y: cy + y * R * s, z: z, s: s };
      });
      ctx.lineWidth = 1;
      edges.forEach(function (e) {
        var a = proj[e[0]], b = proj[e[1]], depth = (2 - (a.z + b.z)) / 4;
        ctx.strokeStyle = "rgba(127,166,255," + (0.04 + depth * 0.22) + ")";
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      });
      seed += dt;
      if (seed > 140 && pulses.length < 26) { seed = 0; pulses.push({ e: (Math.random() * edges.length) | 0, p: 0, hops: 4 }); }
      for (var i = pulses.length - 1; i >= 0; i--) {
        var pu = pulses[i]; pu.p += dt * 0.0022;
        var e = edges[pu.e], a = proj[e[0]], b = proj[e[1]];
        if (pu.p >= 1) {
          if (--pu.hops > 0) {
            var nextEdges = []; edges.forEach(function (x, xi) { if (x[0] === e[1] || x[1] === e[1]) nextEdges.push(xi); });
            var ne = nextEdges[(Math.random() * nextEdges.length) | 0];
            if (edges[ne][1] === e[1]) edges[ne] = [edges[ne][1], edges[ne][0]];
            pu.e = ne; pu.p = 0;
          } else { pulses.splice(i, 1); }
          continue;
        }
        var x = a.x + (b.x - a.x) * pu.p, yy = a.y + (b.y - a.y) * pu.p, depth = (2 - (a.z + b.z)) / 4;
        ctx.fillStyle = "rgba(94,220,198," + (0.3 + depth * 0.7) + ")";
        ctx.beginPath(); ctx.arc(x, yy, 1.4 + depth * 1.6, 0, 6.283); ctx.fill();
      }
      proj.forEach(function (p) {
        var depth = (1 - p.z) / 2;
        ctx.fillStyle = "rgba(200,216,255," + (0.15 + depth * 0.75) + ")";
        ctx.beginPath(); ctx.arc(p.x, p.y, 0.8 + depth * 1.8, 0, 6.283); ctx.fill();
      });
    }
    host.addEventListener("pointermove", function (e) {
      var r = host.getBoundingClientRect();
      tx = 0.35 + ((e.clientY - r.top) / r.height - 0.5) * 0.6;
      ty = ((e.clientX - r.left) / r.width - 0.5);
    });
    build();
    onResize(host, build);
    loopWhenVisible(host, draw);
  }
  window.initAI = initAI;
})();

/* Contact form (demo) — connect to your backend/API */
function submitDemo(e) {
  e.preventDefault();
  var form = e.target, msg = form.querySelector(".form-status");
  if (!msg) { msg = document.createElement("p"); msg.className = "form-status"; msg.setAttribute("role", "status"); form.appendChild(msg); }
  msg.textContent = "Demo form submitted. Connect this form to your backend/API.";
  form.reset();
  return false;
}
