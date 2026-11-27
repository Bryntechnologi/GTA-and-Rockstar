/* ==========================================================================
   CHANNEL SURF — data.js
   Original fan-written content. No game assets, audio, or copied text.
   Edit this file to add eras, questions, fake facts, atlas entries, or events.
   ========================================================================== */

window.CS_DATA = (() => {
  "use strict";

  /* ---------------------------------------------------------------------
     ERA SIGNALS
     The `key` values must match [data-era="..."] blocks in styles.css.
     --------------------------------------------------------------------- */
  const eras = {
    home: {
      key: "home",
      name: "Channel Surf",
      short: "CS",
      place: "The archive",
      year: "STUDIO",
      station: "CHANNEL SURF",
      freq: "00.0",
      tagline: "The archive, the signal, and the arcade.",
      accentName: "Ember orange",
      visited: false
    },
    classic: {
      key: "classic",
      name: "Classic GTA",
      short: "GTA",
      place: "1997–2001",
      year: "1997",
      station: "GTA RADIO",
      freq: "97.1",
      tagline: "Top-down mayhem and arcade nerve.",
      accentName: "Arcade lime",
      visited: false
    },
    gta6: {
      key: "gta6",
      name: "GTA VI",
      short: "VI",
      place: "Leonida / Vice City",
      year: "2026",
      station: "LEONIDA WAVE",
      freq: "98.7",
      tagline: "Neon, salt, and trouble.",
      accentName: "Sunset coral",
      visited: false
    },
    vicecity: {
      key: "vicecity",
      name: "Vice City",
      short: "VC",
      place: "Vice City, 1986",
      year: "1986",
      station: "FLASH FM",
      freq: "105.2",
      tagline: "Pastel sunsets and questionable business.",
      accentName: "Hot pink",
      visited: false
    },
    sanandreas: {
      key: "sanandreas",
      name: "San Andreas",
      short: "SA",
      place: "San Andreas, 1992",
      year: "1992",
      station: "RADIO LOS SANTOS",
      freq: "92.3",
      tagline: "Golden hour on the wrong side of town.",
      accentName: "Amber",
      visited: false
    },
    gta5: {
      key: "gta5",
      name: "GTA V",
      short: "V",
      place: "Los Santos, 2013",
      year: "2013",
      station: "NON-STOP-POP FM",
      freq: "100.7",
      tagline: "Sunshine, scandal, and a nine-figure score.",
      accentName: "Poolside orange",
      visited: false
    },
    gta4: {
      key: "gta4",
      name: "GTA IV",
      short: "IV",
      place: "Liberty City, 2008",
      year: "2008",
      station: "LIBERTY ROCK RADIO",
      freq: "97.8",
      tagline: "The city takes more than it gives.",
      accentName: "Taxi yellow",
      visited: false
    },
    warriors: {
      key: "warriors",
      name: "The Warriors",
      short: "NY79",
      place: "New York, 1979",
      year: "1979",
      station: "BOPPER FM",
      freq: "88.1",
      tagline: "All the way to Coney. No detours.",
      accentName: "Brick red",
      visited: false
    },
    reddead: {
      key: "reddead",
      name: "Red Dead",
      short: "RDR",
      place: "The American Frontier",
      year: "1899",
      station: "FRONTIER WIRELESS",
      freq: "AM 660",
      tagline: "Dust, debt, and one last ride.",
      accentName: "Oxblood",
      visited: false
    },
    bully: {
      key: "bully",
      name: "Bully",
      short: "BW",
      place: "Bullworth Academy",
      year: "2006",
      station: "BULLWORTH AM",
      freq: "AM 1240",
      tagline: "Class is in session. So is trouble.",
      accentName: "Crest gold",
      visited: false
    }
  };

  const eraOrder = ["gta6", "vicecity", "sanandreas", "gta5", "gta4", "warriors", "reddead", "bully"];

  /* ---------------------------------------------------------------------
     TRIVIA QUESTIONS
     Each question has four choices. `answer` is the zero-based index.
     `era` controls the channel-surf theme; `game` is the displayed label.
     --------------------------------------------------------------------- */
  const questions = [
    /* GTA VI ------------------------------------------------------------ */
    {
      id: "vi-01",
      era: "gta6",
      game: "GTA VI",
      difficulty: "warm-up",
      prompt: "Grand Theft Auto VI is primarily set in which fictional US state?",
      choices: ["Leonida", "Alderney", "San Andreas", "Guarma"],
      answer: 0,
      lore: "Rockstar introduced Leonida as the state that surrounds Vice City — a Florida-inspired playground of causeways, wetlands, and neon."
    },
    {
      id: "vi-02",
      era: "gta6",
      game: "GTA VI",
      difficulty: "warm-up",
      prompt: "Who are the two revealed playable protagonists of GTA VI?",
      choices: ["Jason and Lucia", "Marcus and Alyssa", "Vic and Louise", "Eddie and Rosa"],
      answer: 0,
      lore: "The first trailer put Jason and Lucia at the center of a Bonnie-and-Clyde-style story. Rockstar describes them as a criminal duo bound together by more than ambition."
    },
    {
      id: "vi-03",
      era: "gta6",
      game: "GTA VI",
      difficulty: "music",
      prompt: "Which Tom Petty song powered the first GTA VI trailer?",
      choices: ["Love Is a Long Road", "Free Fallin'", "Runnin' Down a Dream", "American Girl"],
      answer: 0,
      lore: "The trailer's slow-burn drive came from 'Love Is a Long Road,' a 1989 track that fits the game's sun-faded outlaw mood."
    },
    {
      id: "vi-04",
      era: "gta6",
      game: "GTA VI",
      difficulty: "geography",
      prompt: "Leonida is most directly inspired by which real-world region?",
      choices: ["Florida", "Southern California", "The Pacific Northwest", "The Gulf Coast of Texas"],
      answer: 0,
      lore: "From the Keys-style chain of islands to the swampy interior and hurricane-washed coast, Leonida is a heightened, fictionalized Florida."
    },
    {
      id: "vi-05",
      era: "gta6",
      game: "GTA VI",
      difficulty: "warm-up",
      prompt: "Which iconic GTA city returns as GTA VI's main urban stage?",
      choices: ["Vice City", "Liberty City", "Los Santos", "Carcer City"],
      answer: 0,
      lore: "Vice City is back, rebuilt for the modern era. It sits at the heart of Leonida rather than functioning as the entire map."
    },
    {
      id: "vi-06",
      era: "gta6",
      game: "GTA VI",
      difficulty: "history",
      prompt: "In which year did Rockstar first reveal GTA VI with a trailer?",
      choices: ["2023", "2021", "2024", "2022"],
      answer: 0,
      lore: "The first trailer arrived in December 2023 and quickly became one of the most-watched game reveals ever."
    },
    {
      id: "vi-07",
      era: "gta6",
      game: "GTA VI",
      difficulty: "history",
      prompt: "Which platforms were named for GTA VI's initial launch?",
      choices: ["PS5 and Xbox Series X|S", "PS4 and Xbox One", "PC and PS5", "Switch 2 and PS5"],
      answer: 0,
      lore: "Rockstar announced the game for PlayStation 5 and Xbox Series X|S first. A PC release has not been part of the initial launch messaging."
    },
    {
      id: "vi-08",
      era: "gta6",
      game: "GTA VI",
      difficulty: "geography",
      prompt: "Which national-park-style wilderness area appears in Leonida?",
      choices: ["Mount Kalaga National Park", "Mount Chiliad State Park", "Whetstone National Forest", "Ratón Canyon"],
      answer: 0,
      lore: "Mount Kalaga National Park is one of Leonida's wilder edges — a contrast to the condos and nightclubs of Vice City."
    },
    {
      id: "vi-09",
      era: "gta6",
      game: "GTA VI",
      difficulty: "geography",
      prompt: "What is the name of Leonida's wetland region seen in early GTA VI material?",
      choices: ["Grassrivers", "Red County", "The Bayous", "Stillwater Marsh"],
      answer: 0,
      lore: "Grassrivers gives Leonida its swampy, airboat-and-alligator texture, far from the polished beachfront."
    },

    /* VICE CITY --------------------------------------------------------- */
    {
      id: "vc-01",
      era: "vicecity",
      game: "GTA: Vice City",
      difficulty: "warm-up",
      prompt: "In what year is Grand Theft Auto: Vice City set?",
      choices: ["1986", "1979", "1992", "1984"],
      answer: 0,
      lore: "Vice City is a 1986 time capsule of pastel suits, synth-pop, and cocaine-fueled ambition."
    },
    {
      id: "vc-02",
      era: "vicecity",
      game: "GTA: Vice City",
      difficulty: "warm-up",
      prompt: "Who is the playable protagonist of GTA: Vice City?",
      choices: ["Tommy Vercetti", "Carl Johnson", "Niko Bellic", "Vic Vance"],
      answer: 0,
      lore: "Tommy Vercetti arrives in Vice City after fifteen years in prison and immediately discovers that loyalty is a finite resource."
    },
    {
      id: "vc-03",
      era: "vicecity",
      game: "GTA: Vice City",
      difficulty: "casting",
      prompt: "Which actor voices Tommy Vercetti?",
      choices: ["Ray Liotta", "Samuel L. Jackson", "Michael Madsen", "Dennis Hopper"],
      answer: 0,
      lore: "Ray Liotta brought Tommy to life. His performance helped define the series' appetite for cinematic crime drama."
    },
    {
      id: "vc-04",
      era: "vicecity",
      game: "GTA: Vice City",
      difficulty: "characters",
      prompt: "Which lawyer helps Tommy get a foothold in Vice City?",
      choices: ["Ken Rosenberg", "Lance Vance", "Sonny Forelli", "Umberto Robina"],
      answer: 0,
      lore: "Ken Rosenberg is the nervous, coked-up lawyer who connects Tommy to the city's criminal infrastructure — and then worries about it constantly."
    },
    {
      id: "vc-05",
      era: "vicecity",
      game: "GTA: Vice City",
      difficulty: "geography",
      prompt: "Which real-world city most inspired Vice City?",
      choices: ["Miami", "Los Angeles", "New Orleans", "Las Vegas"],
      answer: 0,
      lore: "Vice City borrows Miami's beaches, Art Deco architecture, drug-trade history, and 1980s pop-culture sheen."
    },
    {
      id: "vc-06",
      era: "vicecity",
      game: "GTA: Vice City",
      difficulty: "locations",
      prompt: "What is the name of the mansion Tommy eventually takes over?",
      choices: ["Vercetti Estate", "Starfish Manor", "Diaz Palace", "Ocean View Compound"],
      answer: 0,
      lore: "Vercetti Estate — formerly Ricardo Diaz's mansion — becomes Tommy's base of operations and a very expensive symbol of arrival."
    },
    {
      id: "vc-07",
      era: "vicecity",
      game: "GTA: Vice City",
      difficulty: "culture",
      prompt: "Which 1983 film is a major tonal influence on Vice City's story?",
      choices: ["Scarface", "Beverly Hills Cop", "The Warriors", "Blade Runner"],
      answer: 0,
      lore: "From the immigrant-made-good crime arc to the mansion and the chainsaw, Scarface's shadow hangs over Vice City."
    },
    {
      id: "vc-08",
      era: "vicecity",
      game: "GTA: Vice City",
      difficulty: "side content",
      prompt: "Which delivery side job is available in Vice City?",
      choices: ["Pizza Boy", "Ice Cream Jingle", "Noodle Exchange", "Taco Run"],
      answer: 0,
      lore: "Pizza Boy sends Tommy across the city on a scooter, turning a humble delivery route into a test of patience and traffic survival."
    },

    /* SAN ANDREAS ------------------------------------------------------- */
    {
      id: "sa-01",
      era: "sanandreas",
      game: "GTA: San Andreas",
      difficulty: "warm-up",
      prompt: "In what year is GTA: San Andreas set?",
      choices: ["1992", "1989", "1995", "1990"],
      answer: 0,
      lore: "San Andreas opens in 1992, soaked in golden-hour haze, gang tension, and early-90s West Coast rap."
    },
    {
      id: "sa-02",
      era: "sanandreas",
      game: "GTA: San Andreas",
      difficulty: "warm-up",
      prompt: "Who is the protagonist of GTA: San Andreas?",
      choices: ["Carl 'CJ' Johnson", "Sweet Johnson", "Big Smoke", "Mike Toreno"],
      answer: 0,
      lore: "Carl 'CJ' Johnson returns to Los Santos after his mother's death and gets pulled straight back into the Grove Street Families' war."
    },
    {
      id: "sa-03",
      era: "sanandreas",
      game: "GTA: San Andreas",
      difficulty: "geography",
      prompt: "Which San Andreas city is based on Los Angeles?",
      choices: ["Los Santos", "San Fierro", "Las Venturas", "Angel Pine"],
      answer: 0,
      lore: "Los Santos is the game's opening city: sprawl, freeways, palm trees, and a very complicated homecoming."
    },
    {
      id: "sa-04",
      era: "sanandreas",
      game: "GTA: San Andreas",
      difficulty: "culture",
      prompt: "Which color is most associated with the Grove Street Families?",
      choices: ["Green", "Blue", "Purple", "Orange"],
      answer: 0,
      lore: "Grove Street green is more than a color — it is a neighborhood identity, a uniform, and a warning."
    },
    {
      id: "sa-05",
      era: "sanandreas",
      game: "GTA: San Andreas",
      difficulty: "geography",
      prompt: "Which city in San Andreas is modeled after San Francisco?",
      choices: ["San Fierro", "Las Venturas", "Los Santos", "Bayside"],
      answer: 0,
      lore: "San Fierro brings hills, bridges, fog, and a colder coastal mood to the middle act of CJ's story."
    },
    {
      id: "sa-06",
      era: "sanandreas",
      game: "GTA: San Andreas",
      difficulty: "geography",
      prompt: "Which San Andreas city is a stand-in for Las Vegas?",
      choices: ["Las Venturas", "San Fierro", "Palomino Creek", "Dillimore"],
      answer: 0,
      lore: "Las Venturas trades gang turf for casino carpet, neon, and a heist that would make any crew nervous."
    },
    {
      id: "sa-07",
      era: "sanandreas",
      game: "GTA: San Andreas",
      difficulty: "locations",
      prompt: "Which restricted desert facility parodies Area 51?",
      choices: ["Area 69", "Fort Zancudo", "Camp Pendleton", "The Big Ear"],
      answer: 0,
      lore: "Area 69 is San Andreas' dusty conspiracy playground, complete with soldiers, jets, and a lot of very official-looking fences."
    },
    {
      id: "sa-08",
      era: "sanandreas",
      game: "GTA: San Andreas",
      difficulty: "casting",
      prompt: "Which actor voices Officer Frank Tenpenny?",
      choices: ["Samuel L. Jackson", "Clifton Powell", "Ice-T", "Michael Madsen"],
      answer: 0,
      lore: "Samuel L. Jackson's Tenpenny is a corrupt institution in human form — charming, terrifying, and impossible to fully escape."
    },
    {
      id: "sa-09",
      era: "sanandreas",
      game: "GTA: San Andreas",
      difficulty: "characters",
      prompt: "What is the name of CJ's brother and Grove Street leader?",
      choices: ["Sweet", "Big Smoke", "Ryder", "Cesar"],
      answer: 0,
      lore: "Sean 'Sweet' Johnson is the moral center of Grove Street, even when his stubbornness makes everything harder."
    },

    /* GTA V ------------------------------------------------------------- */
    {
      id: "v-01",
      era: "gta5",
      game: "GTA V",
      difficulty: "warm-up",
      prompt: "In what year is the main story of GTA V set?",
      choices: ["2013", "2008", "2015", "2011"],
      answer: 0,
      lore: "GTA V opens in 2013, using present-day Los Santos as a satire of celebrity culture, real estate, and the pursuit of the next score."
    },
    {
      id: "v-02",
      era: "gta5",
      game: "GTA V",
      difficulty: "warm-up",
      prompt: "Which three characters are playable in GTA V's story?",
      choices: ["Michael, Franklin, and Trevor", "Niko, Roman, and Packie", "CJ, Sweet, and Ryder", "Tommy, Lance, and Ken"],
      answer: 0,
      lore: "Michael, Franklin, and Trevor form the game's three-point heist triangle: old money, new ambition, and pure chaos."
    },
    {
      id: "v-03",
      era: "gta5",
      game: "GTA V",
      difficulty: "geography",
      prompt: "Which city serves as GTA V's primary urban setting?",
      choices: ["Los Santos", "Liberty City", "Vice City", "San Fierro"],
      answer: 0,
      lore: "Los Santos returns from San Andreas, rebuilt at a much larger scale and surrounded by Blaine County's desert and mountains."
    },
    {
      id: "v-04",
      era: "gta5",
      game: "GTA V",
      difficulty: "characters",
      prompt: "What is the name of Franklin's aunt, whose house he starts out living in?",
      choices: ["Denise", "Amanda", "Tanisha", "Lamar"],
      answer: 0,
      lore: "Aunt Denise's house is Franklin's first foothold in the city — and a constant reminder that he wants a bigger life."
    },
    {
      id: "v-05",
      era: "gta5",
      game: "GTA V",
      difficulty: "radio",
      prompt: "Which GTA V radio station is hosted by DJ Pooh?",
      choices: ["West Coast Classics", "Non-Stop-Pop FM", "FlyLo FM", "Rebel Radio"],
      answer: 0,
      lore: "West Coast Classics is a love letter to golden-era hip-hop, with DJ Pooh guiding the broadcast."
    },
    {
      id: "v-06",
      era: "gta5",
      game: "GTA V",
      difficulty: "characters",
      prompt: "What is Trevor's business called?",
      choices: ["Trevor Philips Industries", "Sandy Shores Aviation", "TP Enterprises", "The Alamo Sea Company"],
      answer: 0,
      lore: "Trevor Philips Industries is exactly as legitimate as it sounds, which is to say: not remotely."
    },
    {
      id: "v-07",
      era: "gta5",
      game: "GTA V",
      difficulty: "locations",
      prompt: "Which mountain is the tallest peak in GTA V's map?",
      choices: ["Mount Chiliad", "Mount Josiah", "Mount Gordo", "Mount Kalaga"],
      answer: 0,
      lore: "Mount Chiliad looms over Blaine County and has become a favorite stage for mystery hunters, cable cars, and very long bike rides."
    },
    {
      id: "v-08",
      era: "gta5",
      game: "GTA V",
      difficulty: "world",
      prompt: "What is the name of the in-game internet browser?",
      choices: ["Eyefind", "Bleeter", "Lifeinvader", "Maze Bank"],
      answer: 0,
      lore: "Eyefind is Los Santos' search-and-surf portal, sitting alongside other fictional web services like Bleeter and Lifeinvader."
    },
    {
      id: "v-09",
      era: "gta5",
      game: "GTA V",
      difficulty: "heists",
      prompt: "What is the first major story heist in GTA V?",
      choices: ["The Jewel Store Job", "The Paleto Score", "Blitz Play", "The Big Score"],
      answer: 0,
      lore: "The Jewel Store Job sets the template: choose a crew, choose an approach, and watch the plan develop a personality of its own."
    },

    /* GTA IV ------------------------------------------------------------ */
    {
      id: "iv-01",
      era: "gta4",
      game: "GTA IV",
      difficulty: "warm-up",
      prompt: "In what year is GTA IV set?",
      choices: ["2008", "2001", "2010", "2006"],
      answer: 0,
      lore: "GTA IV arrived in 2008 and is set in that same gray, post-9/11-era Liberty City — a city of immigration, debt, and broken promises."
    },
    {
      id: "iv-02",
      era: "gta4",
      game: "GTA IV",
      difficulty: "warm-up",
      prompt: "Who is the protagonist of GTA IV?",
      choices: ["Niko Bellic", "Roman Bellic", "Johnny Klebitz", "Luis Lopez"],
      answer: 0,
      lore: "Niko Bellic comes to Liberty City chasing the promise of opportunity and finds a much older, much bloodier story waiting for him."
    },
    {
      id: "iv-03",
      era: "gta4",
      game: "GTA IV",
      difficulty: "geography",
      prompt: "Which real-world city inspired Liberty City in GTA IV?",
      choices: ["New York City", "Boston", "Chicago", "Philadelphia"],
      answer: 0,
      lore: "Liberty City is a fictionalized New York, rebuilt with recognizably gritty boroughs and an unapologetically gray palette."
    },
    {
      id: "iv-04",
      era: "gta4",
      game: "GTA IV",
      difficulty: "characters",
      prompt: "Who is Niko's cousin, whose dreams pull Niko to Liberty City?",
      choices: ["Roman", "Bernie", "Brucie", "Dwayne"],
      answer: 0,
      lore: "Roman Bellic sells Niko on Liberty City as a land of opportunity, mansions, and beautiful women. The reality is more complicated."
    },
    {
      id: "iv-05",
      era: "gta4",
      game: "GTA IV",
      difficulty: "geography",
      prompt: "Which Liberty City borough is modeled on Brooklyn?",
      choices: ["Broker", "Dukes", "Bohan", "Algonquin"],
      answer: 0,
      lore: "Broker is the Brooklyn-style borough where Niko and Roman's story begins, along with a lot of unpaid debts."
    },
    {
      id: "iv-06",
      era: "gta4",
      game: "GTA IV",
      difficulty: "geography",
      prompt: "Which Liberty City borough stands in for Manhattan?",
      choices: ["Algonquin", "Alderney", "Dukes", "Bohan"],
      answer: 0,
      lore: "Algonquin is the vertical heart of Liberty City — glass towers, news media, and the sense that everyone is being watched."
    },
    {
      id: "iv-07",
      era: "gta4",
      game: "GTA IV",
      difficulty: "missions",
      prompt: "What is the name of the bank robbery mission with Packie McReary?",
      choices: ["Three Leaf Clover", "The Paleto Score", "The Job", "Late Checkout"],
      answer: 0,
      lore: "Three Leaf Clover is one of the series' most memorable heists: a bank job that turns into a full-scale running battle through Liberty City."
    },
    {
      id: "iv-08",
      era: "gta4",
      game: "GTA IV",
      difficulty: "radio",
      prompt: "Which station brings Eastern European and Russian music to Liberty City's airwaves?",
      choices: ["Vladivostok FM", "Liberty Rock Radio", "The Beat", "WKTT"],
      answer: 0,
      lore: "Vladivostok FM gives GTA IV's immigrant story its own soundtrack, mixing club tracks and post-Soviet pop."
    },
    {
      id: "iv-09",
      era: "gta4",
      game: "GTA IV",
      difficulty: "world",
      prompt: "Which internet cafe is a recurring GTA IV location?",
      choices: ["TW@", "Plugged In", "Eyefind", "The Web"], 
      answer: 0,
      lore: "TW@ internet cafes are scattered across Liberty City, ready to connect Niko to email, dating sites, and a whole lot of trouble."
    },

    /* THE WARRIORS ------------------------------------------------------ */
    {
      id: "war-01",
      era: "warriors",
      game: "The Warriors",
      difficulty: "warm-up",
      prompt: "In what year did Rockstar's The Warriors video game release?",
      choices: ["2005", "2001", "2008", "2003"],
      answer: 0,
      lore: "The Warriors launched in 2005, expanding the cult film's night-long odyssey into a brawler with a turfline of its own."
    },
    {
      id: "war-02",
      era: "warriors",
      game: "The Warriors",
      difficulty: "film",
      prompt: "Who directed the 1979 film that inspired the game?",
      choices: ["Walter Hill", "John Carpenter", "Martin Scorsese", "Michael Mann"],
      answer: 0,
      lore: "Walter Hill's 1979 film turned a Greek war story into a neon-lit subway chase. The game adapts that framework and fills in the before-hours."
    },
    {
      id: "war-03",
      era: "warriors",
      game: "The Warriors",
      difficulty: "gangs",
      prompt: "Which gang is framed for the murder of Cyrus?",
      choices: ["The Warriors", "The Rogues", "The Gramercy Riffs", "The Baseball Furies"],
      answer: 0,
      lore: "The Warriors are blamed for Cyrus' death, turning every gang in the city into a pursuit force. All they can do is run."
    },
    {
      id: "war-04",
      era: "warriors",
      game: "The Warriors",
      difficulty: "gangs",
      prompt: "Which face-painted gang menaces the Warriors with baseball bats?",
      choices: ["The Baseball Furies", "The Punks", "The Lizzies", "The Orphans"],
      answer: 0,
      lore: "The Baseball Furies are one of the film's most iconic gangs: pinstripes, war paint, and a very literal love of the game."
    },
    {
      id: "war-05",
      era: "warriors",
      game: "The Warriors",
      difficulty: "characters",
      prompt: "Who leads the Warriors?",
      choices: ["Cleon", "Swan", "Cochise", "Ajax"],
      answer: 0,
      lore: "Cleon leads the Warriors into the conclave. When the night goes wrong, Swan has to carry the crew home."
    },
    {
      id: "war-06",
      era: "warriors",
      game: "The Warriors",
      difficulty: "gangs",
      prompt: "Which gang is the city's largest and organizes the big conclave?",
      choices: ["The Gramercy Riffs", "The Turnbull AC's", "The Jones Street Boys", "The Destroyers"],
      answer: 0,
      lore: "The Gramercy Riffs hold the city's power, and Cyrus' speech at their conclave imagines a united front against the cops."
    },
    {
      id: "war-07",
      era: "warriors",
      game: "The Warriors",
      difficulty: "story",
      prompt: "Who is killed at the conclave, triggering the manhunt?",
      choices: ["Cyrus", "Luther", "Cleon", "Masai"],
      answer: 0,
      lore: "Cyrus is shot by Luther, and the Warriors are left holding the blame. The rest of the night is a race back to Coney Island."
    },
    {
      id: "war-08",
      era: "warriors",
      game: "The Warriors",
      difficulty: "settings",
      prompt: "Which neighborhood is the Warriors' home turf?",
      choices: ["Coney Island", "The Bronx", "Harlem", "Queens"],
      answer: 0,
      lore: "Coney Island is home: boardwalk lights, cheap rides, and the only place in the city where the Warriors can finally stop running."
    },
    {
      id: "war-09",
      era: "warriors",
      game: "The Warriors",
      difficulty: "characters",
      prompt: "Who is the leader of the Rogues?",
      choices: ["Luther", "Swan", "Masai", "Vermin"],
      answer: 0,
      lore: "Luther is a small-time troublemaker with a very big mouth. His decision at the conclave turns a city-sized gathering into a nightlong hunt."
    },

    /* RED DEAD ---------------------------------------------------------- */
    {
      id: "rdr-01",
      era: "reddead",
      game: "Red Dead Redemption 2",
      difficulty: "warm-up",
      prompt: "In what year does Red Dead Redemption 2 begin?",
      choices: ["1899", "1879", "1907", "1911"],
      answer: 0,
      lore: "RDR2 opens in 1899, as the age of the outlaw is closing and the Van der Linde gang is running out of places to hide."
    },
    {
      id: "rdr-02",
      era: "reddead",
      game: "Red Dead Redemption 2",
      difficulty: "warm-up",
      prompt: "Who is the playable protagonist of Red Dead Redemption 2?",
      choices: ["Arthur Morgan", "John Marston", "Dutch van der Linde", "Hosea Matthews"],
      answer: 0,
      lore: "Arthur Morgan is the gang's enforcer and, over the course of the story, its conscience. His arc is one of loyalty tested against decay."
    },
    {
      id: "rdr-03",
      era: "reddead",
      game: "Red Dead Redemption 2",
      difficulty: "characters",
      prompt: "Who leads the Van der Linde gang?",
      choices: ["Dutch van der Linde", "Colm O'Driscoll", "Leviticus Cornwall", "Micah Bell"],
      answer: 0,
      lore: "Dutch is a charismatic idealist with a plan for every disaster — and a growing inability to admit when the plan is gone."
    },
    {
      id: "rdr-04",
      era: "reddead",
      game: "Red Dead Redemption",
      difficulty: "warm-up",
      prompt: "Who is the protagonist of the original Red Dead Redemption?",
      choices: ["John Marston", "Arthur Morgan", "Jack Marston", "Bill Williamson"],
      answer: 0,
      lore: "John Marston is a former outlaw trying to buy his family's freedom with one last job for the government."
    },
    {
      id: "rdr-05",
      era: "reddead",
      game: "Red Dead Redemption 2",
      difficulty: "timeline",
      prompt: "How does Red Dead Redemption 2 relate to the first Red Dead Redemption?",
      choices: ["It is a prequel", "It is a sequel", "It is a reboot", "It is an alternate timeline"],
      answer: 0,
      lore: "RDR2 is a prequel set before John Marston's story, following the Van der Linde gang during its final, fractured years."
    },
    {
      id: "rdr-06",
      era: "reddead",
      game: "Red Dead Redemption 2",
      difficulty: "locations",
      prompt: "Which frontier town is a major early hub in RDR2?",
      choices: ["Valentine", "Saint Denis", "Blackwater", "Armadillo"],
      answer: 0,
      lore: "Valentine is mud, livestock, and saloon trouble — the perfect introduction to the Van der Linde gang's idea of laying low."
    },
    {
      id: "rdr-07",
      era: "reddead",
      game: "Red Dead Redemption 2",
      difficulty: "locations",
      prompt: "Which RDR2 city is modeled on New Orleans?",
      choices: ["Saint Denis", "Rhodes", "Annesburg", "Strawberry"],
      answer: 0,
      lore: "Saint Denis is the game's industrial, cosmopolitan contrast: streetcars, electric light, and a different kind of violence."
    },
    {
      id: "rdr-08",
      era: "reddead",
      game: "Red Dead Redemption 2",
      difficulty: "story",
      prompt: "What is the name of the outlaw family at the center of RDR2?",
      choices: ["The Van der Linde gang", "The O'Driscolls", "The Pinkertons", "The Marston crew"],
      answer: 0,
      lore: "The Van der Linde gang is a makeshift family bound by loyalty, ideology, and the shared belief that the frontier still has room for them."
    },
    {
      id: "rdr-09",
      era: "reddead",
      game: "Red Dead Redemption",
      difficulty: "release",
      prompt: "In what year did the original Red Dead Redemption launch?",
      choices: ["2010", "2008", "2012", "2013"],
      answer: 0,
      lore: "Red Dead Redemption launched in 2010, bringing the series into its cinematic open-world era."
    },

    /* BULLY ------------------------------------------------------------- */
    {
      id: "bully-01",
      era: "bully",
      game: "Bully",
      difficulty: "warm-up",
      prompt: "What is the name of the school at the center of Bully?",
      choices: ["Bullworth Academy", "Blackwater Prep", "Hampton Hall", "Rydell High"],
      answer: 0,
      lore: "Bullworth Academy is a boarding school with cliques, corrupt adults, and a disciplinary system that never seems to work as intended."
    },
    {
      id: "bully-02",
      era: "bully",
      game: "Bully",
      difficulty: "warm-up",
      prompt: "Who is the protagonist of Bully?",
      choices: ["Jimmy Hopkins", "Gary Smith", "Pete Kowalski", "Russell Northrop"],
      answer: 0,
      lore: "Jimmy Hopkins is a new student with a talent for surviving institutions. Bullworth quickly learns not to underestimate him."
    },
    {
      id: "bully-03",
      era: "bully",
      game: "Bully",
      difficulty: "history",
      prompt: "In what year was Bully originally released?",
      choices: ["2006", "2004", "2008", "2010"],
      answer: 0,
      lore: "Bully released in 2006, giving Rockstar a smaller-scale, sharply observed take on school life and teenage hierarchy."
    },
    {
      id: "bully-04",
      era: "bully",
      game: "Bully",
      difficulty: "development",
      prompt: "Which Rockstar studio led development on Bully?",
      choices: ["Rockstar Vancouver", "Rockstar North", "Rockstar San Diego", "Rockstar Leeds"],
      answer: 0,
      lore: "Rockstar Vancouver developed Bully, bringing a distinctly institutional sense of humor to the Rockstar catalog."
    },
    {
      id: "bully-05",
      era: "bully",
      game: "Bully",
      difficulty: "title",
      prompt: "What was Bully's title in some regions, including the UK?",
      choices: ["Canis Canem Edit", "Schoolyard Kings", "Bullworth Blues", "The New Boy"],
      answer: 0,
      lore: "Canis Canem Edit — Latin for 'dog eat dog' — was used in several markets, a fitting motto for Bullworth's social order."
    },
    {
      id: "bully-06",
      era: "bully",
      game: "Bully",
      difficulty: "characters",
      prompt: "Who is Bullworth Academy's headmaster?",
      choices: ["Mr. Crabblesnitch", "Mr. Burton", "Miss Danvers", "Mr. Galloway"],
      answer: 0,
      lore: "Mr. Crabblesnitch runs Bullworth with a mixture of pomposity, threat, and total confidence in his own judgment."
    },
    {
      id: "bully-07",
      era: "bully",
      game: "Bully",
      difficulty: "cliques",
      prompt: "Which clique is associated with upper-crust wealth and preppy uniforms?",
      choices: ["The Preppies", "The Greasers", "The Jocks", "The Nerds"],
      answer: 0,
      lore: "The Preppies occupy Bullworth's old-money lane, complete with blazers, family connections, and a deeply held belief in their own superiority."
    },
    {
      id: "bully-08",
      era: "bully",
      game: "Bully",
      difficulty: "setting",
      prompt: "Bullworth is a fictional town in which region of the United States?",
      choices: ["New England", "The Midwest", "The Deep South", "The Pacific Northwest"],
      answer: 0,
      lore: "Bullworth's brick buildings, autumn leaves, and old-school boarding-school atmosphere place it firmly in a storybook New England."
    }
  ];

  /* ---------------------------------------------------------------------
     MYTHBUSTER / SPOT THE LIE
     Four statements, one planted fake. `answer` is the fake's index.
     --------------------------------------------------------------------- */
  const fakeFacts = [
    {
      id: "ff-01",
      era: "gta6",
      game: "GTA VI",
      statements: [
        "The game is set in the fictional state of Leonida.",
        "Jason and Lucia are the two revealed protagonists.",
        "The first trailer featured a Tom Petty song.",
        "The game is set in 1986."
      ],
      answer: 3,
      lore: "1986 is the year of the original Vice City. GTA VI is a modern-day story, even though it returns to the same fictional city."
    },
    {
      id: "ff-02",
      era: "vicecity",
      game: "GTA: Vice City",
      statements: [
        "Tommy Vercetti is the playable protagonist.",
        "The game is set in 1986.",
        "Miami is its primary real-world inspiration.",
        "The map is centered on Los Santos."
      ],
      answer: 3,
      lore: "Los Santos belongs to San Andreas and GTA V. Vice City's map is its own sun-bleached coastal city."
    },
    {
      id: "ff-03",
      era: "sanandreas",
      game: "GTA: San Andreas",
      statements: [
        "The story begins in 1992.",
        "CJ returns to Los Santos for his mother's funeral.",
        "San Fierro is based on San Francisco.",
        "The protagonist is Niko Bellic."
      ],
      answer: 3,
      lore: "Niko Bellic is the protagonist of GTA IV. San Andreas follows Carl 'CJ' Johnson."
    },
    {
      id: "ff-04",
      era: "gta5",
      game: "GTA V",
      statements: [
        "The story has three playable protagonists.",
        "Los Santos is the main city.",
        "Trevor runs Trevor Philips Industries.",
        "The game is set in 1992."
      ],
      answer: 3,
      lore: "GTA V is set in 2013. 1992 is San Andreas' era."
    },
    {
      id: "ff-05",
      era: "gta4",
      game: "GTA IV",
      statements: [
        "Niko Bellic is the protagonist.",
        "Liberty City is modeled on New York City.",
        "Roman Bellic is Niko's cousin.",
        "The game is set in Vice City."
      ],
      answer: 3,
      lore: "GTA IV takes place in Liberty City. Vice City is a different city, different decade, different weather."
    },
    {
      id: "ff-06",
      era: "warriors",
      game: "The Warriors",
      statements: [
        "The game is based on a 1979 film.",
        "The Warriors are from Coney Island.",
        "The Baseball Furies wear face paint.",
        "The story is set in modern Los Santos."
      ],
      answer: 3,
      lore: "The Warriors is a New York story, not a Los Santos one. The whole point is getting back to Coney Island."
    },
    {
      id: "ff-07",
      era: "reddead",
      game: "Red Dead Redemption 2",
      statements: [
        "Arthur Morgan is the protagonist.",
        "The story begins in 1899.",
        "Dutch van der Linde leads the gang.",
        "The game is set in Vice City."
      ],
      answer: 3,
      lore: "Red Dead Redemption 2 is a frontier story. Vice City is a neon coastal city in the GTA universe."
    },
    {
      id: "ff-08",
      era: "bully",
      game: "Bully",
      statements: [
        "Jimmy Hopkins is the protagonist.",
        "Bullworth Academy is the central school.",
        "The game was developed by Rockstar Vancouver.",
        "The game was released in 2013."
      ],
      answer: 3,
      lore: "Bully released in 2006. 2013 is the year GTA V arrived."
    },
    {
      id: "ff-09",
      era: "gta4",
      game: "Rockstar history",
      statements: [
        "Rockstar Games was founded in 1998.",
        "GTA III helped move the series into 3D.",
        "The Warriors game released in 2005.",
        "Red Dead Redemption 2 launched in 2010."
      ],
      answer: 3,
      lore: "Red Dead Redemption 2 launched in 2018. The original Red Dead Redemption arrived in 2010."
    },
    {
      id: "ff-10",
      era: "vicecity",
      game: "GTA: Vice City",
      statements: [
        "Ray Liotta voices Tommy Vercetti.",
        "The game's tone draws heavily on Scarface.",
        "Ken Rosenberg is a lawyer in the story.",
        "The game takes place in Liberty City."
      ],
      answer: 3,
      lore: "Vice City is the setting. Liberty City is the GTA III and GTA IV city."
    },
    {
      id: "ff-11",
      era: "gta5",
      game: "GTA V",
      statements: [
        "Michael, Franklin, and Trevor are playable.",
        "West Coast Classics is a radio station.",
        "Mount Chiliad is on the map.",
        "The game is a prequel to Red Dead Redemption."
      ],
      answer: 3,
      lore: "GTA V and Red Dead Redemption are separate Rockstar universes. There is no canonical prequel relationship between them."
    },
    {
      id: "ff-12",
      era: "warriors",
      game: "The Warriors",
      statements: [
        "Cleon leads the Warriors at the start.",
        "The Gramercy Riffs host the conclave.",
        "The Rogues' leader is Luther.",
        "The game is set in 2008 Liberty City."
      ],
      answer: 3,
      lore: "The Warriors is set in 1979 New York. Liberty City is GTA's fictional New York, but not this story's setting."
    }
  ];

  /* ---------------------------------------------------------------------
     ERA ATLAS
     Leonida gets coordinates for the custom SVG map. Other eras use cards.
     --------------------------------------------------------------------- */
  const atlas = {
    gta6: {
      title: "The State of Leonida",
      subtitle: "A stylized fan atlas — not to scale.",
      locations: [
        {
          id: "vice-city",
          name: "Vice City",
          kind: "Neon capital",
          x: 482,
          y: 322,
          note: "The main stage. Causeways, condo towers, club queues, and a skyline that treats every sunset like a premiere."
        },
        {
          id: "vice-beach",
          name: "Vice Beach",
          kind: "Barrier island",
          x: 548,
          y: 278,
          note: "Sand, rollerblades, and oceanfront trouble. The postcard version of Leonida is always hiding a second story."
        },
        {
          id: "leonida-keys",
          name: "Leonida Keys",
          kind: "Island chain",
          x: 424,
          y: 404,
          note: "A string of causeways and small islands where the mainland feels very far away — until someone recognizes your car."
        },
        {
          id: "grassrivers",
          name: "Grassrivers",
          kind: "Wetland maze",
          x: 303,
          y: 286,
          note: "Airboats, alligators, and water roads. A place where the map ends and the local knowledge begins."
        },
        {
          id: "port-gellhorn",
          name: "Port Gellhorn",
          kind: "Salt-worn docks",
          x: 142,
          y: 288,
          note: "Working docks, cheap motels, and a gulf-coast rhythm that does not care about your schedule."
        },
        {
          id: "ambrosia",
          name: "Ambrosia",
          kind: "Industrial edge",
          x: 176,
          y: 146,
          note: "Refineries and freight by day; long shadows and side deals after dark. The state's unglamorous engine room."
        },
        {
          id: "mount-kalaga",
          name: "Mount Kalaga",
          kind: "National park",
          x: 329,
          y: 91,
          note: "Pine ridges, switchbacks, and the kind of quiet that makes every distant engine sound suspicious."
        },
        {
          id: "lake-leonida",
          name: "Lake Leonida",
          kind: "Inland water",
          x: 274,
          y: 210,
          note: "A dark blue lung in the middle of the state, ringed by small towns and very specific local rumors."
        }
      ]
    },
    vicecity: {
      title: "Vice City, 1986",
      subtitle: "Pastel coastline, dangerous business.",
      locations: [
        { id: "ocean-beach", name: "Ocean Beach", kind: "Beachfront strip", note: "Neon hotels, rented convertibles, and the feeling that everyone is either somebody or about to pretend to be." },
        { id: "starfish-island", name: "Starfish Island", kind: "Gated wealth", note: "Mansions behind gates and palms. The shortest route between two crimes is often a driveway." },
        { id: "little-havana", name: "Little Havana", kind: "Cuban quarter", note: "Coffee, cigars, car culture, and a community with its own rules about who gets respect." },
        { id: "little-haiti", name: "Little Haiti", kind: "Northern district", note: "A neighborhood under pressure, with turf lines drawn in paint, money, and mutual distrust." },
        { id: "downtown", name: "Downtown", kind: "Glass and ambition", note: "Office towers, construction cranes, and a skyline that looks best through the windshield of a stolen car." },
        { id: "malibu-club", name: "Malibu Club", kind: "Nightlife", note: "A neon landmark where the music is loud enough to drown out at least three ongoing conspiracies." },
        { id: "escobar-airport", name: "Escobar International", kind: "Airport", note: "Arrivals, departures, and the occasional package that never appears on a manifest." },
        { id: "vice-port", name: "Vice Port", kind: "Docks", note: "Containers, forklifts, and the kind of quiet that gets interrupted by a car chase." }
      ]
    },
    sanandreas: {
      title: "San Andreas, 1992",
      subtitle: "Three cities, one long state of mind.",
      locations: [
        { id: "los-santos", name: "Los Santos", kind: "Sprawl", note: "Freeways, palms, and neighborhoods where history is measured in blocks." },
        { id: "grove-street", name: "Grove Street", kind: "Home turf", note: "Green paint, cul-de-sacs, and a family name that carries weight both inside and outside the block." },
        { id: "san-fierro", name: "San Fierro", kind: "Coastal city", note: "Hills, bridges, fog, and a colder social climate than Los Santos." },
        { id: "las-venturas", name: "Las Venturas", kind: "Casino strip", note: "Neon carpet, all-night buffets, and the house always having a plan." },
        { id: "red-county", name: "Red County", kind: "Rural", note: "Orchards, dirt roads, and small-town deputies with very long memories." },
        { id: "bone-county", name: "Bone County", kind: "Desert", note: "Heat shimmer, abandoned mines, and a military installation nobody is supposed to discuss." },
        { id: "mount-chiliad", name: "Mount Chiliad", kind: "Peak", note: "The state's high point and a favorite finish line for bad ideas." },
        { id: "area-69", name: "Area 69", kind: "Restricted", note: "Fences, guard towers, and enough secrecy to make a conspiracy theorist feel seen." }
      ]
    },
    gta5: {
      title: "Los Santos & Blaine County",
      subtitle: "Sunshine with a body count.",
      locations: [
        { id: "downtown-ls", name: "Downtown Los Santos", kind: "Skyscrapers", note: "Glass towers, construction sites, and enough traffic to make a helicopter feel reasonable." },
        { id: "vinewood", name: "Vinewood Hills", kind: "Celebrity", note: "Hillside mansions and billboard smiles. The view is expensive; the neighbors are worse." },
        { id: "vespucci", name: "Vespucci Beach", kind: "Boardwalk", note: "Muscle beach, skate parks, and a boardwalk economy built on sunglasses and optimism." },
        { id: "del-perro", name: "Del Perro Pier", kind: "Coastline", note: "Ferris wheel lights, tourist crowds, and the Pacific doing its best to look peaceful." },
        { id: "sandy-shores", name: "Sandy Shores", kind: "Desert town", note: "Dust, dive bars, and a lake that is more of a rumor than a resort." },
        { id: "paleto-bay", name: "Paleto Bay", kind: "Small town", note: "A sleepy northern town where a bank job feels like the biggest event of the decade." },
        { id: "grapeseed", name: "Grapeseed", kind: "Farmland", note: "Fields, barns, and a lot of open space for things to go wrong." },
        { id: "fort-zancudo", name: "Fort Zancudo", kind: "Military base", note: "Restricted airspace, armed guards, and a standing invitation to leave immediately." }
      ]
    },
    gta4: {
      title: "Liberty City, 2008",
      subtitle: "The cold city and its warmest lies.",
      locations: [
        { id: "broker", name: "Broker", kind: "Borough", note: "Niko and Roman's first neighborhood: tight streets, louder arguments, and rent that is always due." },
        { id: "dukes", name: "Dukes", kind: "Borough", note: "Industrial edges and residential pockets, with a skyline that never lets you forget where you are." },
        { id: "bohan", name: "Bohan", kind: "Borough", note: "Crowded blocks and a hard-won sense of community. Also a very good place not to owe someone money." },
        { id: "algonquin", name: "Algonquin", kind: "Manhattan stand-in", note: "Vertical city: media towers, museums, and a million windows into other people's business." },
        { id: "alderney", name: "Alderney", kind: "Industrial", note: "Factories, highways, and the kind of gray that settles into your jacket." },
        { id: "hove-beach", name: "Hove Beach", kind: "Immigrant quarter", note: "Russian storefronts, boardwalk air, and the first taste of Liberty City's promise for Niko." },
        { id: "middle-park", name: "Middle Park", kind: "Green space", note: "A rare patch of quiet in a city that rarely rewards stillness." },
        { id: "star-junction", name: "Star Junction", kind: "Neon crossing", note: "Billboards, crowds, and the feeling of being a very small story in a very large city." }
      ]
    },
    warriors: {
      title: "New York, 1979",
      subtitle: "A city with the lights on and the doors locked.",
      locations: [
        { id: "coney-island", name: "Coney Island", kind: "Home turf", note: "Boardwalk rides and the long way home. The Warriors' entire night is measured by the distance back to this place." },
        { id: "riverside-park", name: "Riverside Park", kind: "Park", note: "Trees, benches, and the kind of shadows that make a shortcut look like a mistake." },
        { id: "union-square", name: "Union Square", kind: "Crossroads", note: "Crowds, transit, and too many exits. Good for disappearing; bad for being followed." },
        { id: "soho", name: "SoHo", kind: "Nightlife", note: "Club lines, fire escapes, and a scene that stays open later than good judgment." },
        { id: "bowery", name: "The Bowery", kind: "Grit", note: "Flophouses, neon signs, and alleys that know more than they say." },
        { id: "96th-street", name: "96th Street", kind: "Uptown", note: "A line in the sand, a transfer point, and a reminder that the city belongs to whoever is standing there." },
        { id: "grand-central", name: "Grand Central", kind: "Terminal", note: "Hundreds of departures and one very bad time to be recognized." },
        { id: "tremont", name: "Tremont", kind: "Bronx turf", note: "Tenements, fire escapes, and a neighborhood where every wrong turn has a name." }
      ]
    },
    reddead: {
      title: "The Frontier, 1899",
      subtitle: "A map running out of blank space.",
      locations: [
        { id: "valentine", name: "Valentine", kind: "Frontier town", note: "Muddy streets, cattle auctions, and a saloon that has seen better men and worse decisions." },
        { id: "rhodes", name: "Rhodes", kind: "Southern town", note: "Sun-bleached storefronts and old grudges wearing their Sunday best." },
        { id: "saint-denis", name: "Saint Denis", kind: "Industrial city", note: "Electric light, streetcars, and the uncomfortable future arriving ahead of schedule." },
        { id: "blackwater", name: "Blackwater", kind: "Town", note: "A prosperous waterfront with a short memory and a long list of people who want something from you." },
        { id: "armadillo", name: "Armadillo", kind: "Desert town", note: "Heat, dust, and the kind of silence that suggests everyone is armed." },
        { id: "emerald-ranch", name: "Emerald Ranch", kind: "Ranchland", note: "Open fields and honest work, at least until somebody brings a problem through the gate." },
        { id: "annesburg", name: "Annesburg", kind: "Mining town", note: "Coal dust, company housing, and a town built around someone else's profit." },
        { id: "tall-trees", name: "Tall Trees", kind: "Wilderness", note: "Old forest and older violence. The law is a rumor out here." }
      ]
    },
    bully: {
      title: "Bullworth Academy",
      subtitle: "A small town with a very long social ladder.",
      locations: [
        { id: "bullworth-academy", name: "Bullworth Academy", kind: "Boarding school", note: "Gothic halls, detention slips, and a hierarchy more complicated than most governments." },
        { id: "bullworth-town", name: "Bullworth Town", kind: "Town center", note: "A quiet main street, a comic shop, and the occasional perfectly ordinary errand that goes sideways." },
        { id: "old-bullworth-vale", name: "Old Bullworth Vale", kind: "Affluent district", note: "Manicured lawns and old money, where a PTA meeting can feel like a border dispute." },
        { id: "new-coventry", name: "New Coventry", kind: "Greaser turf", note: "Garages, chain-link fences, and a neighborhood that does not hand out trust for free." },
        { id: "blue-skies", name: "Blue Skies Industrial Park", kind: "Industry", note: "Warehouses, fumes, and enough empty space for a very bad plan to find room to grow." },
        { id: "harrington-house", name: "Harrington House", kind: "Old estate", note: "Portraits, polished wood, and family secrets with excellent posture." },
        { id: "carnival", name: "Bullworth Carnival", kind: "Fairground", note: "Lights, games, and the strange freedom of a fairground after dark." },
        { id: "happy-volts", name: "Happy Volts Asylum", kind: "Institution", note: "A hulking building on the edge of town that everyone mentions and nobody wants to visit." }
      ]
    }
  };

  /* ---------------------------------------------------------------------
     FRANCHISE TIMELINE
     `theme` lets an event tune the site to a matching era skin.
     --------------------------------------------------------------------- */
  const timeline = [
    { id: "t-1997", year: "1997", title: "Grand Theft Auto", franchise: "GTA", theme: null, blurb: "DMA Design's top-down crime game introduces the series' core formula: steal cars, take jobs, and outrun the consequences." },
    { id: "t-1998", year: "1998", title: "Rockstar Games founded", franchise: "Other", theme: null, blurb: "Take-Two establishes Rockstar Games as a publishing label, setting the stage for a very loud next quarter-century." },
    { id: "t-1999a", year: "1999", title: "GTA: London 1969", franchise: "GTA", theme: null, blurb: "The first major expansion takes the top-down formula to a stylized London complete with period cars and attitudes." },
    { id: "t-1999b", year: "1999", title: "GTA: London 1961", franchise: "GTA", theme: null, blurb: "A free expansion pushes the clock back further, proving the series was already comfortable treating history as a playground." },
    { id: "t-2001", year: "2001", title: "Grand Theft Auto III", franchise: "GTA", theme: "gta4", blurb: "Liberty City goes 3D, and the open-world crime genre gets its defining template. The series would never look back." },
    { id: "t-2002", year: "2002", title: "GTA: Vice City", franchise: "GTA", theme: "vicecity", blurb: "Pastel suits, synth-pop, and Tommy Vercetti's rise. Vice City turns the series into a full-blown cinematic time capsule." },
    { id: "t-2003", year: "2003", title: "Manhunt", franchise: "Other", theme: null, blurb: "Rockstar pushes its darker instincts into a stealth-horror game about surveillance, violence, and the audience's appetite for both." },
    { id: "t-2004a", year: "2004", title: "GTA: San Andreas", franchise: "GTA", theme: "sanandreas", blurb: "Three cities, one enormous state, and a deeply personal homecoming story. San Andreas becomes a cultural landmark." },
    { id: "t-2004b", year: "2004", title: "Red Dead Revolver", franchise: "Red Dead", theme: "reddead", blurb: "Rockstar brings a pulp Western revenge tale to consoles, planting the seeds for a much larger frontier." },
    { id: "t-2005a", year: "2005", title: "GTA: Liberty City Stories", franchise: "GTA", theme: "gta4", blurb: "The handheld spin-off returns to Liberty City with a new perspective on old criminal politics." },
    { id: "t-2005b", year: "2005", title: "The Warriors", franchise: "Other", theme: "warriors", blurb: "Rockstar turns Walter Hill's 1979 cult film into a brawler, expanding the night with a prologue and a city full of gangs." },
    { id: "t-2006a", year: "2006", title: "GTA: Vice City Stories", franchise: "GTA", theme: "vicecity", blurb: "Vice City gets another angle, another protagonist, and another reminder that the 1980s were not a quiet decade." },
    { id: "t-2006b", year: "2006", title: "Bully", franchise: "Other", theme: "bully", blurb: "Rockstar Vancouver trades city blocks for school hallways and gives teenage hierarchy the full open-world treatment." },
    { id: "t-2008", year: "2008", title: "Grand Theft Auto IV", franchise: "GTA", theme: "gta4", blurb: "Liberty City becomes a gray, immigrant-story metropolis. Niko Bellic's arrival marks a colder, more grounded GTA era." },
    { id: "t-2009", year: "2009", title: "Episodes from Liberty City", franchise: "GTA", theme: "gta4", blurb: "The Lost and Damned and The Ballad of Gay Tony expand GTA IV's city into a three-sided story about loyalty, nightlife, and consequence." },
    { id: "t-2010", year: "2010", title: "Red Dead Redemption", franchise: "Red Dead", theme: "reddead", blurb: "John Marston's ride through the dying West becomes one of Rockstar's most acclaimed stories." },
    { id: "t-2011", year: "2011", title: "L.A. Noire", franchise: "Other", theme: null, blurb: "Team Bondi and Rockstar use performance capture to build a detective story where faces are evidence." },
    { id: "t-2012", year: "2012", title: "Max Payne 3", franchise: "Other", theme: null, blurb: "A burnt-out cop, a hazy city, and a bullet-time action symphony with a very bleak sense of humor." },
    { id: "t-2013", year: "2013", title: "Grand Theft Auto V", franchise: "GTA", theme: "gta5", blurb: "Three protagonists, one giant Los Santos, and a heist sandbox that becomes one of the best-selling games of all time." },
    { id: "t-2018", year: "2018", title: "Red Dead Redemption 2", franchise: "Red Dead", theme: "reddead", blurb: "The Van der Linde gang's final years become a slow-burning epic about loyalty, decay, and the cost of a story you tell yourself." },
    { id: "t-2023", year: "2023", title: "GTA VI revealed", franchise: "GTA", theme: "gta6", blurb: "The first trailer returns to Vice City and introduces Jason and Lucia, along with the state of Leonida." },
    { id: "t-2026", year: "2026", title: "Grand Theft Auto VI", franchise: "GTA", theme: "gta6", blurb: "The long-awaited return to Vice City arrives, expanding Leonida into a modern open-world stage for Rockstar's next era." }
  ];

  /* ---------------------------------------------------------------------
     BADGES
     --------------------------------------------------------------------- */
  const badges = [
    { id: "tuned-in", name: "Tuned In", desc: "Visit all eight era skins.", symbol: "signal" },
    { id: "daily-driver", name: "Daily Driver", desc: "Complete a Daily Signal run.", symbol: "calendar" },
    { id: "cracked-safe", name: "Cracked Safe", desc: "Solve a Vault Cracker puzzle.", symbol: "lock" },
    { id: "ghost-run", name: "Ghost Run", desc: "Clear a Heat Grid at par or better.", symbol: "route" },
    { id: "perfect-signal", name: "Perfect Signal", desc: "Finish a trivia run with 100% accuracy.", symbol: "star" },
    { id: "sudden-survivor", name: "Sudden Survivor", desc: "Build a five-answer streak in Sudden Death.", symbol: "bolt" },
    { id: "lorekeeper", name: "Lorekeeper", desc: "Answer 50 questions correctly across the archive.", symbol: "book" },
    { id: "decoy-hunter", name: "Decoy Hunter", desc: "Clear a Mythbuster run without a miss.", symbol: "eye" },
    { id: "profiler", name: "Profiler", desc: "Close a Clue Dossier without a wrong pick.", symbol: "target" }
  ];

  /* ---------------------------------------------------------------------
     ORIGINAL RADIO CHATTER
     Written for this project. No lines from the games.
     --------------------------------------------------------------------- */
  const chatter = {
    gta6: [
      "TRAFFIC: causeway backed up to the horizon. The sunset is doing most of the work.",
      "WEATHER: warm, loud, and a 90% chance of plot twists after midnight.",
      "LATE CALL: someone reports a stolen ambulance. The caller sounds more inconvenienced than alarmed."
    ],
    vicecity: [
      "BEACH REPORT: the water is fine, the business is questionable, and the parking is criminal.",
      "NIGHTLIFE: every club is full, every promise is temporary, and the jukebox knows too much.",
      "TRAFFIC: one stretch of Ocean Drive is moving at the speed of a very confident rumor."
    ],
    sanandreas: [
      "WEATHER: golden hour until further notice. Hydraulics optional but encouraged.",
      "TRAFFIC: alternate routes advised. The freeway is a suggestion, not a plan.",
      "NEIGHBORHOOD WATCH: if the block gets quiet, that is either good news or great news for someone else."
    ],
    gta5: [
      "CELEBRITY WATCH: a star was seen leaving a restaurant. This is considered an event.",
      "TRAFFIC: downtown is moving like a rumor through a group chat.",
      "LATE NIGHT: the pier is open, the lights are on, and the ocean is pretending it has no opinion."
    ],
    gta4: [
      "TRAFFIC: bridge delay. The skyline remains undefeated.",
      "WEATHER: overcast with a chance of unsolicited advice.",
      "CITY DESK: another promising evening is expected to become somebody else's problem."
    ],
    warriors: [
      "SUBWAY: uptown trains running with the usual amount of menace.",
      "NIGHT REPORT: the boardwalk is quiet for now. Do not mistake that for safe.",
      "TRANSIT: all exits are open. Whether they are useful is another matter."
    ],
    reddead: [
      "WIRE REPORT: dust on the trail, trouble at the saloon, no refunds.",
      "WEATHER: clear skies and a long ride ahead. Keep your powder dry.",
      "TOWN NOTICE: the law is looking for someone. The law is not always specific."
    ],
    bully: [
      "CAMPUS NOTICE: detention has been moved to the courtyard. Bring a helmet.",
      "TOWN BULLETIN: the carnival is open late and the principal has been asked to stop saying 'delightful'.",
      "WEATHER: autumn leaves, cold classrooms, and a very active rumor mill."
    ]
  };

  const site = {
    name: "CHANNEL SURF",
    fullName: "CHANNEL SURF — Unofficial Rockstar Lore Archive & Arcade",
    tagline: "Tune the era. Play the city.",
    disclaimer: "CHANNEL SURF is an independent, non-commercial fan project and front-end portfolio piece. It is not affiliated with, endorsed by, sponsored by, or approved by Rockstar Games, Take-Two Interactive, or any of their subsidiaries. I do not own, operate, or claim any rights to Grand Theft Auto, Red Dead, The Warriors, Bully, Max Payne, L.A. Noire, Midnight Club, or any related games, characters, locations, logos, trademarks, or other intellectual property. All such rights belong to their respective owners. The games and their lore are not my work and are not part of any project I own or claim. All quizzes, puzzle logic, original code, CSS, and vector art on this site were created for this project. References to games, lore, characters, and settings are included for commentary, criticism, education, and entertainment only. No game assets, audio, models, textures, screenshots, or copied dialogue are included. This site is a personal hobby/portfolio showcase, not a commercial product. If a rights holder believes anything here oversteps, contact me and I will remove or change it promptly."
  };

  const featuredLore = [
  {
    "id": "leonida-vice-city",
    "era": "gta6",
    "title": "Leonida & Vice City",
    "summary": "Grand Theft Auto VI returns to the fictional state of Leonida, a sun-bleached peninsula of causeways, wetlands, and neon coastline. Vice City is its loudest address: a modern resort metropolis built for money, music, and bad decisions. The revealed story follows Jason and Lucia through a state that treats every sunset like a premiere.",
    "wikiTitle": "Grand Theft Auto VI",
    "source": "https://en.wikipedia.org/wiki/Grand_Theft_Auto_VI",
    "tags": [
      "Leonida",
      "Vice City",
      "Jason & Lucia"
    ],
    "type": "location"
  },
  {
    "id": "tommy-vercetti",
    "era": "vicecity",
    "type": "character",
    "title": "Tommy Vercetti",
    "summary": "A made man with a long memory and a short temper. Tommy arrives in Vice City expecting a debt to be settled and decides to collect the whole city instead. His story is about refusing to be anyone's subordinate.",
    "wikiTitle": "Tommy Vercetti",
    "source": "https://en.wikipedia.org/wiki/Tommy_Vercetti",
    "tags": [
      "protagonist",
      "1986",
      "Vercetti"
    ]
  },
  {
    "id": "grove-street",
    "era": "sanandreas",
    "type": "faction",
    "title": "Grove Street Families",
    "summary": "A neighbourhood outfit defined by history, loyalty, and a losing war for territory. Grove Street is less a gang than a memory of one, which is exactly what makes it worth fighting for.",
    "wikiTitle": "Grove Street Families",
    "source": "https://en.wikipedia.org/wiki/Grand_Theft_Auto:_San_Andreas",
    "tags": [
      "gang",
      "1992",
      "Los Santos"
    ]
  },
  {
    "id": "jason-lucia",
    "era": "gta6",
    "type": "character",
    "title": "Jason & Lucia",
    "summary": "The revealed leads of GTA VI: a partnership built on trust in a state that rewards self-interest. Their story is framed as a modern crime romance rather than a lone-wolf rise.",
    "wikiTitle": "Grand Theft Auto VI",
    "source": "https://en.wikipedia.org/wiki/Grand_Theft_Auto_VI",
    "tags": [
      "protagonists",
      "2026",
      "Leonida"
    ]
  }
];
  const featuredStory = [
  {
    "id": "london-1961",
    "year": 1961,
    "title": "London, before the storm",
    "game": "Grand Theft Auto: London 1961",
    "era": "vicecity"
  },
  {
    "id": "vc-1986-arrival",
    "year": 1986,
    "title": "Tommy Vercetti gets out",
    "game": "Grand Theft Auto: Vice City",
    "era": "vicecity"
  },
  {
    "id": "sa-1992-return",
    "year": 1992,
    "title": "CJ comes home",
    "game": "Grand Theft Auto: San Andreas",
    "era": "sanandreas"
  },
  {
    "id": "gta4-2008-arrival",
    "year": 2008,
    "title": "Niko Bellic arrives",
    "game": "Grand Theft Auto IV",
    "era": "gta4"
  },
  {
    "id": "gta6-2026-premise",
    "year": 2026,
    "title": "Jason and Lucia",
    "game": "Grand Theft Auto VI",
    "era": "gta6"
  }
];

  return {
    featuredLore,
    featuredStory,
    eras,
    eraOrder,
    questions,
    fakeFacts,
    atlas,
    timeline,
    badges,
    chatter,
    site
  };
})();
