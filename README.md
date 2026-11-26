# AML Investigation Lab

Practice a short anti-money laundering investigation with two fictional alerts. Follow a transfer, compare company ownership records, and check which claims a draft can support.

**[Run the browser demo](https://assafsela-ai.github.io/aml-investigation-lab/)** · [Portfolio case study](https://assafsela-ai.github.io/Assaf-Sela/work/aml-investigation-lab/)

The browser uses fixed training scores, a prepared AI-style draft, and local field checks. It needs no keys or model calls. All case records are synthetic. The alert scores illustrate how ranking changes the queue on one labeled training set.

## Run the investigation

1. Open **Alert queue**. Compare the two rankings at the same review limit.
2. Inspect a transfer in **Money flow**. Try both cases.
3. Open **Ownership** in the Northstar case and compare the two claims about the same company.
4. Use **Check evidence**. Open the cited record and decide what to do next. In the Harbor case, uncheck **Include the settlement record** to see which claim loses support.

## Install the skills

Each folder in [skills](skills/) is a standalone Agent Skill. To use the skills in a project, copy the desired folders into that project's `.agents/skills/` for Codex or `.claude/skills/` for Claude Code. Open the project in your agent and ask for the skill by name.

| Skill | Input | Output |
| --- | --- | --- |
| [aml-alert-eval](skills/aml-alert-eval/SKILL.md) | Alert scores, review capacity, expected labels | Ranking comparison, cases captured and missed |
| [aml-case-review](skills/aml-case-review/SKILL.md) | Alert, transactions, case records | Cited timeline, findings, evidence gaps |
| [kyc-ownership-review](skills/kyc-ownership-review/SKILL.md) | Ownership records | Ownership claims, sources, conflicts |
| [aml-evidence-check](skills/aml-evidence-check/SKILL.md) | Draft findings and source records | Claim-by-claim checks and corrections |

For a first run, provide [data/cases.json](data/cases.json). Ask the agent to use one skill and name the case or review limit. Compare the result with the [expected findings](examples/expected.md).

## Run locally

With Python 3 installed, start a static server from the repository root.

    python -m http.server 8000

Open http://localhost:8000. To run the model checks with Node.js, use:

    node --test

## License

[MIT](LICENSE)
