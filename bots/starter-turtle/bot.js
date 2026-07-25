// starter-turtle — reference opponent, hand-written.
//
// A yardstick, not a submission. Deliberately the strategic opposite of
// starter-greedy: it finishes bonuses and stacks its border instead of grabbing
// whatever is cheapest. Two reference bots that play differently are more useful
// than two that play well — a submission that handles both has actually
// understood something.

export const meta = {
  id: "starter-turtle",
  name: "Starter Turtle",
  author: "human",
  reference: true,
  description: "Completes bonuses, stacks the border, expands only inside its own regions."
};

export function pick(request) {
  const { map, availablePicks, requiredPicks } = request;
  const bonusById = new Map(map.bonuses.map((bonus) => [bonus.id, bonus]));
  const territoryById = new Map(map.territories.map((territory) => [territory.id, territory]));

  const scored = availablePicks.map((territoryId) => {
    const territory = territoryById.get(territoryId);
    const bonus = bonusById.get(territory?.bonusId);
    if (!bonus) return { territoryId, score: 0 };
    // Prefer small bonuses outright — fewer territories means it can be closed
    // and then held with a short border.
    const size = bonus.territories.length;
    return { territoryId, score: bonus.value * 4 - size * 2 };
  });

  scored.sort((a, b) => b.score - a.score);
  return { picks: scored.slice(0, requiredPicks).map((entry) => entry.territoryId) };
}

export function turn(request) {
  const { observation } = request;
  const territories = observation.territories;
  const byId = new Map(territories.map((territory) => [territory.id, territory]));
  const mine = territories.filter((territory) => territory.mine);
  if (mine.length === 0) return { orders: { deployments: [], orders: [] } };

  const myBonuses = new Set(mine.map((territory) => territory.bonusId));

  // Expansion targets, strictly ranked: unowned territory inside a bonus I am
  // already invested in comes first.
  const candidates = [];
  for (const source of mine) {
    for (const neighborId of source.neighbors) {
      const target = byId.get(neighborId);
      if (!target || target.mine) continue;
      const cost = requiredAttackers(target.armies);
      if (!Number.isFinite(cost)) continue; // too big a stack to crack at all
      candidates.push({
        source,
        target,
        cost,
        priority: (myBonuses.has(target.bonusId) ? 0 : 1) + (target.owner !== null ? 2 : 0)
      });
    }
  }
  candidates.sort((a, b) => a.priority - b.priority || a.cost - b.cost);

  // Reinforce the most exposed border territory — the one facing the most
  // non-owned neighbours — rather than the one about to attack.
  const exposure = (territory) =>
    territory.neighbors.filter((neighborId) => !byId.get(neighborId)?.mine).length;
  const border = mine.filter((territory) => exposure(territory) > 0);
  const anchor = border.sort((a, b) => exposure(b) - exposure(a) || a.armies - b.armies)[0] ?? mine[0];

  const income = observation.income.total;
  const deployments = income > 0 ? [{ territoryId: anchor.id, armies: income }] : [];

  const available = new Map(mine.map((territory) => [
    territory.id,
    territory.armies + (territory.id === anchor.id ? income : 0)
  ]));

  const orders = [];
  const claimed = new Set();
  for (const candidate of candidates) {
    if (candidate.priority > 1) continue; // never open a fight with a player
    if (claimed.has(candidate.target.id)) continue;
    const have = available.get(candidate.source.id) ?? 0;
    // Keep a real garrison behind, not just the mandatory single army.
    const reserve = candidate.source.id === anchor.id ? 3 : 1;
    if (have - reserve < candidate.cost) continue;
    orders.push({
      from: candidate.source.id,
      to: candidate.target.id,
      armies: candidate.cost,
      mode: "attackTransfer"
    });
    available.set(candidate.source.id, have - candidate.cost);
    claimed.add(candidate.target.id);
  }

  return { orders: { deployments, orders } };
}

/** Enough to kill every defender and still leave a survivor to hold the ground. */
function requiredAttackers(defenders) {
  const killedByDefence = Math.floor(defenders * 0.7 + 0.5);
  for (let attackers = 1; attackers <= 100; attackers += 1) {
    const killedDefenders = Math.floor(attackers * 0.6 + 0.5);
    const survivors = attackers - Math.min(attackers, killedByDefence);
    if (killedDefenders >= defenders && survivors >= 1) return attackers;
  }
  return Infinity;
}
