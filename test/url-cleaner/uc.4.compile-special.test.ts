import {ANSI_BLUE, t} from "../tester";
import {UCRuleStrings, UrlCleaner} from "@/url-cleaner";


console.log(ANSI_BLUE("--- UC Compile Special Rules ---"));

const rules_4: UCRuleStrings = [
    "sites: ", // empty site // todo
      "https",
    "site:  ", // empty site // todo
      "atob",
    "site:xxx.net",             // no rules   // [+]
      // ...
    "sites:lorem.com asdf.com", // no rules   // [+]
      // ...
    "site:qwerty.com",
      "trim-search-params:",    // empty rule // todo
    "site:duplicate.org",
      "trim-search-params:xxx",
    "site:duplicate.org",
      "trim-search-params:xxx", // duplicate rule // todo
    "site:text.moe moe", // multiple sites (data) in "site:" // todo
      "https",
    "site:ok.org",
      "search-param:ok",
      "decode-url",
      "recursive",
];

const compiled_rules_x = UrlCleaner.compileRuleStrings(rules_4);

t({
    result: JSON.stringify(compiled_rules_x.ruleRecords),
    expect: JSON.stringify({
        "": [ // empty hostname // todo
            { "command": "https" },
            { "command": "atob"  }
        ],
        "qwerty.com": [ // empty rules // todo
            { "command": "trim-search-params", "data": "" }
        ],
        "duplicate.org": [ // duplicate rules // todo
            { "command": "trim-search-params", "data": "xxx" },
            { "command": "trim-search-params", "data": "xxx" }
        ],
        "text.moe moe": [ // wrong hostname // todo
            { "command": "https" }
        ],
        "ok.org": [
            { "command": "search-param", "data": "ok" },
            { "command": "decode-url" },
            { "command": "recursive"  }
        ]
    }),
});

t({
    result: JSON.stringify(compiled_rules_x.ruleRecordsWC),
    expect: JSON.stringify(null),
});