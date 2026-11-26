export function rankAlerts(queue, method, capacity) {
  const ranked = [...queue].sort((left, right) =>
    right[method] - left[method] || left.id.localeCompare(right.id));
  const selected = ranked.slice(0, capacity);
  const found = selected.filter(alert => alert.priority).length;
  const total = ranked.filter(alert => alert.priority).length;
  return { ranked, selected, found, total };
}

export function checkClaims(claims, sources) {
  return claims.map(claim => {
    const source = sources.find(record => record.id === claim.source);
    const supported = Boolean(source) &&
      Object.entries(claim.fields).every(([field, value]) =>
        Object.hasOwn(source, field) && source[field] === value);
    return { ...claim, record: source, supported };
  });
}

export function findOwnershipConflicts(documents) {
  const ownership = documents.filter(record => record.type === "ownership");
  const groups = new Map();
  for (const record of ownership) {
    const key = JSON.stringify([record.subject, record.owner, record.asOf]);
    const group = groups.get(key) ?? [];
    group.push(record);
    groups.set(key, group);
  }
  return [...groups.values()].filter(group =>
    new Set(group.map(record => record.stake)).size > 1);
}
