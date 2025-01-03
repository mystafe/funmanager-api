
const initialTeams = [
  {
    name: 'Galatasaray',
    players: [
      { name: 'Fernando Muslera', position: 'Goalkeeper', attack: 10, defense: 90, goalkeeper: 95, wage: 200000, contractEnd: 2027, value: 2000000, age: 35, stamina: 90 },
      { name: 'Günay Güvenç', position: 'Goalkeeper', attack: 10, defense: 80, goalkeeper: 85, wage: 150000, contractEnd: 2027, value: 1500000, age: 30, stamina: 90 },
      { name: 'Kaan Ayhan', position: 'Defence', attack: 60, defense: 85, goalkeeper: 10, wage: 700000, contractEnd: 2028, value: 800000, age: 28, stamina: 80 },
      { name: 'Roland Sallai', position: 'Defence', attack: 60, defense: 85, goalkeeper: 10, wage: 700000, contractEnd: 2028, value: 800000, age: 28, stamina: 80 },
      { name: "Berkan Kutlu", position: 'Defence', attack: 65, defense: 75, goalkeeper: 10, wage: 700000, contractEnd: 2028, value: 800000, age: 28, stamina: 80 },
      { name: "Metehan Baltacı", position: 'Defence', attack: 60, defense: 80, goalkeeper: 10, wage: 700000, contractEnd: 2028, value: 800000, age: 28, stamina: 80 },
      { name: 'Ismael Jacobs', position: 'Defence', attack: 60, defense: 80, goalkeeper: 10, wage: 700000, contractEnd: 2028, value: 800000, age: 28, stamina: 80 },
      { name: "Elias Jeller", position: 'Defence', attack: 50, defense: 75, goalkeeper: 10, wage: 500000, contractEnd: 2028, value: 600000, age: 25, stamina: 80 },
      { name: "Davıdson Sanchez", position: 'Defence', attack: 60, defense: 90, goalkeeper: 10, wage: 700000, contractEnd: 2028, value: 800000, age: 25, stamina: 80 },
      { name: 'Abdülkerim Bardakcı', position: 'Defence', attack: 50, defense: 90, goalkeeper: 10, wage: 600000, contractEnd: 2028, value: 700000, age: 25, stamina: 80 },
      { name: 'Victor Nelsson', position: 'Defence', attack: 60, defense: 85, goalkeeper: 10, wage: 700000, contractEnd: 2028, value: 800000, age: 25, stamina: 80 },
      { name: 'Yusuf Demir', position: 'Midfield', attack: 80, defense: 70, goalkeeper: 10, wage: 800000, contractEnd: 2028, value: 900000, age: 25, stamina: 80 },
      { name: 'Lucas Torreira', position: 'Midfield', attack: 60, defense: 80, goalkeeper: 10, wage: 800000, contractEnd: 2028, value: 900000, age: 25, stamina: 80 },
      { name: 'Dries Mertens', position: 'Midfield', attack: 85, defense: 60, goalkeeper: 10, wage: 900000, contractEnd: 2028, value: 1000000, age: 25, stamina: 80 },
      { name: 'Gabriel Sara', position: 'Midfield', attack: 80, defense: 60, goalkeeper: 10, wage: 850000, contractEnd: 2028, value: 950000, age: 25, stamina: 80 },
      { name: 'Yunus Akgün', position: 'Midfield', attack: 85, defense: 60, goalkeeper: 10, wage: 950000, contractEnd: 2028, value: 1100000, age: 25, stamina: 80 },
      { name: 'Kerem Demirbay', position: 'Midfield', attack: 90, defense: 60, goalkeeper: 10, wage: 1200000, contractEnd: 2028, value: 1500000, age: 25, stamina: 80 },
      { name: 'Barış Alper Yılmaz', position: 'Midfield', attack: 85, defense: 60, goalkeeper: 10, wage: 950000, contractEnd: 2028, value: 1100000, age: 25, stamina: 80 },
      { name: 'Mauro Icardi', position: 'Forward', attack: 94, defense: 60, goalkeeper: 10, wage: 1200000, contractEnd: 2028, value: 1500000, age: 25, stamina: 80 },
      { name: 'Michy Batshuayi', position: 'Forward', attack: 85, defense: 55, goalkeeper: 10, wage: 950000, contractEnd: 2028, value: 1100000, age: 25, stamina: 80 },
      { name: "Victor Osimhen", position: 'Forward', attack: 99, defense: 65, goalkeeper: 10, wage: 1100000, contractEnd: 2028, value: 1300000, age: 25, stamina: 80 },
    ],
    stadium: {
      name: 'Türk Telekom Arena',
      level: 5,
      stadiumCapacity: 52627,
      city: 'Istanbul',
    },
    country: 'Turkiye',
    trainingFacilityLevel: 5,
    youthFacilityLevel: 5,
    academyFacilityLevel: 5,
    reputation: 5,
    fans: 30000000,
    balance: 1000000000,
    expenses: 70000000,
    income: 90000000,
    defaultTactic: '3-4-3',
    enteredCompetitions: ['Süper Lig', 'Champions League'],

  },
  {
    name: 'Fenerbahçe',
    players: [
      { name: 'Dominik Livaković', position: 'Goalkeeper', attack: 10, defense: 85, goalkeeper: 90, wage: 1000000, contractEnd: 2028, value: 1200000, age: 25, stamina: 80 },
      { name: 'Bright Osayi-Samuel', position: 'Defence', attack: 70, defense: 65, goalkeeper: 10, wage: 500000, contractEnd: 2028, value: 600000, age: 25, stamina: 80 },
      { name: 'Rodrigo Becão', position: 'Defence', attack: 50, defense: 80, goalkeeper: 10, wage: 600000, contractEnd: 2028, value: 700000, age: 25, stamina: 80 },
      { name: 'Alexander Djiku', position: 'Defence', attack: 50, defense: 75, goalkeeper: 10, wage: 550000, contractEnd: 2028, value: 650000, age: 25, stamina: 80 },
      { name: 'Jayden Oosterwolde', position: 'Defence', attack: 60, defense: 70, goalkeeper: 10, wage: 500000, contractEnd: 2028, value: 600000, age: 25, stamina: 80 },
      { name: 'Fred', position: 'Midfield', attack: 70, defense: 70, goalkeeper: 10, wage: 800000, contractEnd: 2028, value: 900000, age: 25, stamina: 80 },
      { name: 'Mert Hakan Yandaş', position: 'Midfield', attack: 70, defense: 70, goalkeeper: 10, wage: 750000, contractEnd: 2028, value: 850000, age: 25, stamina: 80 },
      { name: 'Irfan Kahveci', position: 'Midfield', attack: 60, defense: 60, goalkeeper: 10, wage: 700000, contractEnd: 2028, value: 800000, age: 25, stamina: 80 },
      { name: 'Sebastian Szymański', position: 'Midfield', attack: 70, defense: 65, goalkeeper: 10, wage: 750000, contractEnd: 2028, value: 850000, age: 25, stamina: 80 },
      { name: 'Dušan Tadić', position: 'Midfield', attack: 75, defense: 60, goalkeeper: 10, wage: 900000, contractEnd: 2028, value: 1000000, age: 25, stamina: 80 },
      { name: 'Ryan Kent', position: 'Forward', attack: 70, defense: 60, goalkeeper: 10, wage: 700000, contractEnd: 2028, value: 800000, age: 25, stamina: 80 },
      { name: 'Edin Džeko', position: 'Forward', attack: 80, defense: 50, goalkeeper: 10, wage: 950000, contractEnd: 2028, value: 1100000, age: 25, stamina: 80 },
      { name: 'Youssef En-Nesyri', position: 'Forward', attack: 80, defense: 50, goalkeeper: 10, wage: 850000, contractEnd: 2028, value: 1000000, age: 25, stamina: 80 },
    ],
    stadium: {
      name: 'Şükrü Saracoğlu Stadium',
      level: 4,
      stadiumCapacity: 47000,
      city: 'Istanbul',
    },
    country: 'Turkiye',
    trainingFacilityLevel: 4,
    youthFacilityLevel: 3,
    reputation: 4,
    fans: 25000000,
    balance: 900000000,
    expenses: 55000000,
    income: 60000000,
    enteredCompetitions: ['Süper Lig', 'European League'],
    defaultTactic: '4-3-3',

  },
  {
    name: 'Beşiktaş',
    players: [
      { name: 'Mert Günok', position: 'Goalkeeper', attack: 10, defense: 80, goalkeeper: 85, wage: 900000, contractEnd: 2028, value: 1000000, age: 25, stamina: 80 },
      { name: 'Valentin Rosier', position: 'Defence', attack: 65, defense: 70, goalkeeper: 10, wage: 500000, contractEnd: 2028, value: 600000, age: 25, stamina: 80 },
      { name: 'Omar Colley', position: 'Defence', attack: 50, defense: 75, goalkeeper: 10, wage: 600000, contractEnd: 2028, value: 700000, age: 25, stamina: 80 },
      { name: 'Daniel Amartey', position: 'Defence', attack: 50, defense: 75, goalkeeper: 10, wage: 550000, contractEnd: 2028, value: 650000, age: 25, stamina: 80 },
      { name: 'Romain Perraud', position: 'Defence', attack: 60, defense: 70, goalkeeper: 10, wage: 500000, contractEnd: 2028, value: 600000, age: 25, stamina: 80 },
      { name: 'Arthur Masuaku', position: 'Defence', attack: 60, defense: 65, goalkeeper: 10, wage: 500000, contractEnd: 2028, value: 600000, age: 25, stamina: 80 },
      { name: 'Gedson Fernandes', position: 'Midfield', attack: 75, defense: 70, goalkeeper: 10, wage: 800000, contractEnd: 2028, value: 900000, age: 25, stamina: 80 },
      { name: 'Amir Hadžiahmetović', position: 'Midfield', attack: 70, defense: 70, goalkeeper: 10, wage: 750000, contractEnd: 2028, value: 850000, age: 25, stamina: 80 },
      { name: 'Rachid Ghezzal', position: 'Midfield', attack: 80, defense: 60, goalkeeper: 10, wage: 700000, contractEnd: 2028, value: 800000, age: 25, stamina: 80 },
      { name: 'Mohamed Elneny', position: 'Midfield', attack: 80, defense: 60, goalkeeper: 10, wage: 750000, contractEnd: 2028, value: 850000, age: 25, stamina: 80 },
      { name: 'Alex Oxlade-Chamberlain', position: 'Midfield', attack: 75, defense: 60, goalkeeper: 10, wage: 850000, contractEnd: 2028, value: 950000, age: 25, stamina: 80 },
      { name: 'Ciro Immobile', position: 'Forward', attack: 85, defense: 50, goalkeeper: 10, wage: 950000, contractEnd: 2028, value: 1100000, age: 25, stamina: 80 },
      { name: 'Semih Kılıçsoy', position: 'Forward', attack: 85, defense: 50, goalkeeper: 10, wage: 850000, contractEnd: 2028, value: 1000000, age: 25, stamina: 80 },
    ],
    stadium: {
      name: 'Vodafone Park',
      level: 4,
      stadiumCapacity: 42000,
      city: 'Istanbul',
    },
    country: 'Turkiye',
    trainingFacilityLevel: 4,
    youthFacilityLevel: 4,
    reputation: 4,
    fans: 15000000,
    balance: 500000000,
    expenses: 35000000,
    income: 40000000,
    enteredCompetitions: ['Süper Lig', 'European League'],
    defaultTactic: '4-4-2',
  },
  {
    name: 'Trabzonspor',
    players: [
      { name: 'Uğurcan Çakır', position: 'Goalkeeper', attack: 10, defense: 80, goalkeeper: 85, wage: 800000, contractEnd: 2028, value: 900000, age: 25, stamina: 80 },
      { name: 'Jens Stryger Larsen', position: 'Defence', attack: 65, defense: 70, goalkeeper: 10, wage: 500000, contractEnd: 2028, value: 600000, age: 25, stamina: 80 },
      { name: 'Stefano Denswil', position: 'Defence', attack: 50, defense: 75, goalkeeper: 10, wage: 600000, contractEnd: 2028, value: 700000, age: 25, stamina: 80 },
      { name: 'Filip Benković', position: 'Defence', attack: 50, defense: 75, goalkeeper: 10, wage: 550000, contractEnd: 2028, value: 650000, age: 25, stamina: 80 },
      { name: 'Eren Elmalı', position: 'Defence', attack: 60, defense: 65, goalkeeper: 10, wage: 500000, contractEnd: 2028, value: 600000, age: 25, stamina: 80 },
      { name: 'Anastasios Bakasetas', position: 'Midfield', attack: 80, defense: 60, goalkeeper: 10, wage: 800000, contractEnd: 2028, value: 900000, age: 25, stamina: 80 },
      { name: 'Enis Bardhi', position: 'Midfield', attack: 75, defense: 60, goalkeeper: 10, wage: 750000, contractEnd: 2028, value: 850000, age: 25, stamina: 80 },
      { name: 'Josip Iličić', position: 'Midfield', attack: 80, defense: 60, goalkeeper: 10, wage: 700000, contractEnd: 2028, value: 800000, age: 25, stamina: 80 },
      { name: 'Edin Višća', position: 'Midfield', attack: 80, defense: 60, goalkeeper: 10, wage: 700000, contractEnd: 2028, value: 800000, age: 25, stamina: 80 },
      { name: 'Mislav Oršić', position: 'Midfield', attack: 80, defense: 60, goalkeeper: 10, wage: 850000, contractEnd: 2028, value: 950000, age: 25, stamina: 80 },
      { name: 'Paul Onuachu', position: 'Forward', attack: 85, defense: 50, goalkeeper: 10, wage: 950000, contractEnd: 2028, value: 1100000, age: 25, stamina: 80 },
      { name: 'Maxi Gómez', position: 'Forward', attack: 80, defense: 50, goalkeeper: 10, wage: 850000, contractEnd: 2028, value: 1000000, age: 25, stamina: 80 },
    ],
    stadium: {
      name: 'Medical Park Stadium',
      level: 4,
      stadiumCapacity: 41000,
      city: 'Trabzon',
    },
    country: 'Turkiye',
    trainingFacilityLevel: 3,
    youthFacilityLevel: 4,
    reputation: 1,
    fans: 10000000,
    balance: 60000000,
    expenses: 50000000,
    income: 60000000,
    defaultTactic: '4-4-2',

  },
  {
    name: 'Başakşehir',
    players: [
      { name: 'Volkan Babacan', position: 'Goalkeeper', attack: 10, defense: 80, goalkeeper: 85, wage: 900000, contractEnd: 2028, value: 600000, age: 25, stamina: 80 },
      { name: 'Léo Dubois', position: 'Defence', attack: 65, defense: 70, goalkeeper: 10, wage: 500000, contractEnd: 2028, value: 600000, age: 25, stamina: 80 },
      { name: 'Ousseynou Ba', position: 'Defence', attack: 50, defense: 75, goalkeeper: 10, wage: 600000, contractEnd: 2028, value: 600000, age: 25, stamina: 80 },
      { name: 'Léo Duarte', position: 'Defence', attack: 50, defense: 75, goalkeeper: 10, wage: 550000, contractEnd: 2028, value: 600000, age: 25, stamina: 80 },
      { name: 'Lucas Lima', position: 'Defence', attack: 60, defense: 65, goalkeeper: 10, wage: 500000, contractEnd: 2028, value: 600000, age: 25, stamina: 80 },
      { name: 'Souza', position: 'Midfield', attack: 70, defense: 70, goalkeeper: 10, wage: 800000, contractEnd: 2028, value: 600000, age: 25, stamina: 80 },
      { name: 'Mahmut Tekdemir', position: 'Midfield', attack: 75, defense: 60, goalkeeper: 10, wage: 750000, contractEnd: 2028, value: 600000, age: 25, stamina: 80 },
      { name: 'Olivier Kemen', position: 'Midfield', attack: 70, defense: 70, goalkeeper: 10, wage: 750000, contractEnd: 2028, value: 600000, age: 25, stamina: 80 },
      { name: 'Krzysztof Piątek', position: 'Forward', attack: 85, defense: 50, goalkeeper: 10, wage: 850000, contractEnd: 2028, value: 600000, age: 25, stamina: 80 },
      { name: 'Danijel Aleksić', position: 'Midfield', attack: 75, defense: 60, goalkeeper: 10, wage: 700000, contractEnd: 2028, value: 600000, age: 25, stamina: 80 },
      { name: 'Philippe Keny', position: 'Forward', attack: 80, defense: 50, goalkeeper: 10, wage: 800000, contractEnd: 2028, value: 600000, age: 25, stamina: 80 },
      { name: 'Emmanuel Dennis', position: 'Forward', attack: 80, defense: 50, goalkeeper: 10, wage: 850000, contractEnd: 2028, value: 600000, age: 25, stamina: 80 },
    ],
    stadium: {
      name: 'Başakşehir Fatih Terim Stadium',
      stadiumCapacity: 17319,
      city: 'Istanbul',
    },
    country: 'Turkiye',
    trainingFacilityLevel: 3,
    youthFacilityLevel: 4,
    reputation: 1,
    fans: 100000,
    balance: 40000000,
    expenses: 20000000,
    income: 30000000,
    defaultTactic: '4-4-2',
  },
  {
    name: 'Göztepe',
    players: [
      { name: 'İrfan Can Eğribayat', position: 'Goalkeeper', attack: 10, defense: 80, goalkeeper: 85, wage: 900000, contractEnd: 2028, value: 600000, age: 25, stamina: 80 },
      { name: 'Murat Paluli', position: 'Defence', attack: 65, defense: 70, goalkeeper: 10, wage: 500000, contractEnd: 2028, value: 600000, age: 25, stamina: 80 },
      { name: 'Alpaslan Öztürk', position: 'Defence', attack: 50, defense: 75, goalkeeper: 10, wage: 600000, contractEnd: 2028, value: 600000, age: 25, stamina: 80 },
      { name: 'Atınç Nukan', position: 'Defence', attack: 50, defense: 75, goalkeeper: 10, wage: 550000, contractEnd: 2028, value: 600000, age: 25, stamina: 80 },
      { name: 'Berkan Emir', position: 'Defence', attack: 60, defense: 65, goalkeeper: 10, wage: 500000, contractEnd: 2028, value: 600000, age: 25, stamina: 80 },
      { name: 'Sonny Kittel', position: 'Midfield', attack: 70, defense: 70, goalkeeper: 10, wage: 800000, contractEnd: 2028, value: 600000, age: 25, stamina: 80 },
      { name: 'Obinna Nwobodo', position: 'Midfield', attack: 70, defense: 70, goalkeeper: 10, wage: 750000, contractEnd: 2028, value: 600000, age: 25, stamina: 80 },
      { name: 'Halil Akbunar', position: 'Midfield', attack: 80, defense: 60, goalkeeper: 10, wage: 700000, contractEnd: 2028, value: 600000, age: 25, stamina: 80 },
      { name: 'Adis Jahović', position: 'Forward', attack: 75, defense: 60, goalkeeper: 10, wage: 850000, contractEnd: 2028, value: 600000, age: 25, stamina: 80 },
      { name: 'Cyle Larin', position: 'Forward', attack: 80, defense: 50, goalkeeper: 10, wage: 800000, contractEnd: 2028, value: 600000, age: 25, stamina: 80 },
      { name: 'Stefano Okaka', position: 'Forward', attack: 80, defense: 50, goalkeeper: 10, wage: 850000, contractEnd: 2028, value: 600000, age: 25, stamina: 80 },
    ],
    stadium: {
      name: 'Gürsel Aksel Stadium',
      stadiumCapacity: 20040,
      city: 'Izmir',
    },
    country: 'Turkiye',
    trainingFacilityLevel: 3,
    youthFacilityLevel: 4,
    reputation: 1,
    fans: 2000000,
    balance: 40000000,
    expenses: 20000000,
    income: 30000000,
    defaultTactic: '4-4-2',
  },
  {
    name: 'Alanyaspor',
    players: [
      { name: 'Marafona', position: 'Goalkeeper', attack: 10, defense: 80, goalkeeper: 85, wage: 900000, contractEnd: 2028, value: 600000, age: 25, stamina: 80 },
      { name: 'Juanfran', position: 'Defence', attack: 65, defense: 70, goalkeeper: 10, wage: 500000, contractEnd: 2028, value: 600000, age: 25, stamina: 80 },
      { name: 'Steven Caulker', position: 'Defence', attack: 50, defense: 75, goalkeeper: 10, wage: 600000, contractEnd: 2028, value: 600000, age: 25, stamina: 80 },
      { name: 'Georgios Tzavellas', position: 'Defence', attack: 50, defense: 75, goalkeeper: 10, wage: 550000, contractEnd: 2028, value: 600000, age: 25, stamina: 80 },
      { name: 'Franck Yannick Kessié', position: 'Midfield', attack: 60, defense: 65, goalkeeper: 10, wage: 500000, contractEnd: 2028, value: 600000, age: 25, stamina: 80 },
      { name: 'Berkan Kutlu', position: 'Midfield', attack: 70, defense: 70, goalkeeper: 10, wage: 800000, contractEnd: 2028, value: 600000, age: 25, stamina: 80 },
      { name: 'Manolis Siopis', position: 'Midfield', attack: 70, defense: 70, goalkeeper: 10, wage: 750000, contractEnd: 2028, value: 600000, age: 25, stamina: 80 },
      { name: 'David Pavelka', position: 'Midfield', attack: 80, defense: 60, goalkeeper: 10, wage: 700000, contractEnd: 2028, value: 600000, age: 25, stamina: 80 },
      { name: 'Salih Uçan', position: 'Midfield', attack: 75, defense: 60, goalkeeper: 10, wage: 850000, contractEnd: 2028, value: 600000, age: 25, stamina: 80 },
      { name: 'Khouma Babacar', position: 'Forward', attack: 80, defense: 50, goalkeeper: 10, wage: 800000, contractEnd: 2028, value: 600000, age: 25, stamina: 80 },
      { name: 'Adam Bareiro', position: 'Forward', attack: 80, defense: 50, goalkeeper: 10, wage: 850000, contractEnd: 2028, value: 600000, age: 25, stamina: 80 },
    ],
    stadium: {
      name: 'Bahçeşehir Okulları Stadium',
      stadiumCapacity: 10842,
      city: 'Alanya'
    },
    country: 'Turkiye',
    trainingFacilityLevel: 3,
    youthFacilityLevel: 4,
    reputation: 1,
    fans: 2000000,
    balance: 40000000,
    expenses: 20000000,
    income: 30000000,
    defaultTactic: '4-4-2',
  },
  {
    name: 'Antalyaspor',
    players: [
      { name: 'Ferhat Kaplan', position: 'Goalkeeper', attack: 10, defense: 80, goalkeeper: 85, wage: 900000, contractEnd: 2028, value: 600000, age: 25, stamina: 80 },
      { name: 'Eren Albayrak', position: 'Defence', attack: 65, defense: 70, goalkeeper: 10, wage: 500000, contractEnd: 2028, value: 600000, age: 25, stamina: 80 },
      { name: 'Veysel Sarı', position: 'Defence', attack: 50, defense: 75, goalkeeper: 10, wage: 600000, contractEnd: 2028, value: 600000, age: 25, stamina: 80 },
      { name: 'Naldo', position: 'Defence', attack: 50, defense: 75, goalkeeper: 10, wage: 550000, contractEnd: 2028, value: 600000, age: 25, stamina: 80 },
      { name: 'Fernando', position: 'Midfield', attack: 60, defense: 65, goalkeeper: 10, wage: 500000, contractEnd: 2028, value: 600000, age: 25, stamina: 80 },
      { name: 'Ufuk Akyol', position: 'Midfield', attack: 70, defense: 70, goalkeeper: 10, wage: 800000, contractEnd: 2028, value: 600000, age: 25, stamina: 80 },
      { name: 'Hakan Özmert', position: 'Midfield', attack: 70, defense: 70, goalkeeper: 10, wage: 750000, contractEnd: 2028, value: 600000, age: 25, stamina: 80 },
      { name: 'Amilton', position: 'Midfield', attack: 80, defense: 60, goalkeeper: 10, wage: 700000, contractEnd: 2028, value: 600000, age: 25, stamina: 80 },
      { name: 'Fredy', position: 'Midfield', attack: 75, defense: 60, goalkeeper: 10, wage: 850000, contractEnd: 2028, value: 600000, age: 25, stamina: 80 },
      { name: 'Gökdeniz Bayrakdar', position: 'Forward', attack: 70, defense: 50, goalkeeper: 10, wage: 800000, contractEnd: 2028, value: 600000, age: 25, stamina: 80 },
      { name: 'Adem Büyük', position: 'Forward', attack: 80, defense: 50, goalkeeper: 10, wage: 850000, contractEnd: 2028, value: 600000, age: 25, stamina: 80 },
    ],
    stadium: {
      name: 'Antalya Stadium',
      stadiumCapacity: 33032,
      city: 'Antalya'
    },
    country: 'Turkiye',
    trainingFacilityLevel: 3,
    youthFacilityLevel: 4,
    reputation: 1,
    fans: 2000000,
    balance: 40000000,
    expenses: 20000000,
    income: 30000000,
    defaultTactic: '4-4-2',
  },
];


module.exports = initialTeams;