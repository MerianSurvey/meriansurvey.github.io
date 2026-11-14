/* Interactive figure on the home page.
   Top: the Merian N540 and N708 filters (measured) and the HSC g, r, i filters, with a
   schematic galaxy spectrum (emission lines and a Balmer break) at the chosen redshift.
   Middle: mock photometry of that spectrum in each band, in magnitudes relative to the
   continuum, with the colors r - N540 and i - N708.
   Bottom: the redshift ranges in which each strong line falls inside the half-maximum
   width of N540 or N708. The slider is uniform in log(1 + z) from z = 0 to 5.
   Everything is drawn at the real pixel width of the page and redrawn on resize. */
(function () {
  var host = document.getElementById("filter-figure");
  var F = window.MERIAN_FILTERS;
  if (!host || !F || !F.g) return;

  var X0 = 390, X1 = 900;                       // plotted observed wavelength range (nm)
  var ZMAX = 5, LMAX = Math.log(1 + ZMAX);
  var CONT = 0.10;                              // continuum level (f_nu, arbitrary units) red of the Balmer break
  var PEAK = 0.62;                              // line peak height for s = 1
  var SIGMA_REST = 0.65;                        // rest-frame line width (nm), so lines stretch with 1 + z

  // Rest-frame wavelengths in nm. s = relative strength, illustrative only.
  // key: shown in the redshift-window chart and in the status chips.
  var LINES = [
    { wl: 121.567, s: 0.50, label: "Lyα", key: true },
    { wl: 154.9, s: 0.10, label: "C IV", key: true },
    { wl: 164.0, s: 0.05, label: "" },
    { wl: 190.9, s: 0.12, label: "C III]", key: true },
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
  var MEDIUM = [["N540", "540"], ["N708", "708"]];
  var BROAD = [["g", "HSC g"], ["r", "HSC r"], ["i", "HSC i"]];

  // Chart rows, longest rest wavelength first, so the windows step to higher z going down.
  var KEY = LINES.filter(function (L) { return L.key; }).sort(function (a, b) { return b.wl - a.wl; });
  KEY.forEach(function (L) {
    L.win = [];
    MEDIUM.forEach(function (f) {
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

  // Wavelength grid shared by the plotted spectrum and the mock photometry.
  var G0 = 385, G1 = 905, DG = 0.25;
  var NG = Math.round((G1 - G0) / DG) + 1;
  var GW = new Float64Array(NG), FLUX = new Float64Array(NG);
  for (var k = 0; k < NG; k++) GW[k] = G0 + k * DG;

  function interpT(d, w) {
    var a = d.wl, n = a.length;
    if (w <= a[0] || w >= a[n - 1]) return 0;
    var lo = 0, hi = n - 1;
    while (hi - lo > 1) { var mid = (lo + hi) >> 1; if (a[mid] <= w) lo = mid; else hi = mid; }
    var t = (w - a[lo]) / (a[hi] - a[lo]);
    return Math.max(0, d.T[lo] + t * (d.T[hi] - d.T[lo]));
  }

  // Photon-counting weights for a flux density per unit frequency: T(lambda) / lambda.
  var BANDS = [
    { key: "g", label: "g", cls: "broad" },
    { key: "N540", label: "N540", cls: "m540" },
    { key: "r", label: "r", cls: "broad" },
    { key: "N708", label: "N708", cls: "m708" },
    { key: "i", label: "i", cls: "broad" }
  ];
  BANDS.forEach(function (b) {
    var d = F[b.key], tl = 0, t1 = 0;
    b.wt = new Float64Array(NG);
    b.norm = 0;
    for (var k = 0; k < NG; k++) {
      var t = interpT(d, GW[k]);
      b.wt[k] = t / GW[k];
      b.norm += b.wt[k];
      tl += t * GW[k];
      t1 += t;
    }
    b.leff = tl / t1;
    b.lo = d.half_lo;
    b.hi = d.half_hi;
  });

  var z = 0.08, W = 0, spec = {}, ph = {}, zw = {};

  function f1(v) { return (Math.round(v * 10) / 10).toString(); }
  function fmtZ(v) { return v < 1 ? v.toFixed(3) : v.toFixed(2); }
  function fmtMag(v) { return (v < 0 ? "−" : "+") + Math.abs(v).toFixed(2); }
  function sig(x) { return 1 / (1 + Math.exp(-x)); }
  function inFilter(wlObs, name) { var d = F[name]; return wlObs >= d.half_lo && wlObs <= d.half_hi; }

  // Continuum in f_nu: flat red of 400 nm, a Balmer break that drops to 0.6 below the
  // Balmer limit (364.6 nm), dimmed below Ly-alpha and nearly gone below the Lyman limit.
  function cont(w) {
    var s = 0.6 + 0.15 * sig((w - 364.6) / 0.6) + 0.25 * Math.min(1, Math.max(0, (w - 364.6) / 35.4));
    s *= 0.3 + 0.7 * sig((w - 121.567) / 0.3);
    s *= 0.05 + 0.95 * sig((w - 91.2) / 0.3);
    return CONT * s;
  }

  function computeFlux() {
    var opz = 1 + z, sg = SIGMA_REST * opz;
    for (var k = 0; k < NG; k++) {
      var w = GW[k], v = cont(w / opz);
      for (var j = 0; j < LINES.length; j++) {
        var q = (w - LINES[j].wl * opz) / sg;
        if (q > -5 && q < 5) v += PEAK * LINES[j].s * Math.exp(-0.5 * q * q);
      }
      FLUX[k] = v;
    }
  }

  // Mean f_nu in each band, as a magnitude relative to the red continuum (negative = brighter).
  function photometry() {
    BANDS.forEach(function (b) {
      var s = 0;
      for (var k = 0; k < NG; k++) if (b.wt[k]) s += FLUX[k] * b.wt[k];
      b.f = s / b.norm;
      b.dm = -2.5 * Math.log(Math.max(b.f, 1e-5) / CONT) / Math.LN10;
    });
  }
  function band(key) { for (var i = 0; i < BANDS.length; i++) if (BANDS[i].key === key) return BANDS[i]; }

  host.classList.add("ff");
  host.innerHTML =
    '<div class="ff-spec"></div>' +
    '<div class="ff-sub-head"><p>Mock photometry · <span class="nt">Δm</span>, brighter up</p><span class="ff-colors">' +
    '<span class="color" data-c="540"></span><span class="color" data-c="708"></span></span></div>' +
    '<div class="ff-ph"></div>' +
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
  var phBox = host.querySelector(".ff-ph");
  var zwBox = host.querySelector(".ff-zw");
  var slider = host.querySelector("#ff-z");
  var out = host.querySelector("#ff-out");
  var chips = {}, colors = {};
  [].forEach.call(host.querySelectorAll(".chip"), function (c) { chips[c.getAttribute("data-f")] = c; });
  [].forEach.call(host.querySelectorAll(".color"), function (c) { colors[c.getAttribute("data-c")] = c; });
  var buttons = [].slice.call(host.querySelectorAll(".ff-presets button"));

  function margins() { var narrow = W < 560; return { l: narrow ? 40 : 50, r: 10, narrow: narrow }; }

  function curvePath(d, X, Y, closed) {
    var p = (closed ? "M" + f1(X(d.wl[0])) + "," + f1(Y(0)) + "L" : "M");
    for (var i = 0; i < d.wl.length; i++) p += (i ? "L" : "") + f1(X(d.wl[i])) + "," + f1(Y(d.T[i]));
    if (closed) p += "L" + f1(X(d.wl[d.wl.length - 1])) + "," + f1(Y(0)) + "Z";
    return p;
  }

  function buildSpec() {
    var mm = margins();
    var H = Math.round(Math.max(230, Math.min(360, W * 0.42)));
    var m = { l: mm.l, r: mm.r, t: 62, b: 46 };
    function X(wl) { return m.l + (wl - X0) / (X1 - X0) * (W - m.l - m.r); }
    function Y(t) { return H - m.b - t * (H - m.t - m.b); }
    spec = { H: H, m: m, X: X, Y: Y };

    var s = '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + " " + H + '" role="img" ' +
      'aria-label="Transmission of the Merian and HSC filters with a redshifted galaxy spectrum">' +
      '<defs><clipPath id="ff-clip"><rect x="' + m.l + '" y="0" width="' + (W - m.l - m.r) + '" height="' + H + '"/></clipPath></defs>';
    [0.5, 1].forEach(function (t) {
      s += '<line class="grid" x1="' + m.l + '" x2="' + (W - m.r) + '" y1="' + f1(Y(t)) + '" y2="' + f1(Y(t)) + '"/>' +
        '<text x="' + (m.l - 8) + '" y="' + f1(Y(t) + 4) + '" text-anchor="end">' + (t * 100) + "%</text>";
    });
    s += '<line class="axis" x1="' + m.l + '" x2="' + (W - m.r) + '" y1="' + f1(Y(0)) + '" y2="' + f1(Y(0)) + '"/>';
    var step = mm.narrow ? 100 : 50;
    for (var wl = 400; wl <= 900; wl += step) {
      s += '<line class="axis" x1="' + f1(X(wl)) + '" x2="' + f1(X(wl)) + '" y1="' + f1(Y(0)) + '" y2="' + f1(Y(0) + 5) + '"/>' +
        '<text x="' + f1(X(wl)) + '" y="' + f1(Y(0) + 20) + '" text-anchor="middle">' + wl + "</text>";
    }
    s += '<text x="' + f1((m.l + W - m.r) / 2) + '" y="' + (H - 4) + '" text-anchor="middle">Observed wavelength (nm)</text>';

    // HSC broad bands as thin outlines, Merian medium bands filled.
    BROAD.forEach(function (b) {
      var d = F[b[0]];
      s += '<path class="hsc-curve" d="' + curvePath(d, X, Y, false) + '"/>' +
        '<text class="hsc-label" x="' + f1(X((d.half_lo + d.half_hi) / 2)) + '" y="24" text-anchor="middle">' + b[1] + "</text>";
    });
    MEDIUM.forEach(function (f) {
      var d = F[f[0]];
      s += '<path class="n' + f[1] + '" d="' + curvePath(d, X, Y, true) + '"/>' +
        '<text class="t' + f[1] + '" x="' + f1(X((d.half_lo + d.half_hi) / 2)) + '" y="' + f1(Y(1) - 10) + '" text-anchor="middle">' + f[0] + "</text>";
    });

    s += '<path class="spec" clip-path="url(#ff-clip)" d=""/>';
    s += '<text class="break-label" text-anchor="middle"></text>';
    LINES.forEach(function (L, i) {
      if (L.label) s += '<text class="line-label" data-i="' + i + '" text-anchor="middle"></text>';
    });
    specBox.innerHTML = s + "</svg>";
    spec.path = specBox.querySelector("path.spec");
    spec.brk = specBox.querySelector(".break-label");
    spec.labels = [].slice.call(specBox.querySelectorAll("text.line-label"));
  }

  // Photometry strip, on the same wavelength axis as the spectrum.
  var DM_TOP = -1.0, DM_BOT = 1.5;
  function buildPh() {
    var mm = margins();
    var H = mm.narrow ? 130 : 150;
    var m = { l: mm.l, r: mm.r, t: 22, b: 26 };
    var X = spec.X;
    function Y(dm) { return m.t + (dm - DM_TOP) / (DM_BOT - DM_TOP) * (H - m.t - m.b); }
    ph = { H: H, m: m, Y: Y };

    var s = '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + " " + H + '" role="img" ' +
      'aria-label="Mock photometry in g, N540, r, N708 and i, in magnitudes relative to the continuum">';
    [-1, 1].forEach(function (t) {
      s += '<line class="grid" x1="' + m.l + '" x2="' + (W - m.r) + '" y1="' + f1(Y(t)) + '" y2="' + f1(Y(t)) + '"/>' +
        '<text x="' + (m.l - 8) + '" y="' + f1(Y(t) + 4) + '" text-anchor="end">' + (t < 0 ? "−1" : "+1") + "</text>";
    });
    s += '<line class="ph-zero" x1="' + m.l + '" x2="' + (W - m.r) + '" y1="' + f1(Y(0)) + '" y2="' + f1(Y(0)) + '"/>' +
      '<text x="' + (m.l - 8) + '" y="' + f1(Y(0) + 4) + '" text-anchor="end">0</text>' +
      (mm.narrow ? "" : '<text class="ph-note" x="' + (W - m.r) + '" y="' + f1(Y(0) - 5) + '" text-anchor="end">continuum</text>');
    BANDS.forEach(function (b, i) {
      var x = f1(X(b.leff));
      s += '<g class="ph-band ' + b.cls + '" data-b="' + i + '">' +
        '<line class="ph-bar" x1="' + f1(X(b.lo)) + '" x2="' + f1(X(b.hi)) + '"/>' +
        (b.cls === "broad"
          ? '<rect class="ph-mark" width="9" height="9"/>'
          : '<circle class="ph-mark" r="5"/>') +
        '<text class="ph-label" x="' + x + '" text-anchor="middle">' + b.label + "</text></g>";
    });
    phBox.innerHTML = s + "</svg>";
    ph.groups = [].slice.call(phBox.querySelectorAll(".ph-band"));
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
    var X = spec.X, Y = spec.Y, opz = 1 + z, d = "", first = true;
    for (var k = 0; k < NG; k++) {
      if (GW[k] < X0 - 1 || GW[k] > X1 + 1) continue;
      d += (first ? "M" : "L") + f1(X(GW[k])) + "," + f1(Y(FLUX[k]));
      first = false;
    }
    spec.path.setAttribute("d", d);

    // Mark the Balmer break while it is on the plot.
    var xb = 382 * opz;
    var showBreak = xb > X0 + 25 && xb < X1 - 25;
    spec.brk.textContent = showBreak ? "Balmer break" : "";
    spec.brk.setAttribute("x", f1(X(xb)));
    spec.brk.setAttribute("y", f1(Y(0) - 6));

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

  function updatePh() {
    BANDS.forEach(function (b, i) {
      var g = ph.groups[i], dm = b.dm, out = dm > DM_BOT;
      var y = ph.Y(Math.min(Math.max(dm, DM_TOP), DM_BOT)), x = spec.X(b.leff);
      var bar = g.querySelector(".ph-bar"), mk = g.querySelector(".ph-mark"), lab = g.querySelector(".ph-label");
      bar.setAttribute("y1", f1(y));
      bar.setAttribute("y2", f1(y));
      if (b.cls === "broad") { mk.setAttribute("x", f1(x - 4.5)); mk.setAttribute("y", f1(y - 4.5)); }
      else { mk.setAttribute("cx", f1(x)); mk.setAttribute("cy", f1(y)); }
      lab.setAttribute("y", f1(b.cls === "broad" ? y + 18 : y - 9));
      lab.textContent = b.label + (out ? " ↓" : "");
      g.setAttribute("class", "ph-band " + b.cls + (out ? " out" : ""));
    });
    var c540 = band("r").dm - band("N540").dm, c708 = band("i").dm - band("N708").dm;
    colors["540"].innerHTML = "r − N540 = <b>" + fmtMag(c540) + "</b>";
    colors["540"].className = "color" + (c540 > 0.1 ? " on-540" : "");
    colors["708"].innerHTML = "i − N708 = <b>" + fmtMag(c708) + "</b>";
    colors["708"].className = "color" + (c708 > 0.1 ? " on-708" : "");
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
    MEDIUM.forEach(function (f) {
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
    computeFlux();
    photometry();
    updateSpec();
    updatePh();
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

  // Exposed for checking the mock photometry from the browser console.
  window.MERIAN_DEMO = {
    colorsAt: function (v) {
      var keep = z; z = v; computeFlux(); photometry();
      var r = { z: v, r_N540: band("r").dm - band("N540").dm, i_N708: band("i").dm - band("N708").dm,
        dm: BANDS.map(function (b) { return b.key + " " + b.dm.toFixed(2); }).join(", ") };
      z = keep; update();
      return r;
    }
  };

  function layout() {
    var w = Math.floor(host.clientWidth);
    if (!w || w === W) return;
    W = w;
    buildSpec();
    buildPh();
    buildZW();
    update();
  }
  if (window.ResizeObserver) new ResizeObserver(layout).observe(host);
  else window.addEventListener("resize", layout);
  layout();
})();
