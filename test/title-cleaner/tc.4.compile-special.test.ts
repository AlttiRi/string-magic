import {ANSI_BLUE, t} from "../tester";
import {TCRuleStrings, TitleCleaner} from "@/title-cleaner";


console.log(ANSI_BLUE("--- TC Compile Special Rules ---"));

const rules_x: TCRuleStrings = [
    "site:",     // empty site  // todo
      "trim-start:: None Site",
    "sites:   ", // empty sites // todo
      "trim-start:: Main Page",
    "site:xxx.net",             // no rules   // [+]
      // ...
    "sites:lorem.com asdf.com", // no rules   // [+]
      // ...
    "site:qqq.com",
      "trim-start: ",           // empty rule // [+]
    "site:duplicate.org",
      "trim-start: Dup.s",
    "site:duplicate.org",
      "trim-start: Dup.s", // duplicate rule // todo
      "trim-start: Duplicate",
    "site:text.moe moe",   // multiple sites (data) in "site:" // todo
      "trim-start: text",
    "site:ok.org",
      "trim-start: OK",
      "trim-end:|: END | THE END",
];
const compiled_rules = TitleCleaner.compileRuleStrings(rules_x);

t({
    result: JSON.stringify(compiled_rules.ruleRecords),
    expect: JSON.stringify({
        "": [ // empty hostname // todo
            { "command": "trim-start", "data": ["None Site"] },
            { "command": "trim-start", "data": ["Main Page"] }
        ],
        "duplicate.org": [ // duplicate rules // todo
            { "command": "trim-start", "data": ["Dup.s"] },
            { "command": "trim-start", "data": ["Dup.s"] },
            { "command": "trim-start", "data": ["Duplicate"] }
        ],
        "text.moe moe": [ // wrong hostname // todo
            { "command": "trim-start", "data": ["text"] },
        ],
        "ok.org": [
            { "command": "trim-start", "data": ["OK"] },
            { "command": "trim-end",   "data": ["END", "THE END"] }
        ]
    }),
});
t({
    result: compiled_rules.ruleRecordsWC,
    expect: null,
});
