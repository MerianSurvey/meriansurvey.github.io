/* Shared header and footer for every page.
   To add or rename a page in the menu, edit the NAV list below. */
(function () {
  var NAV = [
    ["index.html", "Home"],
    ["filters.html", "Filters"],
    ["data.html", "Data"],
    ["gallery.html", "Gallery"],
    ["publications.html", "Publications"],
    ["team.html", "Team"],
    ["viewer.html", "Viewer (internal)"]
  ];

  var here = location.pathname.split("/").pop() || "index.html";

  var links = NAV.map(function (item) {
    var current = item[0] === here ? ' aria-current="page"' : "";
    return '<li><a href="' + item[0] + '"' + current + ">" + item[1] + "</a></li>";
  }).join("");

  var header =
    '<a class="skip" href="#main">Skip to content</a>' +
    '<header class="site-header"><div class="wrap bar">' +
    '<a class="brand" href="index.html"><img src="assets/img/merian-logo-small.png" alt="" width="35" height="44">' +
    "<span>Merian <em>Survey</em></span></a>" +
    '<button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">Menu</button>' +
    '<nav class="site-nav" id="site-nav" aria-label="Main"><ul>' + links + "</ul></nav>" +
    "</div></header>";

  var footer =
    '<footer class="site-footer"><div class="wrap">' +
    '<div class="foot-grid">' +
    '<div class="foot-brand"><div>' +
    "<strong>The Merian Survey</strong>" +
    "<p>A medium-band imaging survey with the Dark Energy Camera on the Víctor M. Blanco 4-m Telescope " +
    "at Cerro Tololo Inter-American Observatory, built on imaging from the Hyper Suprime-Cam Subaru Strategic Program.</p>" +
    "</div></div>" +
    "<div><h2>Pages</h2><ul>" + links.replace(/ aria-current="page"/g, "") + "</ul></div>" +
    "</div>" +
    '<p class="fine">© ' + new Date().getFullYear() + " The Merian Survey collaboration.</p>" +
    "</div></footer>";

  document.body.insertAdjacentHTML("afterbegin", header);

  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  toggle.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });

  document.addEventListener("DOMContentLoaded", function () {
    document.body.insertAdjacentHTML("beforeend", footer);
  });
})();
