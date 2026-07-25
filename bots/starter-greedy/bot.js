// starter-greedy — reference opponent, hand-written.
//
// A yardstick, not a submission. I wrote it, so watching a model's bot against
// it tells you about the model; watching it against itself tells you nothing.
//
// Strategy: value compact high-yield bonuses at pick time, then push into the
// cheapest adjacent target every turn, reinforcing wherever the front is.

export const meta = {
  id: "starter-greedy",
  name: "Starter Greedy",
  author: "human",
  reference: true,
  description: "Expands into the cheapest reachable target and reinforces the front."
};

export function pick(request) {
  const { map, availablePicks, requiredPicks } = request;
  const bonusById = new Map(map.bonuses.map((bonus) => [bonus.id, bonus]));
  const territoryById = new Map(map.territories.map((territory) => [territory.id, territory]));

  const scored = availablePicks.map((territoryId) => {
    const territory = territoryById.get(territoryId);
    const bonus = bonusById.get(territory?.bonusId);
    if (!bonus) return { territoryId, score: 0 };
    // Value per territory: a 3-point bonus of 3 territories beats a 5-pointer
    // of 9, because you can actually finish it.
    const efficiency = bonus.value / Math.max(1, bonus.territories.length);
    return { territoryId, score: efficiency * 10 + bonus.value };
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

  // A territory is "front" if it touches anything not mine.
  const front = mine.filter((territory) =>
    territory.neighbors.some((neighborId) => !byId.get(neighborId)?.mine)
  );
  const deployTargets = front.length ? front : mine;

  // Find the cheapest capture available from each front territory.
  const candidates = [];
  for (const source of deployTargets) {
    for (const neighborId of source.neighbors) {
      const target = byId.get(neighborId);
      if (!target || target.mine) continue;
      const cost = requiredAttackers(target.armies);
      if (!Number.isFinite(cost)) continue; // too big a stack to crack at all
      candidates.push({ source, target, cost });
    }
  }
  candidates.sort((a, b) => a.cost - b.cost);

  // Put all income on the front territory with the best cheap target.
  const income = observation.income.total;
  const best = candidates[0]?.source ?? deployTargets[0];
  const deployments = income > 0 ? [{ territoryId: best.id, armies: income }] : [];

  const available = new Map(mine.map((territory) => [
    territory.id,
    territory.armies + (territory.id === best.id ? income : 0)
  ]));

  const orders = [];
  const claimed = new Set();
  for (const candidate of candidates) {
    if (claimed.has(candidate.target.id)) continue;
    const have = available.get(candidate.source.id) ?? 0;
    const movable = have - 1; // one army must stand guard
    if (movable < candidate.cost) continue;
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

/**
 * Attackers needed to capture from `defenders` under 0% luck / straight round.
 *
 * Two conditions, and forgetting the second is the classic mistake: you must
 * kill every defender AND still have someone left standing to hold the ground.
 * Against 1 defender, 1 attacker kills it and then dies — nothing is captured.
 */
function requiredAttackers(defenders) {
  const killedByDefence = Math.floor(defenders * 0.7 + 0.5);
  for (let attackers = 1; attackers <= 100; attackers += 1) {
    const killedDefenders = Math.floor(attackers * 0.6 + 0.5);
    const survivors = attackers - Math.min(attackers, killedByDefence);
    if (killedDefenders >= defenders && survivors >= 1) return attackers;
  }
  return Infinity;
}
