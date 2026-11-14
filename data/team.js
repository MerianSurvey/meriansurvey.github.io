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
// Names and affiliations come from the previous survey page
// (merian.sites.ucsc.edu, copied 2026-11-13); some may be out of date.
//
// Photos were taken on 2026-11-14 from each person's own or departmental
// page and cropped to squares:
//   Alexie Leauthaud     alexie.sites.ucsc.edu
//   Jenny Greene         collaborate.princeton.edu (Princeton research portal)
//   Shany Danieli        shanydanieli.com
//   Yifei Luo            www.yifei-luo.com
//   Vivienne Baldassare  viviennebaldassare.com
//   Arka Banerjee        arkabanerjee.github.io
//   Alyson Brooks        physics.rutgers.edu faculty profile
//   Zheng Cai            astro.tsinghua.edu.cn department profile
//   Song Huang           astro.tsinghua.edu.cn department profile
//   Erin Kado-Fong       ekadofong.github.io
//   Stacy Kim            planetarium.osu.edu alumni profile (an older photo)
//   Ting Li              sazabi4.github.io
//   Robert Lupton        collaborate.princeton.edu (Princeton research portal)
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
      { name: "Jenny Greene", affiliation: "Princeton", url: "https://web.astro.princeton.edu/people/jenny-greene", photo: "assets/img/team/jenny-greene.jpg" }
    ]
  },
  {
    group: "Team members",
    people: [
      { name: "Shany Danieli", affiliation: "Tel Aviv", url: "https://shanydanieli.com/", photo: "assets/img/team/shany-danieli.jpg", role: "Builder" },
      { name: "Yifei Luo", affiliation: "LBNL", url: "https://www.yifei-luo.com/", photo: "assets/img/team/yifei-luo.jpg", role: "Builder" },
      { name: "Vivienne Baldassare", affiliation: "Washington State", url: "https://viviennebaldassare.com/", photo: "assets/img/team/vivienne-baldassare.jpg" },
      { name: "Arka Banerjee", affiliation: "U. Chicago", url: "https://arkabanerjee.github.io/", photo: "assets/img/team/arka-banerjee.jpg" },
      { name: "Alyson Brooks", affiliation: "Rutgers", url: "https://www.physics.rutgers.edu/~abrooks/", photo: "assets/img/team/alyson-brooks.jpg" },
      { name: "Zheng Cai", affiliation: "Tsinghua", url: "https://i.astro.tsinghua.edu.cn/~zcai/", photo: "assets/img/team/zheng-cai.jpg" },
      { name: "Jim Gunn", affiliation: "Princeton", url: "https://web.astro.princeton.edu/people/james-gunn", photo: "" },
      { name: "Song Huang", affiliation: "Tsinghua", url: "https://dr-guangtou.github.io/", photo: "assets/img/team/song-huang.jpg" },
      { name: "Ben Johnston", affiliation: "Harvard", url: "", photo: "" },
      { name: "Erin Kado-Fong", affiliation: "KIPAC", url: "https://ekadofong.github.io/", photo: "assets/img/team/erin-kado-fong.jpg" },
      { name: "Stacy Kim", affiliation: "University of Surrey", url: "https://stacykim.github.io/", photo: "assets/img/team/stacy-kim.jpg" },
      { name: "Ting Li", affiliation: "U. Toronto", url: "https://sazabi4.github.io/", photo: "assets/img/team/ting-li.jpg" },
      { name: "Robert Lupton", affiliation: "Princeton", url: "https://collaborate.princeton.edu/en/persons/robert-hugh-lupton/", photo: "assets/img/team/robert-lupton.jpg" },
      { name: "Annika Peter", affiliation: "Ohio State", url: "https://u.osu.edu/apeter/", photo: "assets/img/team/annika-peter.jpg" },
      { name: "X. Prochaska", affiliation: "UC Santa Cruz", url: "https://profxj.github.io/", photo: "assets/img/team/xavier-prochaska.jpg" },
      { name: "Justin Read", affiliation: "University of Surrey", url: "https://www.surrey.ac.uk/people/justin-read", photo: "assets/img/team/justin-read.jpg" },
      { name: "Amy Sardone", affiliation: "Ohio State", url: "https://steamfactory.osu.edu/people/sardone.4", photo: "assets/img/team/amy-sardone.jpg" },
      { name: "Conghao Zhou", affiliation: "UC Santa Cruz", url: "https://zch.info/", photo: "assets/img/team/conghao-zhou.jpg" }
    ]
  }
];
