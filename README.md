# The Merian Survey website

A plain HTML/CSS site with no build step. GitHub Pages serves the files exactly as they are.

## Editing

Most updates only touch the small files in `data/`.

| To change | Edit |
| --- | --- |
| Publication list | `data/publications.js` (copy a block, paste it at the top, fill it in) |
| Team roster | `data/team.js` |
| Menu, header, footer | `assets/js/site.js` |
| Text of a page | the matching `.html` file (`index`, `science`, `survey`, `data`, `publications`, `team`) |
| Colors and fonts | the `:root` block at the top of `assets/css/style.css` |

You can edit any of these in the browser on GitHub (open the file, click the pencil). The site updates about a minute after the change is committed.

## Preview on your own machine

```bash
python3 -m http.server 8765
```

Then open http://localhost:8765 in a browser.

## Layout

```
index.html  science.html  survey.html  data.html  publications.html  team.html
assets/css/style.css        all styling
assets/js/site.js           shared header and footer
assets/js/filters-figure.js interactive filter figure on the home page
assets/js/lists.js          renders the publication and team lists
assets/img/                 logo, favicon, galaxy cutouts, star-field background
data/publications.js        publication list
data/team.js                team roster
data/filters.js             measured filter transmission curves (generated, see below)
```

All links inside the site are relative, so it works both at
`https://<user>.github.io/<repo>/` and at the root of a domain.

## Where the content comes from

- Survey facts and numbers: Danieli et al. (arXiv:2410.01884) and Luo et al. (arXiv:2305.19310).
- Science summaries: the abstracts of the papers listed in `data/publications.js`.
- Team roster: copied from the previous survey page (merian.sites.ucsc.edu) on 2026-11-13.
- `data/filters.js`: mean of the 49 laboratory transmission measurements across each filter, resampled to 1 nm.
- Fonts are loaded from Google Fonts (Cormorant Garamond, Source Sans 3, IBM Plex Mono).

## Moving the site to the MerianSurvey organization

1. In the repository on GitHub, go to Settings, then General, then Transfer ownership, and transfer it to `MerianSurvey`.
2. Rename the repository to `MerianSurvey.github.io`. The site is then served at https://meriansurvey.github.io/.
3. In Settings, then Pages, check that the source is still the `main` branch, root folder.

No file needs to change, because the site uses relative links throughout.
