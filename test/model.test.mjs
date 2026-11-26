import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { checkClaims, findOwnershipConflicts, rankAlerts } from "../model.mjs";

const { queue, cases } = JSON.parse(readFileSync(new URL("../data/cases.json", import.meta.url)));
const [northstar, harbor] = cases;

test("the same daily capacity reaches different alerts in each ranking", () => {
  const rules = rankAlerts(queue, "rules", 3);
  const context = rankAlerts(queue, "context", 3);
  assert.deepEqual(rules.selected.map(alert => alert.id), ["AML-1043", "AML-1044", "AML-1045"]);
  assert.deepEqual(context.selected.map(alert => alert.id), ["AML-1042", "AML-1046", "AML-1048"]);
  assert.deepEqual([rules.found, context.found, context.total], [0, 3, 3]);
});

test("an existing transfer record does not support a claim about the initiator", () => {
  const results = checkClaims(northstar.claims, [...northstar.transfers, ...northstar.documents]);
  assert.deepEqual(results.map(result => result.supported), [true, false]);
  assert.equal(results[1].record.id, "TX-1042-02");
});

test("removing the settlement record leaves the transfer fact intact", () => {
  const visible = [...harbor.transfers, ...harbor.documents];
  assert.deepEqual(checkClaims(harbor.claims, visible).map(result => result.supported), [true, true]);
  const withoutSettlement = visible.filter(record => record.type !== "settlement");
  assert.deepEqual(checkClaims(harbor.claims, withoutSettlement).map(result => result.supported), [true, false]);
});

test("ownership claims conflict only within the same date and entity pair", () => {
  assert.equal(findOwnershipConflicts(northstar.documents).length, 1);
  assert.equal(findOwnershipConflicts(harbor.documents).length, 0);
  const [first, second] = northstar.documents;
  assert.equal(findOwnershipConflicts([first, { ...second, asOf: "2026-10-15" }]).length, 0);
});
