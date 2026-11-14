/* Interactive figure: the two Merian filters and a redshifted emission-line spectrum.
   Filter curves come from data/filters.js (measured). The spectrum is schematic. */
(function () {
  var host = document.getElementById("filter-figure");
  var F = window.MERIAN_FILTERS;
  if (!host || !F) return;

  var W = 720, H = 440;
  var m = { l: 62, r: 14, t: 78, b: 62 };
  var x0 = 470, x1 = 760;                 // plotted wavelength range in nm
  var CONT = 0.07, SIGMA = 0.9, PEAK = 0.66;

  // Rest wavelengths in nm (air). s = relative strength, illustrative only.
  var LINES = [
    { wl: 486.13, s: 0.28, label: "Hβ" },
    { wl: 495.89, s: 0.27, label: "" },
    { wl: 500.68, s: 0.80, label: "[O III]", key: "o3" },
    { wl: 654.80, s: 0.04, label: "" },
    { wl: 656.28, s: 1.00, label: "Hα", key: "ha" },
    { wl: 658.35, s: 0.10, label: "" },
    { wl: 671.64, s: 0.11, label: "" },
    { wl: 673.08, s: 0.08, label: "" }
  ];
  // Approximate extent of the HSC broad bands inside the plotted range (nm).
  var HSC = [["g", 470, 545], ["r", 549, 691], ["i", 695, 760]];

  function X(wl) { return m.l + (wl - x0) / (x1 - x0) * (W - m.l - m.r); }
  function Y(t) { return H - m.b - t * (H - m.t - m.b); }
  function f1(v) { return v.toFixed(1); }

  function filterPath(d) {
    var p = "M" + f1(X(d.wl[0])) + "," + f1(Y(0));
    for (var i = 0; i < d.wl.length; i++) p += "L" + f1(X(d.wl[i])) + "," + f1(Y(d.T[i]));
    return p + "L" + f1(X(d.wl[d.wl.length - 1])) + "," + f1(Y(0)) + "Z";
  }

  function spectrumPath(z) {
    var p = "", first = true;
    for (var wl = x0; wl <= x1 + 1e-6; wl += 0.25) {
      var v = CONT;
      for (var k = 0; k < LINES.length; k++) {
        var d = (wl - LINES[k].wl * (1 + z)) / SIGMA;
        if (d > -5 && d < 5) v += PEAK * LINES[k].s * Math.exp(-0.5 * d * d);
      }
      p += (first ? "M" : "L") + f1(X(wl)) + "," + f1(Y(v));
      first = false;
    }
    return p;
  }

  var s = '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-labelledby="ff-title">' +
    '<title id="ff-title">Transmission of the Merian N540 and N708 filters with a redshifted dwarf galaxy spectrum</title>';

  // grid and axes
  [0.5, 1].forEach(function (t) {
    s += '<line class="grid" x1="' + m.l + '" x2="' + (W - m.r) + '" y1="' + Y(t) + '" y2="' + Y(t) + '"/>' +
      '<text x="' + (m.l - 10) + '" y="' + (Y(t) + 5) + '" text-anchor="end">' + (t * 100) + "%</text>";
  });
  s += '<line class="axis" x1="' + m.l + '" x2="' + (W - m.r) + '" y1="' + Y(0) + '" y2="' + Y(0) + '"/>';
  for (var wl = 500; wl <= 750; wl += 50) {
    s += '<line class="axis" x1="' + X(wl) + '" x2="' + X(wl) + '" y1="' + Y(0) + '" y2="' + (Y(0) + 6) + '"/>' +
      '<text x="' + X(wl) + '" y="' + (Y(0) + 27) + '" text-anchor="middle">' + wl + "</text>";
  }
  s += '<text x="' + ((m.l + W - m.r) / 2) + '" y="' + (H - 8) + '" text-anchor="middle">Observed wavelength (nm)</text>';

  // HSC broad bands
  HSC.forEach(function (b) {
    var y = 18;
    s += '<line class="hsc" x1="' + X(b[1]) + '" x2="' + X(b[2]) + '" y1="' + y + '" y2="' + y + '"/>' +
      '<line class="hsc" x1="' + X(b[2]) + '" x2="' + X(b[2]) + '" y1="' + (y - 4) + '" y2="' + (y + 4) + '"/>' +
      '<line class="hsc" x1="' + X(b[1]) + '" x2="' + X(b[1]) + '" y1="' + (y - 4) + '" y2="' + (y + 4) + '"/>' +
      '<text class="hsc-label" x="' + ((X(b[1]) + X(b[2])) / 2) + '" y="' + (y + 21) + '" text-anchor="middle">HSC ' + b[0] + "</text>";
  });

  // filters
  s += '<path class="n540" d="' + filterPath(F.N540) + '"/>' +
    '<path class="n708" d="' + filterPath(F.N708) + '"/>' +
    '<text class="t540" x="' + X(540.2) + '" y="' + (Y(1) - 12) + '" text-anchor="middle">N540</text>' +
    '<text class="t708" x="' + X(710) + '" y="' + (Y(1) - 12) + '" text-anchor="middle">N708</text>';

  // spectrum and line labels
  s += '<path class="spec" id="ff-spec" d=""/>';
  LINES.forEach(function (L, i) {
    if (L.label) s += '<text class="line-label" id="ff-l' + i + '" text-anchor="middle"></text>';
  });
  s += "</svg>";

  s += '<div class="ff-controls">' +
    '<label for="ff-z">Redshift</label>' +
    '<input id="ff-z" type="range" min="0" max="0.16" step="0.001" value="0.08" aria-describedby="ff-msg">' +
    '<output id="ff-out" for="ff-z"></output></div>' +
    '<div class="ff-status" aria-live="polite">' +
    '<span class="chip" id="ff-c540"></span><span class="chip" id="ff-c708"></span>' +
    '<span class="ff-msg" id="ff-msg"></span></div>';

  host.classList.add("ff");
  host.innerHTML = s;

  var spec = document.getElementById("ff-spec");
  var slider = document.getElementById("ff-z");
  var out = document.getElementById("ff-out");
  var c540 = document.getElementById("ff-c540");
  var c708 = document.getElementById("ff-c708");
  var msg = document.getElementById("ff-msg");

  function inBand(wl, d) { return wl >= d.half_lo && wl <= d.half_hi; }

  function update() {
    var z = parseFloat(slider.value);
    spec.setAttribute("d", spectrumPath(z));
    out.textContent = "z = " + z.toFixed(3);

    var o3 = inBand(500.68 * (1 + z), F.N540);
    var ha = inBand(656.28 * (1 + z), F.N708);

    LINES.forEach(function (L, i) {
      if (!L.label) return;
      var t = document.getElementById("ff-l" + i);
      var wl = L.wl * (1 + z);
      var visible = wl > x0 + 4 && wl < x1 - 4;
      t.textContent = visible ? L.label : "";
      t.setAttribute("x", f1(X(wl) + (L.label === "Hβ" ? -6 : 0)));
      t.setAttribute("y", f1(Y(CONT + PEAK * L.s) - 9));
      t.setAttribute("class", "line-label" + ((L.key === "o3" && o3) || (L.key === "ha" && ha) ? " in" : ""));
    });

    c540.textContent = "[O III] " + (o3 ? "inside" : "outside") + " N540";
    c540.className = "chip" + (o3 ? " on-540" : "");
    c708.textContent = "Hα " + (ha ? "inside" : "outside") + " N708";
    c708.className = "chip" + (ha ? " on-708" : "");
    msg.textContent = o3 && ha
      ? "Both lines land in the Merian filters. The galaxy is brighter in N540 and N708 than in the broad bands around them."
      : (o3 || ha)
        ? "Only one of the two lines is in band at this redshift."
        : "Neither line is in band. The galaxy looks ordinary in the two medium bands.";
  }

  slider.addEventListener("input", update);
  update();
})();
