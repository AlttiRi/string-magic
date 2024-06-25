import {ANSI_BLUE, t} from "../tester";
import {UCRuleStrings, UrlCleaner} from "@/url-cleaner";


console.log(ANSI_BLUE("--- UC Compile Common Rules ---"));

const rules_3: UCRuleStrings = [
    "sites:  gfycat.com *.gfycat.com  *.wikipedia.org",
      "https",
    "site:gfycat.com",
      "trim-search-params:fbclid",
    "site:deviantart.com",
      "trim-start:https://www.deviantart.com/users/outgoing?",
      "decode-url",
      "recursive",
    "site:t.umblr.com",
      "filter-start:https://t.umblr.com/redirect",
      "search-param:z",
      "recursive",
];

const compiled_rules = UrlCleaner.compileRuleStrings(rules_3);
t({
    result: JSON.stringify(compiled_rules.ruleRecords),
    expect: JSON.stringify({
        "gfycat.com": [
            { "command": "https" },
            { "command": "trim-search-params", "data": "fbclid" }
        ],
        "deviantart.com": [
            { "command": "trim-start", "data": "https://www.deviantart.com/users/outgoing?" },
            { "command": "decode-url" },
            { "command": "recursive" }
        ],
        "t.umblr.com":[
            { "command": "filter-start", "data": "https://t.umblr.com/redirect" },
            { "command": "search-param", "data": "z" },
            { "command": "recursive" }
        ]
    }),
});
t({
    result: JSON.stringify(compiled_rules.ruleRecordsWC),
    expect: JSON.stringify({
        "gfycat.com":[
            { "command": "https" }
        ],
        "wikipedia.org":[
            { "command": "https" }
        ]
    }),
});


const urlCleaner = UrlCleaner.fromRuleRecords(compiled_rules);

t({
    result:  urlCleaner.clean("https://gfycat.com/?fbclid=123"),
    expect: "https://gfycat.com/",
});
t({
    result:  urlCleaner.clean("https://t.umblr.com/redirect?z=http%3A%2F%2Fgfycat.com%2FRedFatCat&m=1"),
    expect: "https://gfycat.com/RedFatCat",
});
t({
    result:  urlCleaner.clean("https://www.deviantart.com/users/outgoing?https://t.umblr.com/redirect?z=http%3A%2F%2Fgfycat.com%2FRedFatCat&m=1"),
    expect: "https://gfycat.com/RedFatCat",
});
t({
    result:  urlCleaner.clean("https://www.deviantart.com/users/outgoing?https%3A%2F%2Ft.umblr.com%2Fredirect%3Fz%3Dhttp%253A%252F%252Fgfycat.com%252FRedFatCat%26m%3D1"),
    expect: "https://gfycat.com/RedFatCat",
});

t({
    result:  urlCleaner.clean("http://en.wikipedia.org/"),
    expect: "https://en.wikipedia.org/",
});
t({
    result:  urlCleaner.clean("http://www.wikipedia.org/"),
    expect: "https://www.wikipedia.org/",
});
t({
    result:  urlCleaner.clean("http://wikipedia.org/"),
    expect: "http://wikipedia.org/", // [!] note still "http://"
});
