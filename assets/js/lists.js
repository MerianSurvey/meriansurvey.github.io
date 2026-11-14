/* Renders the publication list and the team roster from the files in data/.
   Pages opt in with an element that carries data-pubs or data-team. */
(function () {
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function pubHTML(p) {
    var href = p.arxiv ? "https://arxiv.org/abs/" + encodeURIComponent(p.arxiv)
      : p.doi ? "https://doi.org/" + p.doi : "";
    var title = href ? '<a href="' + esc(href) + '">' + esc(p.title) + "</a>" : esc(p.title);
    var meta = [];
    if (p.kind) meta.push('<span class="tag">' + esc(p.kind) + "</span>");
    if (p.journal) meta.push("<span>" + esc(p.journal) + "</span>");
    if (p.arxiv) meta.push('<a href="https://arxiv.org/abs/' + encodeURIComponent(p.arxiv) + '">arXiv:' + esc(p.arxiv) + "</a>");
    if (p.doi) meta.push('<a href="https://doi.org/' + esc(p.doi) + '">DOI</a>');
    return '<li class="pub"><div class="yr">' + esc(p.year) + "</div><div>" +
      "<h3>" + title + "</h3>" +
      '<p class="authors">' + esc(p.authors) + "</p>" +
      '<p class="meta">' + meta.join("") + "</p></div></li>";
  }

  document.querySelectorAll("[data-pubs]").forEach(function (el) {
    var pubs = (window.MERIAN_PUBLICATIONS || []).slice();
    var limit = parseInt(el.getAttribute("data-limit"), 10);
    if (limit) pubs = pubs.slice(0, limit);
    el.innerHTML = pubs.map(pubHTML).join("");
  });

  document.querySelectorAll("[data-team]").forEach(function (el) {
    el.innerHTML = (window.MERIAN_TEAM || []).map(function (g) {
      return '<section class="team-group"><h2>' + esc(g.group) + '</h2><ul class="people">' +
        g.people.map(function (p) {
          return "<li><b>" + esc(p.name) + "</b><span>" + esc(p.affiliation) + "</span></li>";
        }).join("") + "</ul></section>";
    }).join("");
  });
})();
