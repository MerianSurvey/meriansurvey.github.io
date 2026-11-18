// 5-sigma point-source (PSF) depth in each filter, in AB mag, drawn on the Data page.
// Values as quoted in the Merian DR1 photo-z paper (Luo et al., in prep.):
//   N540, N708: median over the Merian DR1 footprint.
//   g, r, i, z, y: median over the HSC-SSP PDR3 Wide layer (Aihara et al. 2022). r and i are the r2 and i2 filters.
window.MERIAN_DEPTHS = {
  N540: 25.3,
  N708: 24.9,
  g: 26.5,
  r: 26.5,
  i: 26.2,
  z: 25.2,
  y: 24.4
};
