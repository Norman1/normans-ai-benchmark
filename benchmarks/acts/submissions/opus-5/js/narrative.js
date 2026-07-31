// The book of Acts as an ordered sequence of scenes.
//
// The slider moves through this list. Order is the one thing Acts is certain
// about; dates are not, so there are none here except as soft context on a card.
//
// Every word of the prose is written for this page. There are no quotations.
//
//   at      places the scene concerns — the map moves to hold them
//   legs    journey legs that happen now, drawn bright; earlier ones stay faint
//   reach   what the message reaches at this point, for the spread overlay
//   act     what the slider position lets you do, which is the point of rule 2

(window.ACTS_ATLAS = window.ACTS_ATLAS || {}).narrative = {

  sections: [
    { id: "jerusalem", title: "Jerusalem", chapters: "1–7" },
    { id: "scattering", title: "The scattering", chapters: "8–9" },
    { id: "gentiles", title: "The door opens", chapters: "9–12" },
    { id: "first", title: "The first journey", chapters: "13–14" },
    { id: "council", title: "The council", chapters: "15" },
    { id: "europe", title: "Into Europe", chapters: "15–18" },
    { id: "ephesus", title: "Ephesus, and the road back", chapters: "18–21" },
    { id: "trials", title: "Arrest and trials", chapters: "21–26" },
    { id: "rome", title: "The voyage to Rome", chapters: "27–28" }
  ],

  episodes: [
    // ---------------------------------------------------------- Jerusalem --
    {
      s: "jerusalem", ch: "Acts 1", title: "Told to wait", at: ["Jerusalem", "Mount of Olives"],
      text: "It begins on the ridge east of the city, with a small group being told to do nothing for a while. They are also given the shape of everything that follows, as a geography: this city first, then the rest of Judaea and Samaria, then outward until the map runs out. The rest of the book is that sentence working itself out across roughly four thousand kilometres."
    },
    {
      s: "jerusalem", ch: "Acts 1", title: "Eleven make themselves twelve", at: ["Jerusalem"],
      text: "About a hundred and twenty people are meeting in an upstairs room. They fill the gap left by Judas, and the criterion is telling — it has to be someone who was there for the whole thing, from the beginning. At this point the movement is entirely a Jerusalem affair and could still be mistaken for one more sect in a city that had several."
    },
    {
      s: "jerusalem", ch: "Acts 2", title: "Pentecost", at: ["Jerusalem"],
      act: { type: "nations", label: "Show where the crowd came from" },
      reach: { places: ["Jerusalem"], by: "the twelve", note: "It starts here." },
      text: "Fifty days after Passover, at the wheat-harvest festival, Jerusalem is packed with Jews who have travelled in from all over the empire and beyond it. Something happens in the house where the group is meeting, a crowd gathers, and the thing that astonishes them is not the noise but that each of them is hearing it in the language they grew up speaking. Acts then does something unusual: it lists the homelands, fifteen of them, running from Parthia in the east to Rome in the west."
    },
    {
      s: "jerusalem", ch: "Acts 2", title: "Three thousand", at: ["Jerusalem"],
      text: "Peter stands up and explains it. The response is about three thousand people, which in a city of perhaps eighty thousand is not a fringe event. They start meeting daily, eating together in houses, and selling property to cover whoever is short."
    },
    {
      s: "jerusalem", ch: "Acts 3", title: "The man at the Beautiful Gate", at: ["Jerusalem"],
      text: "A man who has never walked is carried every day to a temple gate to beg. Peter and John have no money and heal him instead, and the sight of him walking into the temple courts draws the crowd that Peter then preaches to. It is the first time the movement causes a public scene."
    },
    {
      s: "jerusalem", ch: "Acts 4", title: "The first arrest", at: ["Jerusalem"],
      text: "The temple authorities arrest Peter and John overnight and put them in front of the council in the morning. The court is stuck: the healed man is standing right there and everyone in Jerusalem knows him. They are warned to stop talking and released, which sets the pattern for every legal encounter in the book — the charge never quite sticks."
    },
    {
      s: "jerusalem", ch: "Acts 4", title: "Nobody in need", at: ["Jerusalem"],
      text: "Acts pauses to describe how the group lives: property sold when someone runs short, the money handed over to the apostles to distribute. A landowner from Cyprus named Joseph sells a field and is given the nickname Barnabas. He will matter enormously later, and this is the first line of his file."
    },
    {
      s: "jerusalem", ch: "Acts 5", title: "Ananias and Sapphira", at: ["Jerusalem"],
      text: "A couple sell property, hold back part of the price, and present the rest as the whole. Both die when confronted, hours apart, and Acts reports it flatly. It is the book's bleakest scene and its point is uncomfortable: the community's shared purse was not a formality."
    },
    {
      s: "jerusalem", ch: "Acts 5", title: "Gamaliel's advice", at: ["Jerusalem"],
      text: "The apostles are arrested again, and this time the council is angry enough to consider killing them. A respected Pharisee named Gamaliel talks them down with an argument from recent history: two other movements had recently collapsed when their leaders died, so wait and see. They are flogged and let go."
    },
    {
      s: "jerusalem", ch: "Acts 6", title: "The seven", at: ["Jerusalem"],
      text: "The first internal fracture is linguistic. Greek-speaking Jewish widows are being overlooked in the daily food distribution run by Aramaic-speakers, and seven men are appointed to fix it. Every one of the seven has a Greek name, and two of them — Stephen and Philip — are about to take the movement out of Jerusalem entirely."
    },
    {
      s: "jerusalem", ch: "Acts 6–7", title: "Stephen", at: ["Jerusalem"],
      text: "Stephen argues in the synagogue of the Greek-speaking freedmen, loses them, and is dragged before the council on a charge of speaking against the temple. His defence is a long retelling of Israel's history built around a single provocative idea: God was never confined to a building, and the people who mattered met him abroad. He is stoned outside the city, and Acts mentions, almost in passing, that the witnesses laid their coats at the feet of a young man named Saul."
    },

    // --------------------------------------------------------- Scattering --
    {
      s: "scattering", ch: "Acts 8", title: "Scattered", at: ["Jerusalem", "Judaea", "Samaria"],
      act: { type: "spread", label: "Watch the message spread" },
      reach: { regions: ["iudaea"], by: "refugees", note: "Not a mission — people running." },
      text: "Stephen's death sets off a purge, and the believers scatter out of Jerusalem into the Judaean countryside and Samaria. This is the hinge of the whole book, and it is worth being clear about what it was: not a strategy, but refugees. Acts notes that the apostles stayed, so the message travelled with ordinary people who had somewhere to run to."
    },
    {
      s: "scattering", ch: "Acts 8", title: "Philip in Samaria", at: ["Samaria"], legs: ["philip-samaria"],
      reach: { places: ["Samaria"], by: "Philip" },
      text: "Philip goes north into Samaria — a deliberate step across a border that was not on any map but was thoroughly real. Jews and Samaritans had been avoiding each other for centuries over which mountain God had chosen. He preaches in the main city and it works."
    },
    {
      s: "scattering", ch: "Acts 8", title: "Simon offers money", at: ["Samaria"],
      text: "A local magician with a following of his own believes, is baptised, and then offers cash for the ability to hand on the Spirit. Peter's answer is unprintable in polite paraphrase. The word simony still carries his name."
    },
    {
      s: "scattering", ch: "Acts 8", title: "The desert road", at: ["Gaza", "Jerusalem"], legs: ["philip-gaza-road"],
      text: "Philip is sent south to the road that runs down from Jerusalem to Gaza, through country with nothing on it. He meets the treasurer of the Ethiopian queen — a court official from the kingdom of Meroë, on the Nile far south of Egypt — riding home in a carriage and reading aloud, as everyone did. The man is baptised at the first water they pass and carries the message off the southern edge of this map."
    },
    {
      s: "scattering", ch: "Acts 8", title: "Up the coast", at: ["Azotus", "Caesarea"], legs: ["philip-coast"],
      reach: { places: ["Azotus", "Caesarea"], by: "Philip" },
      text: "Philip turns up at Azotus, the old Philistine port, and works north through every town on the coastal plain until he reaches Caesarea. He settles there, and twenty-odd years later Paul will stay in his house. Acts is quietly good at this: minor characters do not vanish, they age."
    },
    {
      s: "scattering", ch: "Acts 9", title: "The Damascus road", at: ["Damascus", "Jerusalem"], legs: ["saul-to-damascus"],
      text: "Saul gets letters authorising him to arrest believers in Damascus and sets out — roughly two hundred and twenty kilometres, a week or more on the road. Whatever happened near the end of that journey left him blind, and the men with him unable to explain it. He is led into the city by the hand, which is not how he had planned to arrive."
    },
    {
      s: "scattering", ch: "Acts 9", title: "Straight Street", at: ["Damascus"],
      reach: { places: ["Damascus"], by: "believers already there" },
      text: "A believer named Ananias is told to go and find him, and says out loud what everyone must have been thinking — this is the man who has come here to arrest us. He goes anyway. Damascus already had believers before Saul arrived, which is why he was going there in the first place."
    },
    {
      s: "scattering", ch: "Acts 9", title: "Over the wall in a basket", at: ["Damascus"],
      text: "Saul starts arguing in the synagogues for the position he came to destroy, and within a short time there is a plan to kill him and a watch on the city gates. His new friends lower him down the outside of the wall at night in a large basket. His public career begins with an undignified escape and will end in custody."
    },
    {
      s: "scattering", ch: "Acts 9", title: "Barnabas vouches for him", at: ["Jerusalem"], legs: ["saul-to-jerusalem"],
      text: "In Jerusalem nobody will go near him, which is entirely reasonable. Barnabas — the Cypriot who sold his field — takes him in hand and introduces him to the apostles. It is the single most consequential act of character judgement in the book."
    },
    {
      s: "scattering", ch: "Acts 9", title: "Sent home", at: ["Caesarea", "Tarsus"],
      legs: ["saul-to-caesarea", "saul-to-tarsus"],
      text: "He argues with the Greek-speaking Jews in Jerusalem until they try to kill him too, and the believers quietly move him out through Caesarea and send him home to Tarsus. He then disappears from the narrative for years. Acts does not say what he did with them."
    },

    // ----------------------------------------------------------- Gentiles --
    {
      s: "gentiles", ch: "Acts 9", title: "Aeneas at Lydda", at: ["Lydda"], legs: ["peter-lydda"],
      reach: { places: ["Lydda"], by: "Peter" },
      text: "Peter is travelling the district and stops at Lydda, an inland town on the road up from the coast. A man who has been bedridden for eight years gets up. Acts keeps Peter moving west, towards the sea, and the direction turns out to matter."
    },
    {
      s: "gentiles", ch: "Acts 9", title: "Tabitha at Joppa", at: ["Joppa"], legs: ["peter-joppa"],
      reach: { places: ["Joppa"], by: "Peter" },
      text: "In the port of Joppa a woman named Tabitha dies. She is known for making clothes for widows, and when Peter arrives they show him the garments — one of the most human details in the book. He sends everyone out of the room and she lives; he stays in the town for some time, lodging with a tanner, a trade that made a man ritually awkward and permanently smelly."
    },
    {
      s: "gentiles", ch: "Acts 10", title: "A centurion sends for him", at: ["Caesarea"],
      text: "Thirty miles up the coast at Caesarea, a Roman officer named Cornelius is told to send for a man he has never heard of. He is a Gentile who prays and gives money to the Jewish poor — a familiar type in the eastern provinces, admiring the religion without taking on the whole of it. Three of his men set off for Joppa."
    },
    {
      s: "gentiles", ch: "Acts 10", title: "The roof at Joppa", at: ["Joppa"],
      text: "Peter goes up on the flat roof to pray while lunch is being made and sees a sheet let down full of animals he has spent his whole life not eating, and is told to help himself. He refuses three times. He is still trying to work out what it meant when the knock comes at the gate."
    },
    {
      s: "gentiles", ch: "Acts 10", title: "Inside a Roman house", at: ["Caesarea"], legs: ["peter-caesarea"],
      reach: { places: ["Caesarea"], by: "Peter", note: "The first Gentile household." },
      text: "Peter walks into a Roman officer's house, which is the thing the roof was about, and says so plainly on the doorstep. He takes six witnesses with him — a detail that reads exactly like a man who knows he will have to account for this. Before he has finished speaking the household is visibly in, and he can see no argument for refusing them baptism."
    },
    {
      s: "gentiles", ch: "Acts 11", title: "Explaining himself", at: ["Jerusalem"], legs: ["peter-back"],
      text: "The criticism when he gets back to Jerusalem is not about theology. It is that he went into a Gentile house and ate there. Peter retells the whole story from the beginning, which is why the reader gets it twice, and the objection subsides — for now."
    },
    {
      s: "gentiles", ch: "Acts 11", title: "As far as Antioch",
      at: ["Antioch", "Tyre", "Salamis"],
      legs: ["scatter-phoenicia", "scatter-cyprus", "scatter-antioch"],
      act: { type: "spread", label: "Watch the message spread" },
      reach: { places: ["Tyre", "Sidon", "Salamis", "Antioch"], regions: ["cyprus"], by: "refugees from Jerusalem" },
      text: "Acts now backtracks to the refugees of chapter eight and follows them: they got as far as Phoenicia, Cyprus and Antioch, speaking to Jews only. Then some men from Cyprus and Cyrene reached Antioch and started talking to Greeks as well, and it took. Nobody planned this and Acts does not name a single one of them."
    },
    {
      s: "gentiles", ch: "Acts 11", title: "Barnabas goes to find Saul", at: ["Tarsus", "Antioch"],
      legs: ["barnabas-to-tarsus", "barnabas-back"],
      text: "Jerusalem sends Barnabas to inspect Antioch. He approves, then goes to Tarsus to look for Saul — a hundred and forty kilometres away, after years of silence — and brings him back. The two of them teach there for a year."
    },
    {
      s: "gentiles", ch: "Acts 11", title: "Christians", at: ["Antioch"],
      text: "Antioch is the third city of the empire, perhaps a quarter of a million people, and it is where outsiders first coin a word for these people. The name is a Latin-shaped formation meaning the Christ-party, and it was almost certainly not a compliment. Antioch, not Jerusalem, becomes the base every journey in this book sets out from."
    },
    {
      s: "gentiles", ch: "Acts 11", title: "The famine", at: ["Antioch", "Jerusalem"], legs: ["famine-relief"],
      text: "A prophet named Agabus warns of a famine, and one does come under Claudius — Judaea was hit around the middle of the forties. The Antioch church takes a collection and sends it south with Barnabas and Saul. The gentile church's first act towards Jerusalem is money."
    },
    {
      s: "gentiles", ch: "Acts 12", title: "Herod kills James", at: ["Jerusalem"],
      act: { type: "herod", label: "Show Herod Agrippa's kingdom" },
      text: "Herod Agrippa the First — grandson of Herod the Great, raised in Rome, and briefly ruler of a kingdom as large as his grandfather's — executes James, one of the inner three. It is the first apostolic death in the book and Acts gives it a single sentence. Seeing it go down well, he arrests Peter too."
    },
    {
      s: "gentiles", ch: "Acts 12", title: "Peter walks out", at: ["Jerusalem"],
      text: "Peter is chained between two soldiers with guards on the door, and gets out anyway, convinced most of the way that he is dreaming. He knocks at the house where everyone is praying for him and the servant girl is so pleased she leaves him standing in the street. Acts is not above comedy."
    },
    {
      s: "gentiles", ch: "Acts 12", title: "Herod's death", at: ["Caesarea"],
      text: "Agrippa dies at Caesarea, publicly and horribly, after accepting a crowd's flattery that a king ought to have refused. Josephus tells the same story with the same setting and much the same detail. It is one of the few places where Acts and an outside historian can be laid side by side."
    },

    // ------------------------------------------------------ First journey --
    {
      s: "first", ch: "Acts 13", title: "Sent out from Antioch", at: ["Antioch", "Seleucia"],
      legs: ["j1-seleucia"],
      act: { type: "journey", journey: "first", label: "Follow the first journey" },
      text: "Five teachers are named at Antioch, and the mixture is the point: a Cypriot, a man called Niger, a Cyrenean, someone raised with Herod Antipas, and Saul. Two of them are sent off, and they walk the day's road down the Orontes to the port at Seleucia. Nobody in the story has any idea how far this will go."
    },
    {
      s: "first", ch: "Acts 13", title: "Salamis", at: ["Salamis"], legs: ["j1-salamis"],
      reach: { places: ["Salamis"], by: "Barnabas and Saul" },
      text: "They cross to Cyprus, which is Barnabas's home island, and start in the synagogues at Salamis on the east coast. John Mark is with them as an assistant. This is how it will go everywhere: the synagogue first, because that is where people already know the story so far."
    },
    {
      s: "first", ch: "Acts 13", title: "Across the island", at: ["Paphos"], legs: ["j1-across-cyprus"],
      reach: { places: ["Paphos"], by: "Barnabas and Saul" },
      text: "Acts says they went through the whole island, so this is a hundred and forty kilometres on foot to the Roman capital at Paphos, not a coastal hop. There they meet the proconsul Sergius Paulus and a Jewish magician attached to his household, and the confrontation goes badly for the magician. From this point the narrator switches to the name Paul and stops putting Barnabas first."
    },
    {
      s: "first", ch: "Acts 13", title: "Mark goes home", at: ["Perga"], legs: ["j1-perga"],
      text: "They sail north to Perga in Pamphylia, and John Mark leaves them there and goes back to Jerusalem. Acts gives no reason. It will cause a serious quarrel two chapters later, so somebody clearly thought it mattered."
    },
    {
      s: "first", ch: "Acts 13", title: "Pisidian Antioch", at: ["Pisidian Antioch"],
      legs: ["j1-pisidian-antioch"],
      reach: { places: ["Pisidian Antioch"], by: "Paul and Barnabas" },
      text: "The road inland climbs well over a kilometre from the fever-ridden coastal plain onto the Anatolian plateau, through mountains with a bandit problem. At the top is a Roman colony full of retired soldiers. Paul preaches in the synagogue, is invited back, draws most of the city the following week, and is thrown out by the end of the month."
    },
    {
      s: "first", ch: "Acts 14", title: "Iconium", at: ["Iconium"], legs: ["j1-iconium"],
      reach: { places: ["Iconium"], by: "Paul and Barnabas" },
      text: "The same shape at Iconium, a well-watered town on the plateau: a long stay, a divided city, and then word of a plan to stone them. They leave before it happens."
    },
    {
      s: "first", ch: "Acts 14", title: "Taken for gods", at: ["Lystra"], legs: ["j1-lystra"],
      reach: { places: ["Lystra"], by: "Paul and Barnabas" },
      text: "At Lystra, a small colony off the main road where the local language is not Greek, a healing convinces the crowd that Zeus and Hermes have turned up in person. The priest of the temple outside the gates brings oxen and garlands. Paul and Barnabas tear their clothes and can barely stop the sacrifice — the one time in Acts the problem is too much enthusiasm."
    },
    {
      s: "first", ch: "Acts 14", title: "Stoned, and back on his feet", at: ["Lystra"],
      text: "Opponents arrive from Antioch and Iconium — a hundred and fifty kilometres, which is a serious commitment to a grudge — and turn the same crowd. Paul is stoned and dragged out of town as a corpse. He gets up, goes back into the city, and leaves for Derbe the next morning."
    },
    {
      s: "first", ch: "Acts 14", title: "Derbe", at: ["Derbe"], legs: ["j1-derbe"],
      reach: { places: ["Derbe"], by: "Paul and Barnabas" },
      text: "Derbe is the last town before the frontier, and it goes well and quietly. From here the shortest way home is east through the Cilician Gates to Tarsus and down to Antioch — a straight run of a few hundred kilometres."
    },
    {
      s: "first", ch: "Acts 14", title: "Back through every town",
      at: ["Lystra", "Iconium", "Pisidian Antioch"],
      legs: ["j1-back-lystra", "j1-back-iconium", "j1-back-antioch", "j1-back-perga", "j1-attalia"],
      text: "Instead they turn round and walk back through Lystra, Iconium and Antioch — every place that had just run them out — to appoint elders and leave the new groups able to stand without them. It roughly doubles the journey and adds the risk back in. It is the clearest evidence in the book that they were building something rather than touring."
    },
    {
      s: "first", ch: "Acts 14", title: "The report", at: ["Antioch", "Attalia"], legs: ["j1-home"],
      text: "They sail home from Attalia and report to the church that sent them, and the way Acts sums up what they said is that the way in had been opened for Gentiles as they were. That report is about to cause the biggest argument in the book."
    },

    // ------------------------------------------------------------ Council --
    {
      s: "council", ch: "Acts 15", title: "The question", at: ["Antioch"],
      text: "Men come down from Judaea to Antioch teaching that Gentile believers must be circumcised. The question is not academic: it decides whether this is a movement within Judaism that outsiders may join on Jewish terms, or something else. Paul and Barnabas argue with them hard enough that Antioch sends a delegation to Jerusalem to settle it."
    },
    {
      s: "council", ch: "Acts 15", title: "Up through Phoenicia and Samaria",
      at: ["Jerusalem", "Tyre", "Samaria"], legs: ["council-up"],
      text: "They go overland rather than by sea, and Acts says why: they wanted to tell the story of the Gentiles in every town on the way. It is a five-hundred-kilometre campaign trip disguised as a journey to a meeting."
    },
    {
      s: "council", ch: "Acts 15", title: "The decision", at: ["Jerusalem"],
      text: "After a long argument Peter reminds them of Cornelius, Paul and Barnabas describe what they have seen, and James — the brother of Jesus, now leading in Jerusalem — proposes the settlement. Gentiles are in without becoming Jews first. They are asked to avoid four things, three of them about food, which is really about whether Jews and Gentiles can eat at the same table."
    },
    {
      s: "council", ch: "Acts 15", title: "The letter", at: ["Antioch"], legs: ["council-down"],
      text: "The decision goes back to Antioch as a letter, carried by two Jerusalem men so that nobody can claim it was Paul's version of events. The wording is careful and generous. Antioch is delighted."
    },
    {
      s: "council", ch: "Acts 15", title: "The quarrel", at: ["Antioch", "Salamis"],
      legs: ["mark-to-cyprus"],
      text: "Paul proposes revisiting the churches. Barnabas wants to take John Mark; Paul refuses because Mark walked out last time. Acts says the disagreement was sharp and they separated over it — Barnabas takes Mark to Cyprus and disappears from the book, and the man who vouched for Paul when nobody else would is never mentioned again."
    },

    // ------------------------------------------------------------- Europe --
    {
      s: "europe", ch: "Acts 15–16", title: "Overland to the passes", at: ["Tarsus", "Derbe"],
      legs: ["j2-cilicia", "j2-derbe"],
      act: { type: "journey", journey: "second", label: "Follow the second journey" },
      text: "Paul takes Silas and goes north by road this time, through Syria and Cilicia, then over the Taurus through the Cilician Gates — a cleft in the mountains in places barely wide enough for a cart. It puts him back among the churches of the first journey from the far side."
    },
    {
      s: "europe", ch: "Acts 16", title: "Timothy", at: ["Lystra"], legs: ["j2-lystra"],
      text: "At Lystra he picks up Timothy, whose mother was Jewish and father Greek — a mixed background that made him useful and awkward in equal measure. Paul has him circumcised, weeks after carrying a letter saying that was unnecessary. The letter was about whether Gentiles must; Timothy's mother made him a Jew already, and Paul was nothing if not practical."
    },
    {
      s: "europe", ch: "Acts 16", title: "Two doors shut",
      at: ["Pisidian Antioch", "Ephesus", "Bithynia"],
      legs: ["j2-phrygia-galatia", "j2-toward-asia", "j2-toward-bithynia"],
      act: { type: "blocked", label: "Show the directions they were refused" },
      text: "Two of the most interesting lines on this map are journeys that did not happen. They are stopped from speaking in Asia — the richest province within reach, with Ephesus at the centre of it. They turn north for Bithynia and are stopped again. Acts offers no explanation, and the result is a man walking across Anatolia with nowhere left to go but the sea."
    },
    {
      s: "europe", ch: "Acts 16", title: "Troas", at: ["Troas"], legs: ["j2-troas"],
      text: "He comes down to Troas on the Aegean coast, out of road. In the night he sees a Macedonian standing and asking for help. At this point the narrator starts saying we, without comment, and keeps it up on and off for the rest of the book."
    },
    {
      s: "europe", ch: "Acts 16", title: "Crossing to Europe", at: ["Samothrace", "Neapolis"],
      legs: ["j2-samothrace", "j2-neapolis"],
      reach: { places: ["Neapolis"], regions: ["macedonia"], by: "Paul, Silas, Timothy" },
      text: "A straight run with the wind behind them: Samothrace the first night, Neapolis the next day. Acts notes the speed, and later mentions the same crossing the other way taking five days — the sort of detail people who have actually been on ships put in. The message is now in Europe."
    },
    {
      s: "europe", ch: "Acts 16", title: "Philippi", at: ["Philippi"], legs: ["j2-philippi"],
      reach: { places: ["Philippi"], by: "Paul" },
      text: "Philippi is a Roman colony of a few thousand, settled with veterans, proud of its citizenship and short of Jews — there is no synagogue, only a prayer meeting by the river. The first convert in Europe is Lydia, a dealer in purple cloth from Thyatira, a woman running a business in an expensive commodity. She puts them all up."
    },
    {
      s: "europe", ch: "Acts 16", title: "The slave girl", at: ["Philippi"],
      text: "A slave girl who tells fortunes follows them around advertising them, accurately and at length, until Paul loses patience and the ability leaves her. Her owners lose an income stream. The charge they bring is not about the girl but about foreigners disturbing Roman customs, which is the first time Paul's Jewishness is used against him in a Roman court."
    },
    {
      s: "europe", ch: "Acts 16", title: "The earthquake", at: ["Philippi"],
      text: "Beaten and locked in the inner cell with their feet in stocks, they are singing at midnight when an earthquake opens the doors. The jailer assumes his prisoners have gone and reaches for his sword, because losing them would cost him his life anyway. Nobody has left."
    },
    {
      s: "europe", ch: "Acts 16", title: "Roman citizens", at: ["Philippi"],
      text: "In the morning the magistrates send word to release them quietly, and Paul refuses to go. They beat Roman citizens in public without a trial, and he intends them to come and say so. It is the first time he plays the citizenship card and it will not be the last."
    },
    {
      s: "europe", ch: "Acts 17", title: "Thessalonica", at: ["Thessalonica", "Amphipolis", "Apollonia"],
      legs: ["j2-amphipolis", "j2-apollonia", "j2-thessalonica"],
      reach: { places: ["Thessalonica"], by: "Paul" },
      text: "West on the Egnatian Way, the great Roman road across the Balkans, through Amphipolis and Apollonia to Thessalonica — the provincial capital and a free city with its own assembly. Three weeks of arguing in the synagogue, then a riot. The charge this time is political and dangerous: that they are proclaiming a rival to the emperor."
    },
    {
      s: "europe", ch: "Acts 17", title: "Berea", at: ["Berea"], legs: ["j2-berea"],
      reach: { places: ["Berea"], by: "Paul" },
      text: "Moved out at night to Berea, off the main road. Acts likes the Bereans: they took the argument seriously enough to check it daily against the texts rather than either swallowing or rejecting it. Then the Thessalonians hear where he is and come down."
    },
    {
      s: "europe", ch: "Acts 17", title: "Athens", at: ["Athens"], legs: ["j2-athens"],
      reach: { places: ["Athens"], regions: ["achaia"], by: "Paul" },
      text: "Athens by the time Paul saw it had been a museum piece for three centuries — no power, enormous prestige, and more statues than people, as one visitor complained. He argues in the marketplace until the philosophers take him up to the Areopagus to explain himself. His speech quotes their poets and not their scriptures, and when he gets to the resurrection some of them laugh."
    },
    {
      s: "europe", ch: "Acts 18", title: "Corinth", at: ["Corinth"], legs: ["j2-corinth"],
      reach: { places: ["Corinth"], by: "Paul" },
      text: "Corinth is the opposite of Athens: rebuilt as a Roman colony a century earlier, rich, new, and full of people on their way somewhere. Paul makes tents with a couple newly arrived from Italy, Aquila and Priscilla, expelled from Rome when Claudius threw out the Jews. He stays eighteen months, the longest he has stopped anywhere."
    },
    {
      s: "europe", ch: "Acts 18", title: "Gallio", at: ["Corinth"],
      text: "The Jewish community takes him before the proconsul Gallio, who throws the case out before Paul can open his mouth: this is an internal dispute about words and names, and not a Roman matter. The ruling effectively protects the movement across the province. Gallio is also the one solid date in the whole book — an inscription at Delphi pins his year in Corinth to about fifty-one or fifty-two."
    },
    {
      s: "europe", ch: "Acts 18", title: "Cenchreae, and the way home",
      at: ["Cenchreae", "Ephesus", "Caesarea", "Antioch"],
      legs: ["j2-cenchreae", "j2-ephesus", "j2-caesarea", "j2-up-to-jerusalem", "j2-home"],
      text: "He cuts his hair at Corinth's eastern port for a vow, sails for Syria with Aquila and Priscilla, and leaves them at Ephesus. He looks in on the synagogue there, refuses to stay, and promises to come back. Then the long run to Caesarea and home to Antioch."
    },

    // ------------------------------------------------------------ Ephesus --
    {
      s: "ephesus", ch: "Acts 18", title: "Apollos", at: ["Ephesus", "Alexandria", "Corinth"],
      text: "An eloquent Alexandrian Jew named Apollos turns up at Ephesus teaching accurately but incompletely — he knows only John's baptism. Priscilla and Aquila take him aside and fill in the gap, and he goes on to Corinth and is formidable there. Acts is unbothered that the movement's best public speaker in Achaia was trained by a tentmaking couple in a back room."
    },
    {
      s: "ephesus", ch: "Acts 19", title: "Through the upper country",
      at: ["Antioch", "Pisidian Antioch", "Ephesus"], legs: ["j3-galatia", "j3-ephesus"],
      act: { type: "journey", journey: "third", label: "Follow the third journey" },
      text: "Paul crosses Anatolia again by the inland road and comes down to Ephesus — the province he was forbidden to enter on the last trip. He will stay here nearly three years, longer than anywhere else in the book."
    },
    {
      s: "ephesus", ch: "Acts 19", title: "The lecture hall of Tyrannus", at: ["Ephesus"],
      reach: { places: ["Ephesus"], regions: ["asia"], by: "Paul and the Ephesian church" },
      text: "Three months in the synagogue, then two years hiring a lecture hall — daily, and one early manuscript adds the hours, from about eleven in the morning to four in the afternoon, which is the dead part of the day when the owner would not want it. Acts claims that everyone in the province heard the message during those two years. Ephesus was a city of perhaps a quarter of a million and the road hub of western Asia; from there, it is not an extravagant claim."
    },
    {
      s: "ephesus", ch: "Acts 19", title: "The sons of Sceva", at: ["Ephesus"],
      text: "Seven brothers running a freelance exorcism business try using Paul's formula on a man who turns on them and beats them out of the house naked. Ephesus had a reputation for magical texts — the Ephesian Letters were a known commodity. The story spreads, and people start burning their books; Acts prices the bonfire at fifty thousand pieces of silver, roughly fifty thousand days of a labourer's wages."
    },
    {
      s: "ephesus", ch: "Acts 19", title: "The silversmiths", at: ["Ephesus"],
      text: "Demetrius, who makes silver shrines of Artemis, calls a meeting of the trade and makes an argument that is refreshingly honest — first that their income is threatened, then that the goddess's honour is. The temple of Artemis was one of the seven wonders and the city's biggest business. A mob fills the theatre, which seated about twenty-four thousand, and shouts the same sentence for two hours. The city secretary eventually points out that a riot is exactly the sort of thing Rome removes a city's privileges for."
    },
    {
      s: "ephesus", ch: "Acts 20", title: "Macedonia and Greece",
      at: ["Neapolis", "Corinth"], legs: ["j3-macedonia", "j3-greece"],
      text: "He leaves for Macedonia and spends three months in Greece. Acts gives this stretch two verses and no ports; it is the thinnest stretch of geography in the book, and the routes here are drawn as reconstruction rather than record."
    },
    {
      s: "ephesus", ch: "Acts 20", title: "The plot on the ship", at: ["Philippi"],
      legs: ["j3-back-macedonia"],
      text: "He is about to sail for Syria when a plot against him is discovered, so he goes back the long way round by land through Macedonia. Acts then lists seven men travelling with him, from Berea, Thessalonica, Derbe and Asia — the delegation carrying the collection for Jerusalem, though Acts never quite says so."
    },
    {
      s: "ephesus", ch: "Acts 20", title: "Eutychus", at: ["Troas"], legs: ["j3-troas"],
      text: "Five days over to Troas, then a week there. On the last night Paul talks until midnight in an upstairs room full of lamps, and a young man called Eutychus falls asleep in a third-floor window and drops out of it. He is picked up dead and is not; Paul goes back upstairs, breaks bread, and carries on talking until dawn."
    },
    {
      s: "ephesus", ch: "Acts 20", title: "Paul walks to Assos", at: ["Assos", "Troas"],
      legs: ["j3-assos-ship", "j3-assos-foot"],
      act: { type: "compare", label: "Compare the ship's course with the walk" },
      text: "He sends the ship round Cape Lectum and walks the thirty-odd kilometres across the Troad on his own, having arranged it that way himself. Acts gives no reason, which is why it stays with you. The two lines on the map are the same journey."
    },
    {
      s: "ephesus", ch: "Acts 20", title: "Down the island coast",
      at: ["Mitylene", "Chios", "Samos", "Miletus"],
      legs: ["j3-mitylene", "j3-chios", "j3-samos", "j3-miletus"],
      text: "Four days of coastal hops down the Aegean: Mitylene, off Chios, across to Samos, then Miletus. He sails straight past Ephesus deliberately, because going in would cost him weeks and he wants to be in Jerusalem for Pentecost."
    },
    {
      s: "ephesus", ch: "Acts 20", title: "The elders at Miletus", at: ["Miletus", "Ephesus"],
      text: "Instead he sends to Ephesus, sixty kilometres away, and the elders come down to him — several days of message and travel while a ship waits. What he says to them is the only speech in Acts addressed to people already inside the movement, and he tells them plainly they will not see him again. Acts says they wept and went with him to the ship."
    },
    {
      s: "ephesus", ch: "Acts 21", title: "Cyprus on the left hand",
      at: ["Cos", "Rhodes", "Patara", "Tyre"],
      legs: ["j3-cos", "j3-rhodes", "j3-patara", "j3-tyre"],
      text: "Cos, Rhodes, Patara — then they change to a ship crossing open water to Phoenicia. Acts says they sighted Cyprus and left it on the left, which fixes the course south of the island, and the crossing takes about four days. This is the detail that shows someone on board was keeping track."
    },
    {
      s: "ephesus", ch: "Acts 21", title: "Seven days at Tyre", at: ["Tyre", "Ptolemais"],
      legs: ["j3-ptolemais"],
      text: "The ship unloads for a week at Tyre and they find believers there — the refugees of chapter eight, still going, twenty years on. They tell Paul not to go up to Jerusalem. The whole church walks him down to the beach with their wives and children and they pray on the sand."
    },
    {
      s: "ephesus", ch: "Acts 21", title: "Agabus at Caesarea", at: ["Caesarea"], legs: ["j3-caesarea"],
      text: "At Caesarea they stay with Philip — the same Philip, thirty years on, now with four daughters who prophesy. Agabus comes down from Judaea, ties his own hands and feet with Paul's belt, and says the owner of the belt will be handed to the Gentiles. Everyone begs Paul not to go, and he tells them to stop breaking his heart."
    },
    {
      s: "ephesus", ch: "Acts 21", title: "Up to Jerusalem", at: ["Jerusalem"], legs: ["j3-jerusalem"],
      text: "He goes anyway. James and the elders receive him warmly and then explain the problem: thousands of Jewish believers in the city have heard he teaches Jews abroad to abandon the law. They propose he pay for four men's temple vows to demonstrate otherwise. He agrees."
    },

    // ------------------------------------------------------------- Trials --
    {
      s: "trials", ch: "Acts 21", title: "The riot", at: ["Jerusalem"],
      text: "Jews from Asia spot him in the temple and start a riot on the assumption that he has taken a Greek past the barrier into the inner courts — a capital offence, and the warning notices said so in Greek and Latin. Two of those notices have been dug up. He is dragged out and being beaten to death when the garrison arrives at a run from the fortress overlooking the courts."
    },
    {
      s: "trials", ch: "Acts 21–22", title: "On the stairs", at: ["Jerusalem"],
      text: "The tribune assumes he is an Egyptian rebel who had led four thousand men into the desert a few years earlier. Paul answers him in Greek, asks to address the crowd, and does it in Aramaic from the barracks steps. They listen in silence until he mentions being sent to Gentiles, and then the noise starts again."
    },
    {
      s: "trials", ch: "Acts 22", title: "Born a citizen", at: ["Jerusalem"],
      text: "About to be flogged for a statement, Paul asks the waiting centurion whether it is legal to scourge a Roman citizen who has not been convicted. The tribune arrives and admits he bought his own citizenship for a large sum; Paul says he was born with it. Everyone steps back, including the tribune, who has already had him tied up."
    },
    {
      s: "trials", ch: "Acts 23", title: "Pharisees and Sadducees", at: ["Jerusalem"],
      text: "Put in front of the council, Paul announces that he is a Pharisee on trial over the resurrection — which splits the room, because the Sadducees did not believe in one. The meeting collapses into a shouting match between the two parties and the soldiers pull him out for his own safety. It is either a clever legal move or a true statement of what the case was about, and Acts lets it be both."
    },
    {
      s: "trials", ch: "Acts 23", title: "Forty men and a nephew", at: ["Jerusalem"],
      text: "More than forty men swear not to eat until Paul is dead, and arrange for the council to request another hearing so they can ambush the escort. Paul's nephew hears about it — the only relative who appears anywhere in the book — and gets word to the tribune. Nobody explains what he was doing in Jerusalem."
    },
    {
      s: "trials", ch: "Acts 23", title: "Out at nine at night",
      at: ["Antipatris", "Caesarea"], legs: ["guard-antipatris", "guard-caesarea"],
      text: "The escort is two hundred soldiers, seventy cavalry and two hundred spearmen, for one prisoner, moving after dark. They make Antipatris — sixty kilometres — in a night, and the infantry turn back at that point because they are clear of the hill country. The cavalry take him the rest of the way down to the coast."
    },
    {
      s: "trials", ch: "Acts 24", title: "Felix", at: ["Caesarea"],
      text: "The high priest comes down with a hired orator. Felix, who has been governor for years and knows the movement, adjourns and then keeps Paul in custody for two more, sending for him occasionally and hoping for a bribe. Tacitus's verdict on Felix is that he wielded royal power with the instincts of a slave."
    },
    {
      s: "trials", ch: "Acts 25", title: "I appeal to Caesar", at: ["Caesarea"],
      text: "Festus replaces Felix and inherits the case. When he suggests moving the trial to Jerusalem — where the ambush plan is still live — Paul uses the one move a Roman citizen has and appeals to the emperor. Festus confers with his council and grants it, and that single decision settles the rest of the book — and, as it turns out, pays Paul's fare to Rome."
    },
    {
      s: "trials", ch: "Acts 26", title: "Agrippa and Bernice", at: ["Caesarea"],
      text: "Festus now has to send a prisoner to Rome without being able to state a charge, so he borrows the judgement of Herod Agrippa the Second, who arrives with his sister Bernice and a good deal of ceremony. Paul tells his own story for the third time in the book. Agrippa's private verdict afterwards is that the man could have been released if he had not appealed."
    },

    // --------------------------------------------------------------- Rome --
    {
      s: "rome", ch: "Acts 27", title: "Sailing late", at: ["Caesarea", "Sidon"], legs: ["v-sidon"],
      act: { type: "journey", journey: "voyage", label: "Follow the voyage to Rome" },
      text: "They sail from Caesarea in a coaster from Adramyttium, with a centurion named Julius in charge and at least two friends travelling with Paul. The season is already wrong — by the end of September the eastern Mediterranean is closing for the winter. The first day out brings them to Sidon and Julius lets Paul go ashore to friends, which tells you something about how the prisoner was regarded."
    },
    {
      s: "rome", ch: "Acts 27", title: "Under the lee of Cyprus", at: ["Myra"], legs: ["v-cyprus"],
      text: "The wind is against them, so instead of running straight across to Asia they pass on the sheltered side of Cyprus and work west along the Cilician and Pamphylian coast, where a westward current and land breezes help. This is not a scenic detour; it is what you did in a square-rigged ship with the wind in your face."
    },
    {
      s: "rome", ch: "Acts 27", title: "The grain ship", at: ["Myra", "Cnidus"], legs: ["v-cnidus"],
      text: "At Myra the centurion finds an Alexandrian ship bound for Italy and transfers everyone aboard. This is a grain freighter — Egypt fed Rome, the run was underwritten by the state, and these ships were among the largest afloat. There are two hundred and seventy-six people on this one, which is a number nobody would invent."
    },
    {
      s: "rome", ch: "Acts 27", title: "Fair Havens", at: ["Salmone", "Fair Havens", "Lasea"],
      legs: ["v-salmone", "v-fair-havens"],
      text: "Days of hard sailing to get level with Cnidus, then they are pushed off course and duck south of Crete, rounding Cape Salmone to get out of the wind. They fetch up at Fair Havens, a bay near the town of Lasea, and by now the autumn fast has gone by — the Day of Atonement, so early October. Paul, who has been shipwrecked three times already, says sailing on will cost them the ship. The captain, the owner and the centurion disagree, and the majority want a better harbour to winter in."
    },
    {
      s: "rome", ch: "Acts 27", title: "A soft south wind", at: ["Fair Havens", "Phoenix"],
      legs: ["v-phoenix"],
      text: "Phoenix is sixty-five kilometres west along the same coast, a harbour that faces the right way to sit out a winter. When a gentle southerly comes up they think they have what they need and slip along the shore. They never get there."
    },
    {
      s: "rome", ch: "Acts 27", title: "Euraquilo", at: ["Cauda"], legs: ["v-cauda"],
      text: "A hurricane-force wind comes down off the mountains — the sailors' name for it means the north-easter, and Acts gives it in their slang. There is no steering into that, so they run before it and get a few hours of shelter behind a small island called Cauda. In those hours they haul the ship's boat aboard, pass cables under the hull to hold it together, and — Acts is specific — lower the gear, because their real fear is not sinking but being driven south onto the Syrtis shoals."
    },
    {
      s: "rome", ch: "Acts 27", title: "Fourteen days", at: ["Cauda", "Syrtis"], legs: ["v-drift"],
      act: { type: "drift", label: "How this line was worked out" },
      text: "The next day they throw cargo over the side, the day after that the ship's tackle. Then two weeks with no sun and no stars, which in the ancient Mediterranean meant no idea where you were. The line drawn here is a reconstruction, not a course: a north-easter across that stretch of sea, for fourteen days, puts a drifting ship almost exactly where Acts says it ended up."
    },
    {
      s: "rome", ch: "Acts 27", title: "Twenty fathoms, then fifteen", at: ["Malta"],
      text: "Around midnight on the fourteenth night the sailors sense land — the sound of surf, most likely. They sound and get twenty fathoms, sound again a little later and get fifteen. They drop four anchors from the stern and wait for daylight, and the crew's attempt to leave in the ship's boat under pretence of laying out more anchors is stopped by Paul, of all people, telling the soldiers to cut it loose."
    },
    {
      s: "rome", ch: "Acts 27", title: "Aground", at: ["Malta"],
      reach: { places: ["Malta"], by: "shipwreck" },
      text: "In the morning they see a bay with a beach, cut the anchors, and run for it. The bow sticks fast where two seas meet and the stern begins to break up. The soldiers propose killing the prisoners so none can swim off, and the centurion stops them because he wants to save Paul. Everyone gets ashore."
    },
    {
      s: "rome", ch: "Acts 28", title: "The viper", at: ["Malta"],
      text: "The islanders light a fire in the rain and a snake fastens on Paul's hand as he puts brushwood on it. The locals conclude he is a murderer whom justice has caught up with, then that he is a god, and Acts reports the swing without comment. They stay three months, and the leading man of the island, Publius, has an estate nearby and puts them up."
    },
    {
      s: "rome", ch: "Acts 28", title: "Castor and Pollux", at: ["Syracuse", "Rhegium"],
      legs: ["v-syracuse", "v-rhegium"],
      text: "They leave in another Alexandrian grain ship that had wintered at the island, with the heavenly twins for a figurehead — the patrons of sailors, and Acts notices the carving. Three days at Syracuse, then up to Rhegium on the toe of Italy, where they wait a day for a wind to carry them through the strait."
    },
    {
      s: "rome", ch: "Acts 28", title: "Puteoli", at: ["Puteoli"], legs: ["v-puteoli"],
      reach: { places: ["Puteoli"], by: "believers already there" },
      text: "A south wind takes them the last stretch in a day and a half, into Puteoli on the Bay of Naples — where Rome's grain came in, and the natural landfall for an Alexandrian ship. There are believers there already and the centurion lets them stay a week. Nobody knows who took the message to Puteoli."
    },
    {
      s: "rome", ch: "Acts 28", title: "Down the road to meet him",
      at: ["Appii Forum", "Three Taverns"], legs: ["v-appii", "v-three-taverns"],
      reach: { places: ["Appii Forum", "Three Taverns"], by: "believers from Rome" },
      text: "On the Appian Way, believers from Rome come out to meet him — one group as far as the Forum of Appius, sixty-five kilometres down the road, another to Three Taverns, about fifty. Acts says the sight of them cheered him up. The message had reached the capital years before its most famous traveller did, and the book never says how."
    },
    {
      s: "rome", ch: "Acts 28", title: "Two years, at his own expense", at: ["Rome"],
      legs: ["v-rome"],
      reach: { places: ["Rome"], by: "Paul, at last", note: "The city only. Acts says nothing about the rest of Italy." },
      text: "He is allowed to live on his own in rented lodgings with a soldier attached to him, and he spends two years there receiving anyone who comes. Then Acts simply stops — no verdict, no execution, no release. A book that has been meticulous about ports and provinces for twenty-eight chapters declines to tell you how it ended, and its final word is a Greek adverb meaning that nobody was stopping him."
    }
  ]
};
