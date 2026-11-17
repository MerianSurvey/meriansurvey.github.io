/* Sky-coverage maps on the Data page.
   Every element with data-footprint="dr1" or "dr2" gets a map of that release from
   data/footprints.js. Each map has two strips, the spring and the fall fields, drawn at the
   same scale. Both releases use the same strip ranges, so the two maps line up. The DR1 map
   also shows the rest of the survey in gray. The maps are drawn at the real pixel width of
   the page and redrawn on resize. */
(function () {
  var FP = window.MERIAN_FOOTPRINTS;
  var hosts = document.querySelectorAll("[data-footprint]");
  if (!FP || !hosts.length) return;

  var NS = "http://www.w3.org/2000/svg";
  var SPAN = Math.max.apply(null, FP.fields.map(function (f) { return f.ra[1] - f.ra[0]; }));

  function add(parent, name, attrs, text) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    parent.appendChild(e);
    return e;
  }
  function raText(ra) { return (((ra % 360) + 360) % 360) + "°"; }
  function decText(d) { return (d > 0 ? "+" : d < 0 ? "−" : "") + Math.abs(d) + "°"; }

  function draw(host) {
    var rel = host.getAttribute("data-footprint");
    var data = FP[rel];
    var W = Math.floor(host.clientWidth);
    if (!data || W < 50 || W === host._fpWidth) return;
    host._fpWidth = W;

    var narrow = W < 600;
    var L = narrow ? 44 : 58, R = 2;               // left margin holds the Dec. labels
    var s = (W - L - R) / SPAN;                     // pixels per degree, the same in both strips
    var raStep = s * 10 >= 40 ? 10 : 20;
    var decStep = s * 5 >= 18 ? 5 : 10;            // on phones only the 0° line is labeled
    var HEAD = 22, TICKS = 22, GAP = narrow ? 12 : 16, FOOT = 18;

    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("aria-hidden", "true");
    var defs = add(svg, "defs", {});
    var y = 0, last = null;

    FP.fields.forEach(function (f, n) {
      var w = (f.ra[1] - f.ra[0]) * s, h = (f.dec[1] - f.dec[0]) * s;
      if (n > 0) y += GAP;
      add(svg, "text", { x: L, y: y + 13, "class": "strip-label" }, f.label.toUpperCase());
      var top = y + HEAD;
      var X = function (ra) { return L + (ra - f.ra[0]) * s; };
      var Y = function (dec) { return top + (f.dec[1] - dec) * s; };

      var id = "fp-clip-" + rel + "-" + f.key;
      add(add(defs, "clipPath", { id: id }), "rect", { x: L, y: top, width: w, height: h });
      add(svg, "rect", { x: L, y: top, width: w, height: h, "class": "bg" });

      var grid = add(svg, "g", {});
      for (var ra = Math.ceil(f.ra[0] / raStep) * raStep; ra <= f.ra[1]; ra += raStep) {
        add(grid, "line", { x1: X(ra), x2: X(ra), y1: top, y2: top + h, "class": "grid" });
        add(svg, "text", { x: X(ra), y: top + h + 16, "text-anchor": "middle" }, raText(ra));
      }
      for (var d = Math.ceil(f.dec[0] / decStep) * decStep; d <= f.dec[1]; d += decStep) {
        add(grid, "line", { x1: L, x2: L + w, y1: Y(d), y2: Y(d), "class": "grid" });
        add(svg, "text", { x: L - 7, y: Y(d) + 4, "text-anchor": "end" }, decText(d));
      }

      // The outlines are in degrees, so one transform places them in the strip.
      var map = add(add(svg, "g", { "clip-path": "url(#" + id + ")" }), "g", {
        transform: "translate(" + (L - f.ra[0] * s) + " " + (top + f.dec[1] * s) + ") scale(" + s + " " + (-s) + ")"
      });
      if (rel === "dr1") add(map, "path", { d: FP.dr2.color[f.key], "class": "rest" });
      add(map, "path", { d: data.color[f.key], "class": "color" });
      add(map, "path", { d: data.depth[f.key], "class": "depth" });

      add(svg, "rect", { x: L, y: top, width: w, height: h, "class": "frame" });
      add(svg, "text", { x: narrow ? 9 : 13, y: top + h / 2, "text-anchor": "middle",
                         transform: "rotate(-90 " + (narrow ? 9 : 13) + " " + (top + h / 2) + ")" }, "Dec.");
      y = top + h + TICKS;
      last = { x: L + w / 2 };
    });

    add(svg, "text", { x: last.x, y: y + FOOT - 4, "text-anchor": "middle" }, "R.A.");
    y += FOOT;
    svg.setAttribute("viewBox", "0 0 " + W + " " + Math.ceil(y));
    svg.setAttribute("width", W);
    svg.setAttribute("height", Math.ceil(y));
    host.replaceChildren(svg);
  }

  Array.prototype.forEach.call(hosts, function (host) {
    var redraw = function () { draw(host); };
    if (window.ResizeObserver) new ResizeObserver(redraw).observe(host);
    else window.addEventListener("resize", redraw);
    redraw();
  });
})();
