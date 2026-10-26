import { test } from "node:test";
import assert from "node:assert/strict";
import {
  financeAvailability,
  validFinanceCrop,
} from "../src/utils/financeAvailability.js";
const base = { loading: false, result: {}, stale: false, crops: [] };
test("explains absent, running and stale analysis distinctly", () => {
  assert.equal(
    financeAvailability({ ...base, result: null }),
    "financeRunAnalysis",
  );
  assert.equal(
    financeAvailability({ ...base, result: null, loading: true }),
    "financeLoading",
  );
  assert.equal(financeAvailability({ ...base, stale: true }), "stale");
});
test("distinguishes missing evidence from actual exclusions", () => {
  assert.equal(financeAvailability(base), "financeMissingEvidence");
  assert.equal(
    financeAvailability({ ...base, crops: [{ status: "insufficient_data" }] }),
    "financeMissingEvidence",
  );
  assert.equal(
    financeAvailability({ ...base, crops: [{ status: "not_suitable" }] }),
    "financeNoSuitable",
  );
});
test("only accepted statuses enable the calculator", () => {
  for (const status of ["conditional", "recommended"])
    assert.equal(
      financeAvailability({ ...base, crops: [{ status }] }),
      "ready",
    );
});
test("selects a new eligible crop and clears invalid or absent selections", () => {
  const crops = [
    { cropKey: "olive", status: "not_suitable" },
    { cropKey: "almond", status: "conditional" },
  ];
  assert.equal(validFinanceCrop(crops, "olive"), "almond");
  assert.equal(validFinanceCrop(crops, "almond"), "almond");
  assert.equal(validFinanceCrop([], "almond"), "");
  assert.equal(
    validFinanceCrop([{ cropKey: "olive", status: "not_suitable" }], "olive"),
    "",
  );
});
