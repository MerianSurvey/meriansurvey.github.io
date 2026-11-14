/* Interactive figure on the home page.
   Top: the two Merian filters (measured curves from data/filters.js) and a schematic
   emission-line spectrum at the chosen redshift.
   Bottom: the redshift ranges in which each strong line falls inside the half-maximum
   width of N540 or N708. The slider is uniform in log(1 + z) from z = 0 to 5.
   The figure is drawn at the real pixel width of the page and redrawn on resize. */
(function () {
  var host = document.getElementById("filter-figure");
  var F = window.MERIAN_FILTERS;
  if (!host || !F) return;

  var X0 = 470, X1 = 760;                       // plotted observed wavelength range (nm)
  var ZMAX = 5, LMAX = Math.log(1 + ZMAX);
  var CONT = 0.07, PEAK = 0.62, SIGMA = 0.7;    // schematic continuum, line height, line width (nm)

  // Rest-frame wavelengths in nm. s = relative strength, illustrative only.
  // key: shown in the redshift-window chart and in the status chips.
  var LINES = [
    { wl: 121.567, s: 1.00, label: "Lyα", key: true },
    { wl: 154.9, s: 0.12, label: "C IV", key: true },
    { wl: 164.0, s: 0.06, label: "" },
    { wl: 190.9, s: 0.14, label: "C III]", key: true },
    { wl: 279.8, s: 0.14, label: "Mg II", key: true },
    { wl: 372.7, s: 0.60, label: "[O II]", key: true },
    { wl: 386.9, s: 0.10, label: "" },
    { wl: 434.05, s: 0.13, label: "" },
    { wl: 486.13, s: 0.28, label: "Hβ", key: true },
    { wl: 495.89, s: 0.27, label: "" },
    { wl: 500.68, s: 0.80, label: "[O III]", key: true },
    { wl: 654.80, s: 0.04, label: "" },
    { wl: 656.28, s: 1.00, label: "Hα", key: true },
    { wl: 658.35, s: 0.10, label: "" },
    { wl: 671.64, s: 0.11, label: "" },
    { wl: 673.08, s: 0.08, label: "" }
  ];
  var FILTERS = [["N540", "540"], ["N708", "708"]];

  // Chart rows, longest rest wavelength first, so the windows step to higher z going down.
  var KEY = LINES.filter(function (L) { return L.key; }).sort(function (a, b) { return b.wl - a.wl; });
  KEY.forEach(function (L) {
    L.win = [];
    FILTERS.forEach(function (f) {
      var d = F[f[0]];
      var lo = d.half_lo / L.wl - 1, hi = d.half_hi / L.wl - 1;
      if (hi > 0 && lo < ZMAX) L.win.push({ f: f[1], lo: Math.max(lo, 0), hi: Math.min(hi, ZMAX) });
    });
  });

  var PRESETS = [
    { z: 0.080, label: "Hα + [O III] · z ≈ 0.08" },
    { z: 0.430, label: "[O III] + [O II] · z ≈ 0.43" },
    { z: 0.910, label: "[O II] · z ≈ 0.9" },
    { z: 3.440, label: "Lyα · z ≈ 3.4" },
    { z: 4.840, label: "Lyα · z ≈ 4.8" }
  ];

  var z = 0.08, W = 0, spec = {}, zw = {};

  function f1(v) { return (Math.round(v * 10) / 10).toString(); }
  function fmtZ(v) { return v < 1 ? v.toFixed(3) : v.toFixed(2); }
  function inFilter(wlObs, name) { var d = F[name]; return wlObs >= d.half_lo && wlObs <= d.half_hi; }

  // Flat continuum, dimmed below Ly-alpha and nearly gone below the Lyman limit (schematic).
  function cont(wlRest) {
    var c = CONT;
    c *= 0.3 + 0.7 / (1 + Math.exp(-(wlRest - 121.567) / 0.3));
    c *= 0.05 + 0.95 / (1 + Math.exp(-(wlRest - 91.2) / 0.3));
    return c;
  }

  host.classList.add("ff");
  host.innerHTML =
    '<div class="ff-spec"></div>' +
    '<div class="ff-controls">' +
    '<label for="ff-z">Redshift</label>' +
    '<input id="ff-z" type="range" min="0" max="' + LMAX.toFixed(4) + '" step="0.0005" aria-describedby="ff-status">' +
    '<output id="ff-out" for="ff-z"></output></div>' +
    '<div class="ff-presets" role="group" aria-label="Jump to a redshift window">' +
    PRESETS.map(function (p, i) {
      return '<button type="button" data-p="' + i + '" aria-pressed="false">' + p.label + "</button>";
    }).join("") + "</div>" +
    '<div class="ff-status" id="ff-status" aria-live="polite">' +
    '<span class="chip" data-f="540"></span><span class="chip" data-f="708"></span></div>' +
    '<div class="ff-zw-head"><p>Redshift windows of strong emission lines</p>' +
    '<span class="ff-key"><span><i class="k540"></i>N540</span><span><i class="k708"></i>N708</span></span></div>' +
    '<div class="ff-zw"></div>';

  var specBox = host.querySelector(".ff-spec");
  var zwBox = host.querySelector(".ff-zw");
  var slider = host.querySelector("#ff-z");
  var out = host.querySelector("#ff-out");
  var chips = {};
  [].forEach.call(host.querySelectorAll(".chip"), function (c) { chips[c.getAttribute("data-f")] = c; });
  var buttons = [].slice.call(host.querySelectorAll(".ff-presets button"));

  function buildSpec() {
    var narrow = W < 560;
    var H = Math.round(Math.max(230, Math.min(360, W * 0.42)));
    var m = { l: narrow ? 40 : 50, r: 10, t: 62, b: 46 };
    function X(wl) { return m.l + (wl - X0) / (X1 - X0) * (W - m.l - m.r); }
    function Y(t) { return H - m.b - t * (H - m.t - m.b); }
    spec = { H: H, m: m, X: X, Y: Y };

    var s = '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + " " + H + '" role="img" ' +
      'aria-label="Transmission of the Merian N540 and N708 filters with a redshifted emission-line spectrum">';
    [0.5, 1].forEach(function (t) {
      s += '<line class="grid" x1="' + m.l + '" x2="' + (W - m.r) + '" y1="' + f1(Y(t)) + '" y2="' + f1(Y(t)) + '"/>' +
        '<text x="' + (m.l - 8) + '" y="' + f1(Y(t) + 4) + '" text-anchor="end">' + (t * 100) + "%</text>";
    });
    s += '<line class="axis" x1="' + m.l + '" x2="' + (W - m.r) + '" y1="' + f1(Y(0)) + '" y2="' + f1(Y(0)) + '"/>';
    for (var wl = 500; wl <= 750; wl += 50) {
      s += '<line class="axis" x1="' + f1(X(wl)) + '" x2="' + f1(X(wl)) + '" y1="' + f1(Y(0)) + '" y2="' + f1(Y(0) + 5) + '"/>' +
        '<text x="' + f1(X(wl)) + '" y="' + f1(Y(0) + 20) + '" text-anchor="middle">' + wl + "</text>";
    }
    s += '<text x="' + f1((m.l + W - m.r) / 2) + '" y="' + (H - 4) + '" text-anchor="middle">Observed wavelength (nm)</text>';

    // Approximate extent of the HSC broad bands inside the plotted range.
    [["g", 470, 545], ["r", 549, 691], ["i", 695, 760]].forEach(function (b) {
      var y = 14, a = X(b[1]), c = X(b[2]);
      s += '<line class="hsc" x1="' + f1(a) + '" x2="' + f1(c) + '" y1="' + y + '" y2="' + y + '"/>' +
        '<line class="hsc" x1="' + f1(a) + '" x2="' + f1(a) + '" y1="' + (y - 4) + '" y2="' + (y + 4) + '"/>' +
        '<line class="hsc" x1="' + f1(c) + '" x2="' + f1(c) + '" y1="' + (y - 4) + '" y2="' + (y + 4) + '"/>' +
        '<text class="hsc-label" x="' + f1((a + c) / 2) + '" y="' + (y + 18) + '" text-anchor="middle">HSC ' + b[0] + "</text>";
    });

    FILTERS.forEach(function (f) {
      var d = F[f[0]];
      var p = "M" + f1(X(d.wl[0])) + "," + f1(Y(0));
      for (var i = 0; i < d.wl.length; i++) p += "L" + f1(X(d.wl[i])) + "," + f1(Y(d.T[i]));
      p += "L" + f1(X(d.wl[d.wl.length - 1])) + "," + f1(Y(0)) + "Z";
      s += '<path class="n' + f[1] + '" d="' + p + '"/>' +
        '<text class="t' + f[1] + '" x="' + f1(X((d.half_lo + d.half_hi) / 2)) + '" y="' + f1(Y(1) - 10) + '" text-anchor="middle">' + f[0] + "</text>";
    });

    s += '<path class="spec" d=""/>';
    LINES.forEach(function (L, i) {
      if (L.label) s += '<text class="line-label" data-i="' + i + '" text-anchor="middle"></text>';
    });
    specBox.innerHTML = s + "</svg>";
    spec.path = specBox.querySelector("path.spec");
    spec.labels = [].slice.call(specBox.querySelectorAll("text.line-label"));
  }

  function buildZW() {
    var narrow = W < 560;
    var rowH = narrow ? 22 : 24;
    var m = { l: narrow ? 58 : 70, r: 14, t: 24, b: 40 };
    var H = m.t + KEY.length * rowH + m.b;
    var yAx = m.t + KEY.length * rowH + 6;
    function XZ(v) { return m.l + Math.log(1 + v) / LMAX * (W - m.l - m.r); }
    zw = { m: m, XZ: XZ };

    var s = '<svg class="zw-svg" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + " " + H + '" role="img" ' +
      'aria-label="Redshift ranges in which each emission line falls in N540 or N708">';
    KEY.forEach(function (L, r) {
      var yc = m.t + (r + 0.5) * rowH;
      s += '<line class="zw-track" x1="' + m.l + '" x2="' + (W - m.r) + '" y1="' + f1(yc) + '" y2="' + f1(yc) + '"/>' +
        '<text class="zw-label" data-r="' + r + '" x="' + (m.l - 8) + '" y="' + f1(yc + 4) + '" text-anchor="end">' + L.label + "</text>";
      L.win.forEach(function (w) {
        var a = XZ(w.lo), b = XZ(w.hi), bw = Math.max(3, b - a);
        s += '<rect class="zw' + w.f + '" x="' + f1((a + b - bw) / 2) + '" y="' + f1(yc - rowH * 0.28) + '" width="' + f1(bw) +
          '" height="' + f1(rowH * 0.56) + '" rx="2" data-z="' + ((w.lo + w.hi) / 2).toFixed(4) + '"><title>' + L.label +
          " in N" + w.f + ", z = " + fmtZ(w.lo) + "–" + fmtZ(w.hi) + "</title></rect>";
      });
    });
    s += '<line class="axis" x1="' + m.l + '" x2="' + (W - m.r) + '" y1="' + yAx + '" y2="' + yAx + '"/>';
    var last = -1e9;
    [0, 0.1, 0.2, 0.5, 1, 2, 3, 4, 5].forEach(function (t) {
      var x = XZ(t), lab = String(t), w = lab.length * 7.5;
      if (x - w / 2 < last + 6) return;
      last = x + w / 2;
      s += '<line class="axis" x1="' + f1(x) + '" x2="' + f1(x) + '" y1="' + yAx + '" y2="' + (yAx + 5) + '"/>' +
        '<text x="' + f1(x) + '" y="' + (yAx + 19) + '" text-anchor="middle">' + lab + "</text>";
    });
    s += '<text x="' + f1((m.l + W - m.r) / 2) + '" y="' + (H - 3) + '" text-anchor="middle">Redshift z</text>';
    s += '<line class="zcursor" y1="' + (m.t - 4) + '" y2="' + yAx + '"/>' +
      '<text class="zcursor-label" y="' + (m.t - 9) + '" text-anchor="middle"></text>';
    zwBox.innerHTML = s + "</svg>";
    zw.cursor = zwBox.querySelector(".zcursor");
    zw.clabel = zwBox.querySelector(".zcursor-label");
    zw.labels = [].slice.call(zwBox.querySelectorAll(".zw-label"));
  }

  function updateSpec() {
    var X = spec.X, Y = spec.Y, opz = 1 + z;
    var n = Math.max(300, Math.round((W - spec.m.l - spec.m.r) * 2));
    var step = (X1 - X0) / n, d = "";
    for (var k = 0; k <= n; k++) {
      var wl = X0 + k * step, v = cont(wl / opz);
      for (var j = 0; j < LINES.length; j++) {
        var q = (wl - LINES[j].wl * opz) / SIGMA;
        if (q > -5 && q < 5) v += PEAK * LINES[j].s * Math.exp(-0.5 * q * q);
      }
      d += (k ? "L" : "M") + f1(X(wl)) + "," + f1(Y(v));
    }
    spec.path.setAttribute("d", d);

    // Label the strongest lines first and skip any label that would overlap one already placed.
    var placed = [];
    spec.labels.map(function (t) { return { t: t, L: LINES[+t.getAttribute("data-i")] }; })
      .sort(function (a, b) { return b.L.s - a.L.s; })
      .forEach(function (o) {
        var wlObs = o.L.wl * opz, x = X(wlObs), y = Y(cont(o.L.wl) + PEAK * o.L.s) - 9;
        var w = o.L.label.length * 8 + 6;
        var show = wlObs > X0 + 3 && wlObs < X1 - 3 && placed.every(function (p) {
          return Math.abs(p.x - x) > (p.w + w) / 2 || Math.abs(p.y - y) > 16;
        });
        if (show) placed.push({ x: x, y: y, w: w });
        o.t.textContent = show ? o.L.label : "";
        o.t.setAttribute("x", f1(x));
        o.t.setAttribute("y", f1(y));
        var inside = inFilter(wlObs, "N540") || inFilter(wlObs, "N708");
        o.t.setAttribute("class", "line-label" + (inside ? " in" : ""));
      });
  }

  function updateZW() {
    var x = zw.XZ(z);
    zw.cursor.setAttribute("x1", f1(x));
    zw.cursor.setAttribute("x2", f1(x));
    zw.clabel.setAttribute("x", f1(Math.min(Math.max(x, zw.m.l + 30), W - zw.m.r - 30)));
    zw.clabel.textContent = "z = " + fmtZ(z);
    zw.labels.forEach(function (t) {
      var L = KEY[+t.getAttribute("data-r")];
      var on = L.win.some(function (w) { return z >= w.lo && z <= w.hi; });
      t.setAttribute("class", "zw-label" + (on ? " in" : ""));
    });
  }

  function updateStatus() {
    out.textContent = "z = " + fmtZ(z);
    FILTERS.forEach(function (f) {
      var names = KEY.filter(function (L) { return inFilter(L.wl * (1 + z), f[0]); })
        .map(function (L) { return L.label; });
      chips[f[1]].textContent = f[0] + " · " + (names.length ? names.join(", ") : "no strong line");
      chips[f[1]].className = "chip" + (names.length ? " on-" + f[1] : "");
    });
    buttons.forEach(function (b) {
      var p = PRESETS[+b.getAttribute("data-p")];
      b.setAttribute("aria-pressed", Math.abs(z - p.z) < 0.002 * (1 + p.z) ? "true" : "false");
    });
  }

  function update() {
    if (!W) return;
    updateSpec();
    updateZW();
    updateStatus();
  }

  function setZ(v, fromSlider) {
    z = Math.min(Math.max(v, 0), ZMAX);
    if (!fromSlider) slider.value = Math.log(1 + z);
    update();
  }

  slider.value = Math.log(1 + z);
  slider.addEventListener("input", function () { setZ(Math.exp(parseFloat(slider.value)) - 1, true); });
  buttons.forEach(function (b) {
    b.addEventListener("click", function () { setZ(PRESETS[+b.getAttribute("data-p")].z); });
  });
  zwBox.addEventListener("click", function (e) {
    var svg = zwBox.querySelector("svg");
    if (!svg) return;
    var dz = e.target && e.target.getAttribute && e.target.getAttribute("data-z");
    if (dz) { setZ(parseFloat(dz)); return; }
    var x = e.clientX - svg.getBoundingClientRect().left;
    setZ(Math.exp((x - zw.m.l) / (W - zw.m.l - zw.m.r) * LMAX) - 1);
  });

  function layout() {
    var w = Math.floor(host.clientWidth);
    if (!w || w === W) return;
    W = w;
    buildSpec();
    buildZW();
    update();
  }
  if (window.ResizeObserver) new ResizeObserver(layout).observe(host);
  else window.addEventListener("resize", layout);
  layout();
})();
