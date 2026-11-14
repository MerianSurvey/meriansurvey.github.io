# The Merian Survey website

A plain HTML/CSS site with no build step. GitHub Pages serves the files exactly as they are.

## Editing

Most updates only touch the small files in `data/`.

| To change | Edit |
| --- | --- |
| Publication list | `data/publications.js` (copy a block, paste it at the top, fill it in; `survey: true` puts a paper in the survey-papers block) |
| Team roster, photos, links | `data/team.js` (photos live in `assets/img/team/`) |
| Menu, header, footer | `assets/js/site.js` |
| Text of a page | the matching `.html` file (`index`, `data`, `publications`, `team`) |
| Home-page gallery | the `<ul class="gallery">` list in `index.html` (images in `assets/img/gallery/`) |
| Colors and fonts | the `:root` block at the top of `assets/css/style.css` |

You can edit any of these in the browser on GitHub (open the file, click the pencil). The site updates about a minute after the change is committed.

## Preview on your own machine

```bash
python3 -m http.server 8765
```

Then open http://localhost:8765 in a browser.

## Layout

```
index.html  data.html  publications.html  team.html
assets/css/style.css         all styling
assets/js/site.js            shared header and footer
assets/js/filters-figure.js  interactive filter figure on the home page
assets/js/lists.js           renders the publication and team lists
assets/img/                  logo, favicon, star-field background
assets/img/gallery/          the 30 galaxy cutouts on the home page
assets/img/team/             team photos
data/publications.js         publication list
data/team.js                 team roster
data/filters.js              measured filter transmission curves (generated, see below)
```

All links inside the site are relative, so it works both at
`https://<user>.github.io/<repo>/` and at the root of a domain.

The Science and Survey pages were taken out on 2026-11-14. To bring them back:

```bash
git checkout 5ef048e -- science.html survey.html
```

and add them to the `NAV` list in `assets/js/site.js`.

## Where the content comes from

- Survey facts and numbers: Danieli et al. 2025, ApJ 993, 110 (arXiv:2410.01884), and Luo et al. 2024, MNRAS 530, 4988 (arXiv:2305.19310).
- Publication details: SciX and Crossref, checked 2026-11-14.
- Home-page gallery: 30 galaxies from the Merian DR1 photo-z catalog, ordered by stellar mass. The cutouts are HSC-SSP PDR3 color images from the Legacy Surveys viewer.
- `data/filters.js`: for N540 and N708, the mean of the 49 laboratory transmission measurements across each filter, resampled to 1 nm. For HSC g, r and i, the HSC g, r2 and i2 filter transmission curves, resampled to 2 nm.
- Team photos and links: each person's own or departmental web page (sources listed in `data/team.js`).
- Fonts are loaded from Google Fonts (EB Garamond, Source Sans 3, IBM Plex Mono).

## Moving the site to the MerianSurvey organization

1. In the repository on GitHub, go to Settings, then General, then Transfer ownership, and transfer it to `MerianSurvey`.
2. Rename the repository to `MerianSurvey.github.io`. The site is then served at https://meriansurvey.github.io/.
3. In Settings, then Pages, check that the source is still the `main` branch, root folder.

No file needs to change, because the site uses relative links throughout.
