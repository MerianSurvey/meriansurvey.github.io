/* Depth figure on the Data page (#depth-figure).
   Upper panel: one bar per filter at its 5-sigma point-source depth (data/depths.js), spanning the
   filter's half-maximum width (data/filters.js), with brighter magnitudes higher up.
   Lower strip: the filter transmission curves. After the filter-depth figure of the Merian photo-z
   paper. Drawn at the real pixel width of the page and redrawn on resize. */
(function () {
  var host = document.getElementById("depth-figure");
  var F = window.MERIAN_FILTERS, D = window.MERIAN_DEPTHS;
  if (!host || !F || !D) return;

  var NS = "http://www.w3.org/2000/svg";
  var BANDS = [
    { key: "g", label: "g", cls: "hsc" },
    { key: "N540", label: "N540", cls: "m540" },
    { key: "r", label: "r", cls: "hsc" },
    { key: "N708", label: "N708", cls: "m708" },
    { key: "i", label: "i", cls: "hsc" },
    { key: "z", label: "z", cls: "hsc" },
    { key: "y", label: "y", cls: "hsc" }
  ];
  var XR = [380, 1100];                 // nm
  var YR = [24, 27];                    // mag, brighter at the top

  function add(parent, name, attrs, text) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    parent.appendChild(e);
    return e;
  }

  function draw() {
    var W = Math.floor(host.clientWidth);
    if (W < 50 || W === host._w) return;
    host._w = W;
    var narrow = W < 600;
    var L = narrow ? 40 : 46, R = 6, w = W - L - R;
    var top = 30;                                            // room for the axis title
    var ph = Math.round(Math.max(170, Math.min(280, W * 0.24)));
    var gap = 12, sh = Math.round(Math.max(48, ph * 0.3));
    var sTop = top + ph + gap;
    var H = sTop + sh + 40;
    var X = function (nm) { return L + (nm - XR[0]) / (XR[1] - XR[0]) * w; };
    var Y = function (m) { return top + (m - YR[0]) / (YR[1] - YR[0]) * ph; };
    var S = function (t) { return sTop + (1 - t) * sh; };

    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    svg.setAttribute("width", W);
    svg.setAttribute("height", H);
    svg.setAttribute("aria-hidden", "true");

    add(svg, "text", { x: L, y: 13 }, "5σ point-source depth (AB mag)");
    var step = narrow ? 1 : 0.5;
    for (var m = YR[0]; m <= YR[1] + 1e-9; m += step) {
      add(svg, "line", { x1: L, x2: L + w, y1: Y(m), y2: Y(m), "class": "grid" });
      add(svg, "text", { x: L - 6, y: Y(m) + 4, "text-anchor": "end" }, m.toFixed(narrow ? 0 : 1));
    }
    var xStep = narrow ? 200 : 100;
    for (var nm = Math.ceil(XR[0] / xStep) * xStep; nm <= XR[1]; nm += xStep) {
      add(svg, "line", { x1: X(nm), x2: X(nm), y1: top, y2: top + ph, "class": "grid" });
      add(svg, "line", { x1: X(nm), x2: X(nm), y1: sTop, y2: sTop + sh, "class": "grid" });
      add(svg, "text", { x: X(nm), y: sTop + sh + 16, "text-anchor": "middle" }, String(nm));
    }
    add(svg, "line", { x1: L, x2: L + w, y1: sTop + sh, y2: sTop + sh, "class": "axis" });
    add(svg, "text", { x: L + w / 2, y: sTop + sh + 34, "text-anchor": "middle" }, "Wavelength (nm)");

    // Transmission curves in the lower strip, broad bands first so the medium bands sit on top.
    BANDS.slice().sort(function (a, b) { return (a.cls === "hsc" ? 0 : 1) - (b.cls === "hsc" ? 0 : 1); }).forEach(function (b) {
      var d = F[b.key];
      if (!d) return;
      var pts = d.wl.map(function (x, i) { return X(x).toFixed(1) + "," + S(d.T[i]).toFixed(1); });
      add(svg, "path", { d: "M" + X(d.wl[0]).toFixed(1) + "," + S(0) + "L" + pts.join("L") + "L" + X(d.wl[d.wl.length - 1]).toFixed(1) + "," + S(0) + "Z", "class": b.cls + "-area" });
      add(svg, "path", { d: "M" + pts.join("L"), "class": b.cls + "-line" });
    });

    // Depth bars across each filter's half-maximum width, labeled with the band and the depth.
    BANDS.forEach(function (b) {
      var d = F[b.key], mag = D[b.key];
      if (!d || mag == null) return;
      var inset = Math.min(3, 0.1 * (X(d.half_hi) - X(d.half_lo)));   // small gap between touching bars
      var x0 = X(d.half_lo) + inset, x1 = X(d.half_hi) - inset, y = Y(mag);
      var g = add(svg, "g", {});
      add(g, "title", {}, (b.cls === "hsc" ? "HSC " : "") + b.label + ": 5σ depth " + mag.toFixed(1) + " mag");
      add(g, "line", { x1: x0, x2: Math.max(x1, x0 + 1), y1: y, y2: y, "class": "bar " + b.cls });
      var text = b.label + " " + mag.toFixed(1);
      var tw = 7.2 * text.length;
      var xc = Math.min(Math.max((x0 + x1) / 2, L + tw / 2), L + w - tw / 2);
      var t = add(g, "text", { x: xc, y: y - 9, "text-anchor": "middle", "class": "val" });
      add(t, "tspan", { "class": b.cls === "hsc" ? "hsc-name" : (b.cls === "m540" ? "t540" : "t708") }, b.label);
      add(t, "tspan", {}, " " + mag.toFixed(1));
    });

    host.replaceChildren(svg);
  }

  if (window.ResizeObserver) new ResizeObserver(draw).observe(host);
  else window.addEventListener("resize", draw);
  draw();
})();
