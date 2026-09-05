(function (A) {
  'use strict';
  A.DIMENSIONS = Object.freeze({
    unit: 'cubit', court: { length: 100, width: 50, height: 5 },
    tent: { length: 30, width: 10, height: 10 },
    ark: { length: 2.5, width: 1.5, height: 1.5 },
    table: { length: 2, width: 1, height: 1.5 },
    altarOfIncense: { length: 1, width: 1, height: 2 },
    bronzeAltar: { length: 5, width: 5, height: 3 },
    curtains: { count: 10, length: 28, width: 4 },
    goatHairCurtains: { count: 11, length: 30, width: 4 }
  });
  A.entries = {
    court: {
      title: 'A court of fine linen', category: 'THE OUTER COURT',
      lede: 'A sanctuary begins with a boundary.',
      body: 'A rectangle of white linen marks out a sacred place within the wilderness. Its eastern gate is the way in. Bronze sockets anchor the pillars; silver hooks and connecting bands hold the hanging above the earth. The materials already tell a story: bronze belongs to the court, while gold will dominate the tent.',
      detail: 'Look along the long sides: each is one hundred cubits, twice the width of the court. The hanging is five cubits high. Cords and pegs make this an enclosure that can be taken down and carried.',
      fact: '100 × 50 × 5', unit: 'cubits · length / width / height',
      source: 'Exodus 27:9–19; 38:9–20',
      interpretation: 'The court is measured at the hanging lines. Pillar profiles, their wood, rope arrangements, terrain and distant mountains are reconstruction choices.'
    },
    gate: {
      title: 'The eastern gate', category: 'THE FIRST THRESHOLD',
      lede: 'Colour interrupts the white perimeter.',
      body: 'The twenty-cubit entrance is worked in blue, purple, scarlet and fine twined linen. Four pillars support its screen. The same palette returns at the entrance to the tent and at the inner veil, linking the three thresholds even as each leads into a more restricted space.',
      detail: 'The white hangings on either side of the gate each extend fifteen cubits. Together with the twenty-cubit screen, they complete the fifty-cubit eastern side.',
      fact: '20', unit: 'cubits · entrance screen width', source: 'Exodus 27:13–16; 38:13–18',
      interpretation: 'The gathered opening is provided for exploration. The embroidery pattern and the way the screen was moved are not specified.'
    },
    altar: {
      title: 'The bronze altar', category: 'OFFERING · OUTER COURT',
      lede: 'The first great object on the way in.',
      body: 'Acacia wood, overlaid with bronze, forms a hollow square altar. Four horns rise from its corners. Here the priests brought burnt offerings; the morning and evening offerings made its service part of the daily rhythm of the sanctuary.',
      detail: 'A bronze network sits halfway up the altar. Rings and bronze-covered poles allow the altar to travel. The ash pan, shovels and bowls belong to the practical work of tending it.',
      fact: '5 × 5 × 3', unit: 'cubits · length / width / body height', source: 'Exodus 27:1–8; 29:38–42; 38:1–7',
      interpretation: 'The declared height measures the altar body; horn tips and carrying poles extend beyond it. The internal bed, tools’ shapes and subdued embers are illustrative. No sacrificial scene is depicted.'
    },
    laver: {
      title: 'Water before service', category: 'WASHING · OUTER COURT',
      lede: 'Between the altar and the tent, a pause to wash.',
      body: 'The bronze basin and its stand hold water for Aaron and his sons to wash their hands and feet before entering the tent or serving at the altar. This is preparation for priestly service, rather than a drinking fountain.',
      detail: 'Exodus records an unusual source for its metal: the bronze mirrors of women who served at the entrance to the tent. A reflective everyday object became part of the sanctuary.',
      fact: 'Bronze', unit: 'basin and stand', source: 'Exodus 30:17–21; 38:8; 40:30–32',
      interpretation: 'Scripture gives no dimensions or detailed profile for the laver. Its basin, pedestal, water level and position within the intervening space are interpretive.'
    },
    tent: {
      title: 'A dwelling that travels', category: 'THE SANCTUARY',
      lede: 'A fabric roof. A framework overlaid with gold.',
      body: 'The Tabernacle is a portable sanctuary. Upright acacia boards, silver sockets and golden bars support coverings of woven cloth and skins. Twenty boards, each a cubit and a half wide, make each thirty-cubit long side.',
      detail: 'The Holy Place contains the table, lampstand and incense altar. Beyond the veil is the inner sanctuary containing the ark. The north–south placement of the table and lampstand follows Exodus 40.',
      fact: '30 × 10 × 10', unit: 'cubits · length / width / height', source: 'Exodus 26:15–37; 36:20–38; 40:18–28',
      interpretation: 'The brief fixes the tent at 30 × 10 × 10 cubits. A flat roof, thin boards, overlapping western corner boards and a 20/10-cubit division are adopted here. The text does not specify every joint or roof support.'
    },
    entrance: {
      title: 'The tent’s entrance', category: 'THE SECOND THRESHOLD',
      lede: 'The light changes at the hanging.',
      body: 'Five acacia pillars overlaid with gold stand in bronze sockets. Their hooks support a screen of blue, purple, scarlet and fine linen, made by an embroiderer. Passing this threshold brings the visitor from the open court into the Holy Place.',
      detail: 'Notice the material transition: gold above bronze bases at the entrance; deeper inside, the veil stands on silver bases.',
      source: 'Exodus 26:36–37; 36:37–38',
      interpretation: 'Draw the screen aside to explore. This opening mechanism is a modern study aid, not a claim about how the historical hanging was operated.'
    },
    coverings: {
      title: 'Four layers of shelter', category: 'THE TEXTILES',
      lede: 'The most intricate cloth faces inward.',
      body: 'Ten linen curtains, worked with blue, purple, scarlet and cherubim, form the innermost layer. Two sets of five are joined with fifty gold clasps. Above them, eleven longer goat-hair curtains are joined with fifty bronze clasps. Red-dyed ram skins and a final protective skin covering complete the shelter.',
      detail: 'Linen panels are 28 × 4 cubits; goat-hair panels are 30 × 4. Their extra length covers another cubit on each side. The sixth goat-hair curtain is doubled at the front. Look upward inside to see the embroidered linen and its seams.',
      fact: '10 linen · 11 hair', unit: '28 × 4 and 30 × 4 cubits per panel', source: 'Exodus 26:1–14; 36:8–19',
      interpretation: 'The layered flat-roof arrangement and folded corners are a reconstruction. The species denoted by the outer covering’s Hebrew term, tachash, is uncertain; neutral hide is shown without naming an animal.'
    },
    table: {
      title: 'The bread of the Presence', category: 'THE HOLY PLACE · NORTH',
      lede: 'Bread set continually before God.',
      body: 'An acacia table overlaid with gold stands on the northern side of the Holy Place, opposite the lampstand. A golden border surrounds it; dishes, bowls and other vessels belong to its service. The bread remains before God as an enduring part of the sanctuary’s life.',
      detail: 'Four rings at the legs receive carrying poles. Leviticus 24:5–9 specifies twelve loaves in two arrangements of six, represented here as two stacks.',
      fact: '2 × 1 × 1½', unit: 'cubits · length / width / table height', source: 'Exodus 25:23–30; 37:10–16; 40:22–23; Leviticus 24:5–9',
      interpretation: 'Vessel shapes, the profile of the loaves and decorative details are illustrative. The measured table excludes bread, vessels and carrying poles.'
    },
    menorah: {
      title: 'Seven lamps, one work', category: 'THE HOLY PLACE · SOUTH',
      lede: 'Gold shaped like a flowering plant.',
      body: 'The lampstand is hammered from pure gold. Six branches grow from a central shaft, with cups shaped like almond blossoms, buds and flowers. Seven oil lamps illuminate the space opposite it. The light comes from small reservoirs of oil, not wax candles.',
      detail: 'The lamps are tended with pure beaten olive oil. Exodus specifies a talent of gold for the lampstand and its implements, but gives no overall height.',
      fact: '7 lamps', unit: 'six branches and a central shaft', source: 'Exodus 25:31–40; 27:20–21; 37:17–24; 40:24–25',
      interpretation: 'Height, branch curves and base shape are reconstructed. The almond details follow the described botanical character; their exact form is not recoverable.'
    },
    incense: {
      title: 'The altar of incense', category: 'BEFORE THE VEIL',
      lede: 'A smaller altar, with a different purpose.',
      body: 'Gold covers the acacia wood of this slender altar. It stands before the veil, aligned with the ark beyond. Aaron burns fragrant incense here when he tends the lamps in the morning and evening.',
      detail: 'This altar is not for burnt offerings, grain offerings or poured drink offerings. Its service is specifically incense. Horns, a gold moulding, rings and carrying poles repeat the craftsmanship of the other furnishings.',
      fact: '1 × 1 × 2', unit: 'cubits · length / width / body height', source: 'Exodus 30:1–10; 37:25–29; 40:26–27',
      interpretation: 'The top’s shallow dish and the gentle smoke are illustrative. Horns and poles project beyond the measured body.'
    },
    veil: {
      title: 'Beyond the veil', category: 'THE THIRD THRESHOLD',
      lede: 'One fabric divides two kinds of space.',
      body: 'Cherubim are worked into the blue, purple, scarlet and fine linen of the veil. Four gold-covered pillars, standing in silver sockets, hold it between the Holy Place and the Most Holy Place. The ark is placed behind it.',
      detail: 'Its purpose is separation. The screened inner chamber was not an ordinary passageway. Here, you may draw the veil aside to study the room and the ark.',
      source: 'Exodus 26:31–35; 36:35–36; 40:20–21',
      interpretation: 'The drawn curtain and freely accessible interior are educational accommodations. The cherubim’s textile design is an interpretation, not a recovered ancient pattern.'
    },
    ark: {
      title: 'The ark of the testimony', category: 'THE MOST HOLY PLACE',
      lede: 'At the heart of the sanctuary, a small golden chest.',
      body: 'The ark is acacia wood overlaid with gold inside and outside. It holds the testimony given to Moses. A cover of pure gold—the mercy seat—rests above it. Two hammered gold cherubim face inward, their wings raised over the cover.',
      detail: 'God’s meeting with Moses is described as taking place above the cover, between the cherubim. Four rings carry the gold-covered poles; unlike removable furniture fittings, these poles are to remain in their rings.',
      fact: '2½ × 1½ × 1½', unit: 'cubits · length / width / chest height', source: 'Exodus 25:10–22; 37:1–9; 40:20–21',
      interpretation: 'The chest has the specified dimensions; the cover, cherubim and poles are additional. Their sculptural form is interpretive. The room’s gentle fill light is for viewing, not a depiction of divine presence.'
    },
    presence: {
      title: 'A dwelling among them', category: 'WHY THIS PLACE EXISTS',
      lede: 'The sanctuary is made to be carried, and to be inhabited.',
      body: 'Exodus begins the instructions with a purpose: a sanctuary in which God will dwell among the people. At the book’s close, the finished Tabernacle is covered by cloud and filled with glory. The cloud’s movement governs when the Israelites set out and when they remain.',
      detail: 'This reconstruction presents the architecture and furnishings for study. It does not attempt to picture God or reproduce the event of the glory filling the tent.',
      source: 'Exodus 25:8–9; 40:34–38',
      interpretation: 'The desert setting, sunlight and atmosphere are artistic context. This is an architectural interpretation of the text, not a claim to recover a surviving building.'
    }
  };
})(window.ASTRA = window.ASTRA || {});
