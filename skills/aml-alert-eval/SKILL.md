---
name: aml-alert-eval
description: Compare AML alert ranking methods at a fixed analyst review capacity using historical or synthetic labels. Use when evaluating a change to the order of an alert queue.
---

# AML alert ranking evaluation

Use the supplied alert IDs, scores or ordered result sets, review capacities, and expected priority labels. Ask for a missing capacity if the user has not specified one or supplied an example setting.

1. Confirm what the priority label means and which rows are eligible. Report IDs missing scores or labels, duplicates, and differences in coverage. Keep unknown labels out of outcome counts and give the number of unknowns inside each cutoff.
2. Compare both methods on the same eligible set and the same capacity. Sort descending by score. Use the stated tie-breaker or alert ID for deterministic ties. For ordered input, preserve the supplied order.
3. For each method and cutoff, show reviewed IDs, labeled priority cases captured and missed, and recall among labeled priority cases. Report recall as unavailable when there are zero labeled priority cases. Identify alerts added or displaced by the change.
4. Label results with the input period or dataset. For synthetic or small samples, describe what the comparison demonstrates on that sample.

Return a side-by-side comparison with a denominator and the IDs that explain the difference. Leave labels out of scoring and show any gaps that affect the comparison.
