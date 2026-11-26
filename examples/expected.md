# Expected findings

Use [cases.json](../data/cases.json) as the input. The case IDs, records, and priority labels are synthetic.

| Skill | Example request | Expected findings |
| --- | --- | --- |
| aml-alert-eval | Compare the rules and context scores at a capacity of three. | The rules queue contains AML-1043, AML-1044, and AML-1045, capturing zero of three priority cases. The context queue contains AML-1042, AML-1046, and AML-1048, capturing three of three. |
| aml-case-review | Review AML-1043 and cite the record that explains the outgoing transfer. | TX-1043-01 shows USD 48,400 incoming. TX-1043-02 shows USD 48,000 outgoing. DOC-1043-A, line 21, ties the outgoing payment to a supplier settlement via HF-721. |
| kyc-ownership-review | Compare the AML-1042 ownership records as of 12 October 2026. | DOC-1042-A line 14 reports Maya Levin at 60%. DOC-1042-B line 08 reports 30%. Both refer to voting shares on the same date. The correct percentage remains open. |
| aml-evidence-check | Audit the two AML-1042 draft claims against the supplied sources. | TX-1042-02 supports the transfer of USD 47,800. The draft's claim that Maya Levin personally initiated it lacks support. No initiator is listed, and ownership records do not establish that action. |

Repeat the evidence check for AML-1043 after removing DOC-1043-A from the available sources. The transfer claim should stay supported. The supplier settlement claim should lose support.
