// Merian publications, newest first.
//
// To add a paper, copy one block (from "{" to "},"), paste it at the top of the
// list and fill it in. Leave a field as "" if it does not apply yet, for example
// the journal of a paper that is still under review. Once a paper is published,
// switch the title, year and journal to the published version and add the DOI.
//
//   year     publication year (arXiv year until it is published)
//   title    full title, as published
//   authors  first few authors, then "et al."
//   journal  journal, volume and page once published
//   arxiv    arXiv number, for example "2410.01884"
//   doi      DOI of the published version (the title then links there)
//   survey   true for the survey papers, which get their own block on the
//            publications page
//   kind     optional short label, for example "Forecast"
//
// Published versions checked on SciX and Crossref on 2026-11-14.

window.MERIAN_PUBLICATIONS = [
  {
    year: 2026,
    title: "The Merian Survey: A Statistical Census of Bright Satellites of Sub-Milky Way-Mass Galaxies",
    authors: "L. S. Mandacarú Guerra, J. Li, Y. Pan, J. E. Greene, S. Danieli, et al.",
    journal: "",
    arxiv: "2610.03981",
    doi: "",
    survey: false,
    kind: ""
  },
  {
    year: 2026,
    title: "Galaxies Below the Fundamental Metallicity Relation Are Morphologically Disturbed: Merian Hα Morphologies and DESI Metallicities",
    authors: "A. Mintz, J. E. Greene, S. Danieli, E. Kado-Fong, A. Leauthaud, et al.",
    journal: "",
    arxiv: "2609.26887",
    doi: "",
    survey: false,
    kind: ""
  },
  {
    year: 2026,
    title: "The Merian Survey: A Statistical Census of Bright Satellites of Milky Way Analogs",
    authors: "Y. Pan, S. Danieli, J. E. Greene, J. Li, A. Leauthaud, et al.",
    journal: "The Astrophysical Journal, 1000, 119",
    arxiv: "2512.12846",
    doi: "10.3847/1538-4357/ae42cb",
    survey: false,
    kind: ""
  },
  {
    year: 2025,
    title: "First Data Release of the Merian Survey: A Wide-field Imaging Survey of Dwarf Galaxies at z ∼ 0.06–0.10",
    authors: "S. Danieli, E. Kado-Fong, S. Huang, Y. Luo, T. S. Li, et al.",
    journal: "The Astrophysical Journal, 993, 110",
    arxiv: "2410.01884",
    doi: "10.3847/1538-4357/ae003e",
    survey: true,
    kind: ""
  },
  {
    year: 2024,
    title: "A Nonparametric Morphological Analysis of Hα Emission in Bright Dwarfs Using the Merian Survey",
    authors: "A. Mintz, J. E. Greene, E. Kado-Fong, S. Danieli, J. Li, et al.",
    journal: "The Astrophysical Journal, 974, 273",
    arxiv: "2410.01886",
    doi: "10.3847/1538-4357/ad6861",
    survey: false,
    kind: ""
  },
  {
    year: 2024,
    title: "The Merian survey: design, construction, and characterization of a filter set optimized to find dwarf galaxies and measure their dark matter halo properties with weak lensing",
    authors: "Y. Luo, A. Leauthaud, J. Greene, S. Huang, E. Kado-Fong, et al.",
    journal: "Monthly Notices of the Royal Astronomical Society, 530, 4988",
    arxiv: "2305.19310",
    doi: "10.1093/mnras/stae925",
    survey: true,
    kind: ""
  },
  {
    year: 2020,
    title: "Deep+wide lensing surveys can measure the dark matter halos of dwarf galaxies",
    authors: "A. Leauthaud, S. Singh, Y. Luo, F. Ardila, et al.",
    journal: "Physics of the Dark Universe, 30, 100719",
    arxiv: "1905.01433",
    doi: "10.1016/j.dark.2020.100719",
    survey: false,
    kind: "Forecast"
  }
];
