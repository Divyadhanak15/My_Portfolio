/* =========================================================
   DIVYA DHANAK — "Neural Build" page loader
   - Scattered nodes fly in and wire themselves into the "DD"
     monogram; signals travel along the letter strokes.
   - Progress is real: DOM ready, fonts, images, window load.
   - Pipeline stages mirror the site's approach section.
   - Full sequence on first visit, short one on later pages.
   - On finish: network flashes, bursts, curtain lifts, then
     fires "dd:loaded" (main.js starts hero animations on it).
   Load this file WITHOUT defer, directly after #loader.
   ========================================================= */
(function () {
  "use strict";

  var L = document.getElementById("loader");
  if (!L) return;

  var root = document.documentElement;
  root.classList.add("dd-loading");

  var RM = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  var seen = false;
  try { seen = sessionStorage.getItem("dd-loaded") === "1"; sessionStorage.setItem("dd-loaded", "1"); } catch (e) {}

 var MIN = RM ? 250 : (seen ? 1800 : 3200); // minimum time on screen (ms)
  var MAX = 12000;                          // failsafe: never block longer than this
  var EXIT = 900;                           // flash + burst duration (ms)

  var API = window.DDLoader = { done: false };

  var cv = L.querySelector(".ld-net");
  var ctx = cv && cv.getContext ? cv.getContext("2d") : null;
  var pctEl = L.querySelector("[data-pct]");
  var pipe = L.querySelector(".ld-pipe");
  var steps = L.querySelectorAll(".ld-pipe li");

  /* ---------------- Real load signals ---------------- */
  var sig = {
    dom: document.readyState !== "loading",
    fonts: !(document.fonts && document.fonts.ready),
    load: document.readyState === "complete"
  };
  var img = { t: 0, d: 0 };

  function trackImages() {
    var list = Array.prototype.slice.call(document.images);
    img.t = list.length;
    list.forEach(function (im) {
      if (im.complete) { img.d++; return; }
      var f = function () { img.d++; };
      im.addEventListener("load", f, { once: true });
      im.addEventListener("error", f, { once: true });
    });
  }

  if (sig.dom) trackImages();
  else document.addEventListener("DOMContentLoaded", function () { sig.dom = true; trackImages(); });
  if (!sig.fonts) document.fonts.ready.then(function () { sig.fonts = true; }, function () { sig.fonts = true; });
  window.addEventListener("load", function () { sig.load = true; });

  function target() {
    var v = 0.08;
    if (sig.dom) v += 0.3;
    if (sig.fonts) v += 0.17;
    v += 0.25 * (img.t ? img.d / img.t : (sig.dom ? 1 : 0));
    if (sig.load) v = 1;
    return Math.min(v, 1);
  }

  /* ---------------- Neural monogram ---------------- */
  var W, H, cx, cy, lim = 20, built = false;
  var nodes = [], edges = [], adj = [], amb = [], pulses = [], lastPulse = 0;
  var A = "127,166,255", S = "94,220,198", I = "231,236,245";

  function ease(x) { return 1 - Math.pow(1 - x, 3); }
  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }

  // Render "DD" off-screen and sample points from it (edges favoured)
  function sample() {
    var ow = 560, oh = 260, g = 10;
    var oc = document.createElement("canvas");
    oc.width = ow; oc.height = oh;
    var o = oc.getContext("2d");
    o.fillStyle = "#fff"; o.textAlign = "center"; o.textBaseline = "middle";
    o.font = "700 210px Geist, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Arial, sans-serif";
    o.fillText("DD", ow / 2, oh / 2 + 8);
    var data = o.getImageData(0, 0, ow, oh).data;
    var on = function (x, y) { return x >= 0 && y >= 0 && x < ow && y < oh && data[(y * ow + x) * 4 + 3] > 128; };
    var pts = [], minX = ow, maxX = 0, minY = oh, maxY = 0;
    for (var y = 0; y < oh; y += g) {
      for (var x = 0; x < ow; x += g) {
        if (!on(x, y)) continue;
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
        var edge = !on(x + g, y) || !on(x - g, y) || !on(x, y + g) || !on(x, y - g);
        if (edge || Math.random() < 0.4) {
          pts.push({ x: x + (Math.random() - 0.5) * 3, y: y + (Math.random() - 0.5) * 3, e: edge });
        }
      }
    }
    return { pts: pts, g: g, bx: (minX + maxX) / 2, by: (minY + maxY) / 2, bw: Math.max(1, maxX - minX), bh: maxY - minY };
  }

  function build() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var s = sample();
    var k = Math.min(W * 0.66, 400) / s.bw;
    var bh = s.bh * k;
    cx = W / 2;
    cy = Math.max(bh / 2 + 40, H * 0.4);
    L.style.setProperty("--hud-y", Math.round(cy + bh / 2 + Math.max(30, H * 0.05)) + "px");

    var R = Math.sqrt(W * W + H * H) * 0.55;
    nodes = s.pts.map(function (p) {
      var a = Math.random() * Math.PI * 2, d = R * (0.45 + Math.random() * 0.55);
      return {
        tx: cx + (p.x - s.bx) * k, ty: cy + (p.y - s.by) * k,
        sx: cx + Math.cos(a) * d, sy: cy + Math.sin(a) * d,
        d: Math.random() * 0.5 + (p.e ? 0 : 0.1),
        r: p.e ? 1.5 + Math.random() * 0.9 : 0.9 + Math.random() * 0.7,
        ph: Math.random() * 6.283, x: 0, y: 0, e: 0
      };
    });

    // Wire each node to its nearest neighbours
    lim = s.g * k * 1.75;
    var lim2 = lim * lim, used = {};
    edges = []; adj = nodes.map(function () { return []; });
    nodes.forEach(function (n, i) {
      var near = [];
      for (var j = 0; j < nodes.length; j++) {
        if (j === i) continue;
        var dx = nodes[j].tx - n.tx, dy = nodes[j].ty - n.ty, dd = dx * dx + dy * dy;
        if (dd < lim2) near.push([dd, j]);
      }
      near.sort(function (a, b) { return a[0] - b[0]; });
      near.slice(0, 3).forEach(function (q) {
        var a = Math.min(i, q[1]), b = Math.max(i, q[1]), key = a + "_" + b;
        if (used[key]) return;
        used[key] = 1; edges.push([a, b]); adj[a].push(b); adj[b].push(a);
      });
    });

    // Ambient drifting particles
    amb = [];
    var count = Math.round(Math.min(46, (W * H) / 26000));
    for (var m = 0; m < count; m++) {
      amb.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.18, vy: (Math.random() - 0.5) * 0.18, r: Math.random() * 1.2 + 0.4 });
    }
    pulses = [];
    built = true;
  }

  function draw(p, t, ex) {
    var flash = ex ? (ex < 0.3 ? ex / 0.3 : 1 - (ex - 0.3) / 0.7) : 0;
    var burst = ex > 0.3 ? ease((ex - 0.3) / 0.7) : 0;
    var fade = 1 - burst;
    var i, n;

    ctx.clearRect(0, 0, W, H);

    // Ambient field
    for (i = 0; i < amb.length; i++) {
      var q = amb[i];
      q.x += q.vx; q.y += q.vy;
      if (q.x < 0) q.x += W; if (q.x > W) q.x -= W;
      if (q.y < 0) q.y += H; if (q.y > H) q.y -= H;
    }
    ctx.lineWidth = 0.6;
    for (i = 0; i < amb.length; i++) {
      for (var j = i + 1; j < amb.length; j++) {
        var dx = amb[i].x - amb[j].x, dy = amb[i].y - amb[j].y, d = Math.sqrt(dx * dx + dy * dy);
        if (d < 120) {
          ctx.strokeStyle = "rgba(" + A + "," + (1 - d / 120) * 0.08 * fade + ")";
          ctx.beginPath(); ctx.moveTo(amb[i].x, amb[i].y); ctx.lineTo(amb[j].x, amb[j].y); ctx.stroke();
        }
      }
      ctx.fillStyle = "rgba(" + A + "," + 0.25 * fade + ")";
      ctx.beginPath(); ctx.arc(amb[i].x, amb[i].y, amb[i].r, 0, 6.283); ctx.fill();
    }

    // Node positions: scattered → monogram (→ burst outward on exit)
    for (i = 0; i < nodes.length; i++) {
      n = nodes[i];
      var e = ease(clamp((p * 1.3 - n.d) / 0.6)), wob = (1 - e) * 8;
      n.x = n.sx + (n.tx - n.sx) * e + Math.sin(t * 0.0011 + n.ph) * wob;
      n.y = n.sy + (n.ty - n.sy) * e + Math.cos(t * 0.0013 + n.ph) * wob;
      if (burst) {
        n.x += (n.tx - cx) * burst * 1.1 + Math.cos(n.ph) * burst * 60;
        n.y += (n.ty - cy) * burst * 1.1 + Math.sin(n.ph) * burst * 60;
      }
      n.e = e;
    }

    // Connections grow from one node toward the other
    ctx.lineWidth = 0.8;
    for (i = 0; i < edges.length; i++) {
      var a = nodes[edges[i][0]], b = nodes[edges[i][1]], s = Math.min(a.e, b.e);
      if (s < 0.05) continue;
      var f = clamp((s - 0.05) / 0.6);
      var ldx = b.x - a.x, ldy = b.y - a.y, len = Math.sqrt(ldx * ldx + ldy * ldy);
      var near = clamp(1 - (len - lim * 1.5) / (lim * 6)); // long in-flight wires stay faint
      if (near <= 0) continue;
      var col = flash > 0.05 ? S : A;
      ctx.strokeStyle = "rgba(" + col + "," + (0.1 + 0.3 * s + 0.4 * flash) * fade * near + ")";
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(a.x + (b.x - a.x) * f, a.y + (b.y - a.y) * f); ctx.stroke();
    }

    // Nodes
    for (i = 0; i < nodes.length; i++) {
      n = nodes[i];
      var twinkle = n.e > 0.99 && Math.sin(t * 0.003 + n.ph * 7) > 0.97;
      ctx.fillStyle = twinkle || flash > 0.5
        ? "rgba(" + I + "," + 0.95 * fade + ")"
        : "rgba(" + A + "," + (0.35 + 0.65 * n.e) * fade + ")";
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r * (1 + flash * 0.6), 0, 6.283); ctx.fill();
    }

    // Signals hopping along the strokes
    if (!ex && p > 0.25 && t - lastPulse > 70 && pulses.length < 22 && edges.length) {
      var ed = edges[(Math.random() * edges.length) | 0];
      if (nodes[ed[0]].e > 0.95 && nodes[ed[1]].e > 0.95) {
        var rev = Math.random() < 0.5;
        pulses.push({ from: rev ? ed[1] : ed[0], to: rev ? ed[0] : ed[1], s: t, dur: 90 + Math.random() * 60, hops: 4 + ((Math.random() * 6) | 0) });
        lastPulse = t;
      }
    }
    for (i = pulses.length - 1; i >= 0; i--) {
      var pl = pulses[i], k = (t - pl.s) / pl.dur;
      if (k >= 1) {
        var opts = adj[pl.to].filter(function (x) { return x !== pl.from; });
        if (pl.hops > 0 && opts.length && !ex) {
          pl.from = pl.to; pl.to = opts[(Math.random() * opts.length) | 0];
          pl.s = t; pl.hops--; k = 0;
        } else { pulses.splice(i, 1); continue; }
      }
      var P = nodes[pl.from], Q = nodes[pl.to];
      var x = P.x + (Q.x - P.x) * k, y = P.y + (Q.y - P.y) * k;
      ctx.fillStyle = "rgba(" + S + ",.16)";
      ctx.beginPath(); ctx.arc(x, y, 6, 0, 6.283); ctx.fill();
      ctx.fillStyle = "rgba(" + S + ",.95)";
      ctx.beginPath(); ctx.arc(x, y, 1.8, 0, 6.283); ctx.fill();
    }
  }

  /* ---------------- HUD ---------------- */
  var lastStage = -1;
  function hud(p, all) {
    if (pctEl) pctEl.textContent = ("00" + Math.round(p * 100)).slice(-3) + "%";
    if (pipe) pipe.style.setProperty("--p", p.toFixed(4));
    var st = all ? steps.length : Math.min(steps.length - 1, Math.floor(p * steps.length));
    if (st === lastStage) return;
    lastStage = st;
    for (var i = 0; i < steps.length; i++) {
      steps[i].classList.toggle("is-done", i < st);
      steps[i].classList.toggle("is-active", i === st);
    }
  }

  /* ---------------- Main loop ---------------- */
  var start = performance.now(), shown = 0, exitAt = 0, finished = false;

  function frame(now) {
    var el = now - start;
    if (!exitAt) {
      var tg = el > MAX ? 1 : target();
      if (tg < 1) tg = Math.max(tg, tg + (0.9 - tg) * (1 - Math.exp(-el / 4500)) * 0.6); // gentle creep
      var goal = Math.min(tg, el / MIN);
      shown += (goal - shown) * (RM ? 1 : 0.075);
      if (goal >= 1 && shown > 0.994) { shown = 1; exitAt = now; leave(); }
      hud(shown, exitAt > 0);
    }
    if (built && !RM) draw(shown, now, exitAt ? Math.min(1, (now - exitAt) / EXIT) : 0);
    if (!finished) requestAnimationFrame(frame);
  }

  function leave() {
    L.classList.add("is-leaving");
    setTimeout(function () {
      L.classList.add("is-done");
      root.classList.remove("dd-loading");
      document.body.classList.add("ready");
      API.done = true;
      var ev;
      try { ev = new CustomEvent("dd:loaded"); } catch (e) { ev = document.createEvent("Event"); ev.initEvent("dd:loaded", false, false); }
      document.dispatchEvent(ev);
      setTimeout(function () {
        finished = true;
        if (L.parentNode) L.parentNode.removeChild(L);
      }, 950);
    }, RM ? 0 : 320);
  }

  /* ---------------- Boot ---------------- */
  function init() {
    if (!ctx || finished) return;
    build();
    if (RM) draw(1, 0, 0);
  }
  var fontWait = (document.fonts && document.fonts.load)
    ? Promise.race([document.fonts.load("700 200px Geist"), new Promise(function (r) { setTimeout(r, 350); })])
    : Promise.resolve();
  fontWait.then(init, init);

  var rz;
  window.addEventListener("resize", function () {
    clearTimeout(rz);
    rz = setTimeout(function () { if (!finished && !exitAt) init(); }, 150);
  });

  requestAnimationFrame(frame);
})();
