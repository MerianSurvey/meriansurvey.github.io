/* Renders the publication list and the team roster from the files in data/.
   Pages opt in with an element that carries data-pubs or data-team.

   data-pubs           all papers, newest first
   data-pubs="survey"  only the survey papers (survey: true)
   data-pubs="other"   every paper except the survey papers
   data-order="oldest" list oldest first instead
   data-limit="3"      show only the first N */
(function () {
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function pubHTML(p) {
    var arxiv = p.arxiv ? "https://arxiv.org/abs/" + encodeURIComponent(p.arxiv) : "";
    var doi = p.doi ? "https://doi.org/" + p.doi : "";
    var href = doi || arxiv;
    var title = href ? '<a href="' + esc(href) + '">' + esc(p.title) + "</a>" : esc(p.title);
    var meta = [];
    if (p.kind) meta.push('<span class="tag">' + esc(p.kind) + "</span>");
    if (p.journal) meta.push("<span>" + esc(p.journal) + "</span>");
    if (doi) meta.push('<a href="' + esc(doi) + '">DOI</a>');
    if (arxiv) meta.push('<a href="' + esc(arxiv) + '">arXiv:' + esc(p.arxiv) + "</a>");
    return '<li class="pub"><div class="yr">' + esc(p.year) + "</div><div>" +
      "<h3>" + title + "</h3>" +
      '<p class="authors">' + esc(p.authors) + "</p>" +
      '<p class="meta">' + meta.join("") + "</p></div></li>";
  }

  document.querySelectorAll("[data-pubs]").forEach(function (el) {
    var which = el.getAttribute("data-pubs");
    var pubs = (window.MERIAN_PUBLICATIONS || []).filter(function (p) {
      if (which === "survey") return p.survey === true;
      if (which === "other") return p.survey !== true;
      return true;
    });
    if (el.getAttribute("data-order") === "oldest") pubs.reverse();
    var limit = parseInt(el.getAttribute("data-limit"), 10);
    if (limit) pubs = pubs.slice(0, limit);
    el.innerHTML = pubs.map(pubHTML).join("");
  });

  function initials(name) {
    return name.split(/\s+/).filter(Boolean).map(function (w) { return w.charAt(0); })
      .filter(function (c) { return /[A-Za-z]/.test(c); }).slice(0, 2).join("").toUpperCase();
  }

  function personHTML(p) {
    var photo = p.photo
      ? '<img class="avatar" src="' + esc(p.photo) + '" alt="" width="120" height="120" loading="lazy">'
      : '<span class="avatar initials" aria-hidden="true">' + esc(initials(p.name)) + "</span>";
    var name = p.url ? '<a href="' + esc(p.url) + '">' + esc(p.name) + "</a>" : esc(p.name);
    var badge = p.role ? '<span class="role">' + esc(p.role) + "</span>" : "";
    return '<li class="person">' + photo + '<div class="who"><b>' + name + "</b>" + badge +
      '<span class="aff">' + esc(p.affiliation) + "</span></div></li>";
  }

  document.querySelectorAll("[data-team]").forEach(function (el) {
    el.innerHTML = (window.MERIAN_TEAM || []).map(function (g) {
      return '<section class="team-group"><h2>' + esc(g.group) + '</h2><ul class="people">' +
        g.people.map(personHTML).join("") + "</ul></section>";
    }).join("");
  });
})();
