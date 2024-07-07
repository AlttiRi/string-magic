import {ANSI_BLUE, t} from "../tester";
import {TCRuleStrings, TitleCleaner} from "@/title-cleaner";


console.log(ANSI_BLUE("--- TC Compile Common Rules ---"));

const rules_common: TCRuleStrings = [
    "sites:example.com qwerty.com",
      "trim-start:: Test Prefix ",
    "sites:  example.com  ",
      "trim-start-end: (  ) ",
    "sites:*.twitter.com twitter.com",
      "trim-start: Twitter X",
    "site:x.com",
      "trim-end:: on X",
    "site:*.qwerty.com",
      "trim-end:|: Lorem 1 | - Qwerty | - Q | ",
    "site:regex101.com",
      "trim-regex:\\(Example\\) \\d+ - ?",
];
const compiled_rules = TitleCleaner.compileRuleStrings(rules_common);

t({
    result: JSON.stringify(compiled_rules.ruleRecords),
    expect: JSON.stringify({
        "example.com": [
            { "command": "trim-start",     "data": ["Test Prefix"] },
            { "command": "trim-start-end", "data": ["(", ")"]      }
        ],
        "qwerty.com": [
            { "command": "trim-start", "data": ["Test Prefix"] }
        ],
        "twitter.com": [
            { "command": "trim-start", "data": ["Twitter", "X"] }
        ],
        "x.com": [
            { "command": "trim-end",   "data": ["on X"] }
        ],
        "regex101.com": [
            { "command": "trim-regex", "data": "\\(Example\\) \\d+ - ?" }
        ],
    }),
});
t({
    result: JSON.stringify(compiled_rules.ruleRecordsWC),
    expect: JSON.stringify({
        "twitter.com": [
            { "command": "trim-start", "data": ["Twitter", "X"] }
        ],
        "qwerty.com": [
            { "command": "trim-end",   "data": ["Lorem 1", "- Qwerty", "- Q"] }
        ]
    }),
});

const titleCleaner = TitleCleaner.fromRuleRecords(compiled_rules);
t({
    result: titleCleaner.clean(
        "https://x.com/",
        "XXX on X"
    ),
    expect: "XXX",
});
t({
    result: titleCleaner.clean(
        "https://qqq.qwerty.com/",
        "QQQ - Qwerty"
    ),
    expect: "QQQ",
});
t({
    result: titleCleaner.clean(
        "https://example.com/",
        "(Example)"
    ),
    expect: "Example",
});
t({
    result: titleCleaner.clean(
        "https://regex101.com/",
        "(Example) 123 - RegEx"
    ),
    expect: "RegEx",
});
