// The Merian team, shown on team.html.
//
// Each person is one line:
//   { name: "...", affiliation: "...", url: "...", photo: "...", role: "..." },
//   url    link for the name (personal or departmental page), "" for none
//   photo  image in assets/img/team/, "" shows the person's initials instead
//   role   optional badge under the name, for example "Builder"
// To add a person, copy a line into a group. To add a group, copy a whole
// { group: "...", people: [ ... ] } block.
//
// Photos were taken from each person's own or departmental page and cropped
// to squares (2026-11-14):
//   Alexie Leauthaud     alexie.sites.ucsc.edu
//   Jenny Greene         collaborate.princeton.edu (Princeton research portal)
//   Shany Danieli        shanydanieli.com
//   Yifei Luo            www.yifei-luo.com
//   Erin Kado-Fong       ekadofong.github.io
//   Song Huang           astro.tsinghua.edu.cn department profile
//   Ting Li              sazabi4.github.io
//   Vivienne Baldassare  viviennebaldassare.com
//   Arka Banerjee        arkabanerjee.github.io
//   Alyson Brooks        physics.rutgers.edu faculty profile
//   Zheng Cai            astro.tsinghua.edu.cn department profile
//   Jim Gunn             web.astro.princeton.edu department profile
//   Stacy Kim            planetarium.osu.edu alumni profile (an older photo)
//   Jiaxuan Li           jiaxuanli.me
//   Mingyu Li            lmytime.com
//   Xiaojing Lin         littlelin1999.github.io
//   Robert Lupton        collaborate.princeton.edu (Princeton research portal)
//   Abby Mintz           abbymintzz.github.io
//   Yue Pan              yuepanexplorer.github.io
//   Annika Peter         astronomy.osu.edu department profile
//   Xavier Prochaska     profxj.github.io
//   Justin Read          surrey.ac.uk staff profile
//   Amy Sardone          steamfactory.osu.edu profile
//   Conghao Zhou         physics.ucsc.edu graduate directory

window.MERIAN_TEAM = [
  {
    group: "Principal investigators",
    people: [
      { name: "Alexie Leauthaud", affiliation: "UC Santa Cruz", url: "https://alexie.sites.ucsc.edu/", photo: "assets/img/team/alexie-leauthaud.jpg" },
      { name: "Jenny Greene", affiliation: "Princeton Univ", url: "https://web.astro.princeton.edu/people/jenny-greene", photo: "assets/img/team/jenny-greene.jpg" }
    ]
  },
  {
    group: "Team members",
    people: [
      { name: "Shany Danieli", affiliation: "Tel Aviv Univ", url: "https://shanydanieli.com/", photo: "assets/img/team/shany-danieli.jpg", role: "Builder" },
      { name: "Yifei Luo", affiliation: "Lawrence Berkeley Lab", url: "https://www.yifei-luo.com/", photo: "assets/img/team/yifei-luo.jpg", role: "Builder" },
      { name: "Erin Kado-Fong", affiliation: "KIPAC, Stanford Univ", url: "https://ekadofong.github.io/", photo: "assets/img/team/erin-kado-fong.jpg", role: "Builder" },
      { name: "Song Huang", affiliation: "Tsinghua Univ", url: "https://dr-guangtou.github.io/", photo: "assets/img/team/song-huang.jpg", role: "Builder" },
      { name: "Ting Li", affiliation: "Univ of Toronto", url: "https://sazabi4.github.io/", photo: "assets/img/team/ting-li.jpg", role: "Builder" },
      { name: "Vivienne Baldassare", affiliation: "Washington State Univ", url: "https://viviennebaldassare.com/", photo: "assets/img/team/vivienne-baldassare.jpg" },
      { name: "Arka Banerjee", affiliation: "IISER Pune", url: "https://arkabanerjee.github.io/", photo: "assets/img/team/arka-banerjee.jpg" },
      { name: "Alyson Brooks", affiliation: "Rutgers Univ", url: "https://www.physics.rutgers.edu/~abrooks/", photo: "assets/img/team/alyson-brooks.jpg" },
      { name: "Zheng Cai", affiliation: "Tsinghua Univ", url: "https://i.astro.tsinghua.edu.cn/~zcai/", photo: "assets/img/team/zheng-cai.jpg" },
      { name: "Jim Gunn", affiliation: "Princeton Univ", url: "https://web.astro.princeton.edu/people/james-gunn", photo: "assets/img/team/jim-gunn.jpg" },
      { name: "Benjamin Johnson", affiliation: "Center for Astrophysics | Harvard & Smithsonian", url: "https://bd-j.github.io/", photo: "" },
      { name: "Lee Kelvin", affiliation: "Princeton Univ", url: "https://web.astro.princeton.edu/people/lee-kelvin", photo: "" },
      { name: "Stacy Kim", affiliation: "Carnegie Observatories", url: "https://stacykim.github.io/", photo: "assets/img/team/stacy-kim.jpg" },
      { name: "Jiaxuan Li", affiliation: "KIPAC, Stanford Univ", url: "https://jiaxuanli.me/", photo: "assets/img/team/jiaxuan-li.jpg" },
      { name: "Mingyu Li", affiliation: "Tsinghua Univ", url: "https://lmytime.com/", photo: "assets/img/team/mingyu-li.jpg" },
      { name: "Xiaojing Lin", affiliation: "Tsinghua Univ", url: "https://littlelin1999.github.io/", photo: "assets/img/team/xiaojing-lin.jpg" },
      { name: "Robert Lupton", affiliation: "Princeton Univ", url: "https://collaborate.princeton.edu/en/persons/robert-hugh-lupton/", photo: "assets/img/team/robert-lupton.jpg" },
      { name: "Abby Mintz", affiliation: "Princeton Univ", url: "https://abbymintzz.github.io/", photo: "assets/img/team/abby-mintz.jpg" },
      { name: "Yue Pan", affiliation: "Princeton Univ", url: "https://yuepanexplorer.github.io/", photo: "assets/img/team/yue-pan.jpg" },
      { name: "Annika Peter", affiliation: "Ohio State Univ", url: "https://u.osu.edu/apeter/", photo: "assets/img/team/annika-peter.jpg" },
      { name: "X. Prochaska", affiliation: "UC Santa Cruz", url: "https://profxj.github.io/", photo: "assets/img/team/xavier-prochaska.jpg" },
      { name: "Justin Read", affiliation: "Univ of Surrey", url: "https://www.surrey.ac.uk/people/justin-read", photo: "assets/img/team/justin-read.jpg" },
      { name: "Amy Sardone", affiliation: "Ohio State Univ", url: "https://steamfactory.osu.edu/people/sardone.4", photo: "assets/img/team/amy-sardone.jpg" },
      { name: "Conghao Zhou", affiliation: "UC Santa Cruz", url: "https://zch.info/", photo: "assets/img/team/conghao-zhou.jpg" }
    ]
  }
];
