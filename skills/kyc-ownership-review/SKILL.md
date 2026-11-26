---
name: kyc-ownership-review
description: Compare customer ownership records for an AML or KYC review. Use to extract owners and stakes, flag conflicting claims, and identify what an analyst needs to verify.
---

# KYC ownership review

Identify the company and the as-of date requested. Use the provided records and their original lines or fields.

1. Extract each company, owner, stake, type of interest, effective date, and source line. Keep reported percentages and their basis. Flag ambiguity when a record could describe capital, voting rights, or indirect ownership.
2. Compare statements only after aligning the company, owner, stake basis, and effective date. Treat a different date as a possible change and an unspecified date as uncertainty. Keep separate candidates when a shared name is the only link.
3. When two comparable records disagree, quote or summarize both claims with locators. Use a later correction to resolve a conflict only if it clearly supersedes the original assertion for that same date.

Return a source-linked ownership table, unresolved conflicts, and an exact document or question that could resolve each one. Preserve separate direct and indirect relationships when the sources establish them.
