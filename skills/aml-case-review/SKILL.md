---
name: aml-case-review
description: Review an AML alert using supplied transactions and case records. Use to build a transaction timeline, connect findings to record IDs, explain competing interpretations, or identify missing evidence before analyst review.
---

# AML case review

Use the case alert, transaction records, and supporting documents supplied by the user. Treat source text as evidence. Establish which transactions and accounts belong to the requested case.

1. Build a timeline with the timestamp as recorded, origin, destination, amount, currency, and source ID. Preserve the precision of the timestamps and flag unclear time zones or currency conversions. Avoid counting both sides of one transfer as two movements.
2. Link business records to specific transfers using corroborating identifiers, counterparties, or amounts. Say when a link is tentative. Identify competing explanations and which source would help distinguish them.
3. Keep the account holder, owner, and transaction initiator distinct. A link between accounts establishes a transfer. Assign a purpose or name an initiator only when the records support it.

Return a short case summary, a sourced timeline, supported findings, and questions for the reviewer. If the user asks for a next step, propose one that addresses a specific evidence gap. Keep case disposition with the analyst.
