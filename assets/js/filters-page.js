/* Figures on the Filters page.
   Plate I (#filter-curves): the Merian N540 and N708 laboratory transmission with the HSC g, r2, i2,
   z and y filter curves, from data/filters.js.
   Plate II (#filter-shifts): N540 and N708 measured at the filter center and at 150, 200, 250 and
   280 mm from it, from data/filter-shifts.js, with a sketch of the filter that shows where.
   Both are drawn at the real pixel width of the page, redrawn on resize, and read out the values
   under the pointer. */
(function () {
  var NS = "http://www.w3.org/2000/svg";
  var CHAR = 7.2;                                   // width of one 12 px IBM Plex Mono character

  function add(parent, name, attrs, text) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    parent.appendChild(e);
    return e;
  }
  function interp(wl, T, w) {
    var n = wl.length;
    if (w <= wl[0] || w >= wl[n - 1]) return 0;
    var lo = 0, hi = n - 1;
    while (hi - lo > 1) { var mid = (lo + hi) >> 1; if (wl[mid] <= w) lo = mid; else hi = mid; }
    var t = (w - wl[lo]) / (wl[hi] - wl[lo]);
    return T[lo] + t * (T[hi] - T[lo]);
  }
  function pct(v) { return (100 * v).toFixed(1) + "%"; }

  /* A vertical hairline and a small label box that follow the pointer inside a plot box.
     lines(w) returns the text lines for wavelength w. */
  function addReadout(svg, box, toW, lines) {
    var g = add(svg, "g", { "class": "readout", visibility: "hidden" });
    var hair = add(g, "line", { "class": "xh", y1: box.y, y2: box.y + box.h });
    var bg = add(g, "rect", { "class": "rbox", rx: 3 });
    var texts = [];
    var hit = add(svg, "rect", { x: box.x, y: box.y, width: box.w, height: box.h, fill: "transparent", "class": "hit" });
    function show(ev) {
      var r = svg.getBoundingClientRect();
      var px = (ev.clientX - r.left) * (svg.viewBox.baseVal.width / r.width);
      px = Math.max(box.x, Math.min(box.x + box.w, px));
      var L = lines(toW(px));
      while (texts.length < L.length) texts.push(add(g, "text", {}));
      texts.forEach(function (t, i) { t.textContent = i < L.length ? L[i] : ""; });
      var wBox = 12 + CHAR * Math.max.apply(null, L.map(function (s) { return s.length; }));
      var hBox = 8 + 16 * L.length;
      var bx = px + 10 + wBox > box.x + box.w ? px - 10 - wBox : px + 10;
      hair.setAttribute("x1", px); hair.setAttribute("x2", px);
      bg.setAttribute("x", bx); bg.setAttribute("y", box.y + 4);
      bg.setAttribute("width", wBox); bg.setAttribute("height", hBox);
      texts.forEach(function (t, i) { t.setAttribute("x", bx + 6); t.setAttribute("y", box.y + 20 + 16 * i); });
      g.setAttribute("visibility", "visible");
    }
    hit.addEventListener("pointermove", show);
    hit.addEventListener("pointerdown", show);
    hit.addEventListener("pointerleave", function () { g.setAttribute("visibility", "hidden"); });
  }

  function axes(svg, box, xr, yTicks, xStep, X, Y, xTitle) {
    for (var w = Math.ceil(xr[0] / xStep) * xStep; w <= xr[1]; w += xStep) {
      add(svg, "line", { x1: X(w), x2: X(w), y1: box.y, y2: box.y + box.h, "class": "grid" });
      add(svg, "text", { x: X(w), y: box.y + box.h + 16, "text-anchor": "middle" }, String(w));
    }
    yTicks.forEach(function (v) {
      add(svg, "line", { x1: box.x, x2: box.x + box.w, y1: Y(v), y2: Y(v), "class": "grid" });
      add(svg, "text", { x: box.x - 6, y: Y(v) + 4, "text-anchor": "end" }, Math.round(v * 100) + "%");
    });
    add(svg, "line", { x1: box.x, x2: box.x + box.w, y1: box.y + box.h, y2: box.y + box.h, "class": "axis" });
    add(svg, "text", { x: box.x + box.w / 2, y: box.y + box.h + 34, "text-anchor": "middle" }, xTitle);
  }

  function newSvg(W, H) {
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    svg.setAttribute("width", W);
    svg.setAttribute("height", H);
    svg.setAttribute("aria-hidden", "true");
    return svg;
  }

  /* ---------- Plate I: all seven filters ---------- */

  function drawCurves(host) {
    var F = window.MERIAN_FILTERS;
    var W = Math.floor(host.clientWidth);
    if (!F || W < 50 || W === host._w) return;
    host._w = W;
    var narrow = W < 600;
    var H = Math.round(Math.max(230, Math.min(360, W * 0.38)));
    var box = { x: narrow ? 40 : 46, y: 30, w: 0, h: 0 };
    box.w = W - box.x - 8; box.h = H - box.y - 44;
    var XR = [380, 1100];
    var X = function (w) { return box.x + (w - XR[0]) / (XR[1] - XR[0]) * box.w; };
    var Y = function (t) { return box.y + (1 - t) * box.h; };
    var svg = newSvg(W, H);
    axes(svg, box, XR, [0, 0.5, 1], narrow ? 200 : 100, X, Y, "Wavelength (nm)");

    function area(d, cls) {
      var top = d.wl.map(function (w, i) { return X(w).toFixed(1) + "," + Y(d.T[i]).toFixed(1); });
      add(svg, "path", { d: "M" + X(d.wl[0]).toFixed(1) + "," + Y(0) + "L" + top.join("L") + "L" + X(d.wl[d.wl.length - 1]).toFixed(1) + "," + Y(0) + "Z", "class": cls + "-area" });
      add(svg, "path", { d: "M" + top.join("L"), "class": cls + "-line" });
    }
    function label(d, text, cls) {
      var peak = Math.max.apply(null, d.T);
      add(svg, "text", { x: X((d.half_lo + d.half_hi) / 2), y: Y(peak) - 7, "text-anchor": "middle", "class": cls }, text);
    }
    var HSC = [["g", "g"], ["r", "r2"], ["i", "i2"], ["z", "z"], ["y", "y"]];
    HSC.forEach(function (b) { if (F[b[0]]) area(F[b[0]], "hsc"); });
    HSC.forEach(function (b) { if (F[b[0]]) label(F[b[0]], b[1], "hsc-label"); });
    area(F.N540, "m540"); area(F.N708, "m708");
    label(F.N540, "N540", "t540"); label(F.N708, "N708", "t708");

    addReadout(svg, box, function (px) { return XR[0] + (px - box.x) / box.w * (XR[1] - XR[0]); }, function (w) {
      var out = [w.toFixed(1) + " nm"];
      [["N540", "N540"], ["N708", "N708"]].concat(HSC).forEach(function (b) {
        var d = F[b[0]];
        if (!d) return;
        var t = interp(d.wl, d.T, w);
        if (t >= 0.005) out.push((b[1] + "    ").slice(0, 5) + pct(t));
      });
      if (out.length === 1) out.push("no filter");
      return out;
    });
    host.replaceChildren(svg);
  }

  /* ---------- Plate II: shifts with distance from the filter center ---------- */

  function sketch(S) {
    // The filter seen face-on: its edge (620 mm), the measurement rings, and the five positions used.
    var size = 92, c = size / 2, k = (size / 2 - 2) / 310;
    var svg = newSvg(size, size);
    svg.setAttribute("class", "fs-sketch");
    add(svg, "circle", { cx: c, cy: c, r: 310 * k, "class": "edge" });
    S.rings.forEach(function (r) { add(svg, "circle", { cx: c, cy: c, r: r * k, "class": "ring" }); });
    add(svg, "line", { x1: c, y1: c, x2: c + 300 * k, y2: c, "class": "ray" });
    S.radii.forEach(function (r, i) { add(svg, "circle", { cx: c + r * k, cy: c, r: 3.2, "class": "dot r" + i }); });
    return svg;
  }

  function drawShifts(host) {
    var S = window.MERIAN_FILTER_SHIFTS;
    var W = Math.floor(host.clientWidth);
    if (!S || W < 50 || W === host._w) return;
    host._w = W;
    var side = W >= 640;
    var gap = side ? 28 : 18;
    var pw = side ? (W - gap) / 2 : W;
    var ph = Math.round(Math.max(220, Math.min(300, pw * 0.62)));
    var H = side ? ph : 2 * ph + gap;
    var svg = newSvg(W, H);
    var names = ["N540", "N708"];

    names.forEach(function (name, n) {
      var d = S[name];
      var ox = side ? n * (pw + gap) : 0, oy = side ? 0 : n * (ph + gap);
      var box = { x: ox + 40, y: oy + 32, w: pw - 48, h: ph - 32 - 44 };
      var XR = d.window;
      var X = function (w) { return box.x + (w - XR[0]) / (XR[1] - XR[0]) * box.w; };
      var Y = function (t) { return box.y + (1 - t / 100) * box.h; };
      axes(svg, box, XR, [0, 0.5, 1], 10, X, function (v) { return Y(100 * v); }, "Wavelength (nm)");
      var wl = d.T[0].map(function (_, j) { return d.wl0 + j * d.step; });

      d.T.forEach(function (T, i) {
        add(svg, "path", { d: "M" + T.map(function (t, j) { return X(wl[j]).toFixed(1) + "," + Y(t).toFixed(1); }).join("L"), "class": "curve r" + i });
      });
      [0, d.center.length - 1].forEach(function (i) {
        add(svg, "line", { x1: X(d.center[i]), x2: X(d.center[i]), y1: box.y, y2: box.y + box.h, "class": "cline r" + i });
      });

      // Title, and the shift from the center to 280 mm.
      add(svg, "text", { x: box.x, y: oy + 14, "class": name === "N540" ? "t540" : "t708" }, name);
      var c0 = d.center[0], c1 = d.center[d.center.length - 1];
      var x0 = X(c0), x1 = X(c1), ya = box.y - 9, dir = x1 > x0 ? 1 : -1;
      add(svg, "line", { x1: x0, x2: x1, y1: ya, y2: ya, "class": "shift" });
      add(svg, "path", { d: "M" + x1 + "," + ya + "l" + (-5 * dir) + ",-3.5v7z", "class": "shift-head" });
      add(svg, "text", { x: box.x + box.w, y: oy + 14, "text-anchor": "end", "class": "shift-label" },
          Math.abs(c1 - c0).toFixed(1) + " nm " + (dir > 0 ? "redder" : "bluer") + " at 280 mm");

      addReadout(svg, box, function (px) { return XR[0] + (px - box.x) / box.w * (XR[1] - XR[0]); }, function (w) {
        var out = [w.toFixed(1) + " nm"];
        S.radii.forEach(function (r, i) {
          out.push((r + " mm").padStart(6) + "  " + interp(wl, d.T[i], w).toFixed(1) + "%");
        });
        return out;
      });
    });

    var legend = document.createElement("div");
    legend.className = "fs-legend";
    legend.appendChild(sketch(S));
    var list = document.createElement("ul");
    S.radii.forEach(function (r, i) {
      var li = document.createElement("li");
      li.innerHTML = '<span class="sw r' + i + '"></span>' + (r === 0 ? "Filter center" : r + " mm from the center");
      list.appendChild(li);
    });
    legend.appendChild(list);
    host.replaceChildren(svg, legend);
  }

  [["filter-curves", drawCurves], ["filter-shifts", drawShifts]].forEach(function (p) {
    var host = document.getElementById(p[0]);
    if (!host) return;
    var redraw = function () { p[1](host); };
    if (window.ResizeObserver) new ResizeObserver(redraw).observe(host);
    else window.addEventListener("resize", redraw);
    redraw();
  });
})();
