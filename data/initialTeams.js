

const initialTeamsRandom = [
  {
    name: 'Team 1',
    players: Array.from({ length: 11 }, (_, i) => ({
      name: `Player ${i + 1}`,
      attack: Math.floor(Math.random() * 100),
      defense: Math.floor(Math.random() * 100),
      goalkeeper: Math.floor(Math.random() * 100),
    })),
  },
  {
    name: 'Team 2',
    players: Array.from({ length: 11 }, (_, i) => ({
      name: `Player ${i + 1}`,
      attack: Math.floor(Math.random() * 100),
      defense: Math.floor(Math.random() * 100),
      goalkeeper: Math.floor(Math.random() * 100),
    })),
  },
  // 6 takım daha aynı şekilde eklenebilir.
];

const initialTeams = [
  {
    name: 'Galatasaray',
    players: [
      { name: 'Fernando Muslera', attack: 10, defense: 90, goalkeeper: 95 },
      { name: "Berkan Kutlu", attack: 65, defense: 70, goalkeeper: 10 },
      { name: "Elias Jeller", attack: 50, defense: 75, goalkeeper: 10 },
      { name: "Davıdson Sanchez", attack: 50, defense: 75, goalkeeper: 10 },
      { name: 'Abdülkerim Bardakcı', attack: 50, defense: 75, goalkeeper: 10 },
      { name: 'Lucas Torreira', attack: 60, defense: 80, goalkeeper: 10 },
      { name: 'Dries Mertens', attack: 85, defense: 60, goalkeeper: 10 },
      { name: 'Gabriel Sara', attack: 80, defense: 60, goalkeeper: 10 },
      { name: 'Maxi Gómez', attack: 80, defense: 50, goalkeeper: 10 },
      { name: 'Mauro Icardi', attack: 90, defense: 50, goalkeeper: 10 },
      { name: 'Michy Batshuayi', attack: 80, defense: 50, goalkeeper: 10 },
      { name: "Vıctor Osimhen", attack: 85, defense: 50, goalkeeper: 10 },
    ],
  },
  {
    name: 'Fenerbahçe',
    players: [
      { name: 'Dominik Livaković', attack: 10, defense: 85, goalkeeper: 90 },
      { name: 'Bright Osayi-Samuel', attack: 70, defense: 65, goalkeeper: 10 },
      { name: 'Rodrigo Becão', attack: 50, defense: 80, goalkeeper: 10 },
      { name: 'Alexander Djiku', attack: 50, defense: 75, goalkeeper: 10 },
      { name: 'Jayden Oosterwolde', attack: 60, defense: 70, goalkeeper: 10 },
      { name: 'Fred', attack: 75, defense: 70, goalkeeper: 10 },
      { name: 'Sebastian Szymański', attack: 80, defense: 65, goalkeeper: 10 },
      { name: 'Dušan Tadić', attack: 85, defense: 60, goalkeeper: 10 },
      { name: 'Ryan Kent', attack: 80, defense: 60, goalkeeper: 10 },
      { name: 'Edin Džeko', attack: 85, defense: 50, goalkeeper: 10 },
      { name: 'Youssef En-Nesyri', attack: 85, defense: 50, goalkeeper: 10 },
    ],
  },
  {
    name: 'Beşiktaş',
    players: [
      { name: 'Mert Günok', attack: 10, defense: 80, goalkeeper: 85 },
      { name: 'Valentin Rosier', attack: 65, defense: 70, goalkeeper: 10 },
      { name: 'Omar Colley', attack: 50, defense: 75, goalkeeper: 10 },
      { name: 'Daniel Amartey', attack: 50, defense: 75, goalkeeper: 10 },
      { name: 'Arthur Masuaku', attack: 60, defense: 65, goalkeeper: 10 },
      { name: 'Gedson Fernandes', attack: 75, defense: 70, goalkeeper: 10 },
      { name: 'Amir Hadžiahmetović', attack: 70, defense: 70, goalkeeper: 10 },
      { name: 'Rachid Ghezzal', attack: 80, defense: 60, goalkeeper: 10 },
      { name: 'Alex Oxlade-Chamberlain', attack: 75, defense: 60, goalkeeper: 10 },
      { name: 'Ciro Immobile', attack: 85, defense: 50, goalkeeper: 10 },
      { name: 'Semih Kılıçsoy', attack: 85, defense: 50, goalkeeper: 10 },
    ],
  },
  {
    name: 'Trabzonspor',
    players: [
      { name: 'Uğurcan Çakır', attack: 10, defense: 85, goalkeeper: 90 },
      { name: 'Jens Stryger Larsen', attack: 65, defense: 70, goalkeeper: 10 },
      { name: 'Stefano Denswil', attack: 50, defense: 75, goalkeeper: 10 },
      { name: 'Filip Benković', attack: 50, defense: 75, goalkeeper: 10 },
      { name: 'Eren Elmalı', attack: 60, defense: 65, goalkeeper: 10 },
      { name: 'Anastasios Bakasetas', attack: 80, defense: 60, goalkeeper: 10 },
      { name: 'Enis Bardhi', attack: 75, defense: 60, goalkeeper: 10 },
      { name: 'Edin Višća', attack: 80, defense: 60, goalkeeper: 10 },
      { name: 'Mislav Oršić', attack: 80, defense: 60, goalkeeper: 10 },
      { name: 'Paul Onuachu', attack: 85, defense: 50, goalkeeper: 10 },
      { name: 'Maxi Gómez', attack: 80, defense: 50, goalkeeper: 10 },
    ],
  },
  {
    name: 'Başakşehir',
    players: [
      { name: 'Volkan Babacan', attack: 10, defense: 80, goalkeeper: 85 },
      { name: 'Léo Dubois', attack: 65, defense: 70, goalkeeper: 10 },
      { name: 'Ousseynou Ba', attack: 50, defense: 75, goalkeeper: 10 },
      { name: 'Léo Duarte', attack: 50, defense: 75, goalkeeper: 10 },
      { name: 'Lucas Lima', attack: 60, defense: 65, goalkeeper: 10 },
      { name: 'Souza', attack: 70, defense: 70, goalkeeper: 10 },
      { name: 'Olivier Kemen', attack: 70, defense: 70, goalkeeper: 10 },
      { name: 'Krzysztof Piątek', attack: 85, defense: 50, goalkeeper: 10 },
      { name: 'Danijel Aleksić', attack: 75, defense: 60, goalkeeper: 10 },
      { name: 'Philippe Keny', attack: 80, defense: 50, goalkeeper: 10 },
      { name: 'Emmanuel Dennis', attack: 80, defense: 50, goalkeeper: 10 },
    ],
  },
  {
    name: 'Göztepe',
    players: [
      { name: 'İrfan Can Eğribayat', attack: 10, defense: 80, goalkeeper: 85 },
      { name: 'Murat Paluli', attack: 65, defense: 70, goalkeeper: 10 },
      { name: 'Alpaslan Öztürk', attack: 50, defense: 75, goalkeeper: 10 },
      { name: 'Atınç Nukan', attack: 50, defense: 75, goalkeeper: 10 },
      { name: 'Berkan Emir', attack: 60, defense: 65, goalkeeper: 10 },
      { name: 'Sonny Kittel', attack: 70, defense: 70, goalkeeper: 10 },
      { name: 'Obinna Nwobodo', attack: 70, defense: 70, goalkeeper: 10 },
      { name: 'Halil Akbunar', attack: 80, defense: 60, goalkeeper: 10 },
      { name: 'Adis Jahović', attack: 75, defense: 60, goalkeeper: 10 },
      { name: 'Cyle Larin', attack: 80, defense: 50, goalkeeper: 10 },
      { name: 'Stefano Okaka', attack: 80, defense: 50, goalkeeper: 10 },
    ],
  },
  {
    name: 'Alanyaspor',
    players: [
      { name: 'Marafona', attack: 10, defense: 80, goalkeeper: 85 },
      { name: 'Juanfran', attack: 65, defense: 70, goalkeeper: 10 },
      { name: 'Steven Caulker', attack: 50, defense: 75, goalkeeper: 10 },
      { name: 'Georgios Tzavellas', attack: 50, defense: 75, goalkeeper: 10 },
      { name: 'Franck Yannick Kessié', attack: 60, defense: 65, goalkeeper: 10 },
      { name: 'Berkan Kutlu', attack: 70, defense: 70, goalkeeper: 10 },
      { name: 'Manolis Siopis', attack: 70, defense: 70, goalkeeper: 10 },
      { name: 'David Pavelka', attack: 80, defense: 60, goalkeeper: 10 },
      { name: 'Salih Uçan', attack: 75, defense: 60, goalkeeper: 10 },
      { name: 'Khouma Babacar', attack: 80, defense: 50, goalkeeper: 10 },
      { name: 'Adam Bareiro', attack: 80, defense: 50, goalkeeper: 10 },
    ],
  },
  {
    name: 'Antalyaspor',
    players: [
      { name: 'Ferhat Kaplan', attack: 10, defense: 80, goalkeeper: 85 },
      { name: 'Eren Albayrak', attack: 65, defense: 70, goalkeeper: 10 },
      { name: 'Veysel Sarı', attack: 50, defense: 75, goalkeeper: 10 },
      { name: 'Naldo', attack: 50, defense: 75, goalkeeper: 10 },
      { name: 'Fernando', attack: 60, defense: 65, goalkeeper: 10 },
      { name: 'Ufuk Akyol', attack: 70, defense: 70, goalkeeper: 10 },
      { name: 'Hakan Özmert', attack: 70, defense: 70, goalkeeper: 10 },
      { name: 'Amilton', attack: 80, defense: 60, goalkeeper: 10 },
      { name: 'Fredy', attack: 75, defense: 60, goalkeeper: 10 },
      { name: 'Gökdeniz Bayrakdar', attack: 80, defense: 50, goalkeeper: 10 },
      { name: 'Adem Büyük', attack: 80, defense: 50, goalkeeper: 10 },
    ],
  }
  // 10 takım daha aynı şekilde eklenebilir.
];


module.exports = initialTeams;