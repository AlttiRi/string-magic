import {ANSI_BLUE, t} from "../tester";
import {UCRuleStrings, UrlCleaner} from "@/url-cleaner";


console.log(ANSI_BLUE("--- UC 2 WildCard ---"));

const rules_2: UCRuleStrings = [
    // Urls with "www." prefers non-wildcard rules. "github.com" is preferred over "*." rule.
    "sites: *.github.io  github.io",
      "https",
    "site:  *.github.io ",
      "prepend:https://web.archive.org/web/1/",
    "site:    github.io ",
      "prepend:https://web.archive.org/",

    "sites: *.example.com example.com",
      "https",
    "site:  *.example.com ",
      "prepend:https://web.archive.org/",

    // "example.org" will NOT be matched by "*.example.org", while "www.example.org" will.
    "site: *.example.org",
      "https",
    "site: *.example.org",
      "prepend:https://web.archive.org/",

    // Only "example.net" and "www.example.net", no "sub.example.net", or "sub.www.example.net"
    "site: example.net",
      "https",
    "site: example.net",
      "prepend:https://web.archive.org/",
];


// ---
const urlCleaner = UrlCleaner.fromRuleStrings(rules_2);
// ---
function tt(opt: {input: string, expect: string}) {
    t({
        result: urlCleaner.clean(opt.input),
        expect: opt.expect,
        stackDeep: 1,
    });
}
// ---


// "sites: *.example.com example.com",
//     "https",
// "site:  *.example.com ",
//     "prepend:https://web.archive.org/",
tt({
    input:  "http://example.com/",
    expect: "https://example.com/",
});
tt({
    input:  "http://www.example.com/",
    expect: "https://www.example.com/",
});
tt({
    input:  "http://sub.example.com/",
    expect: "https://web.archive.org/https://sub.example.com/",
});


// "site: *.example.org",
//     "https",
// "site: *.example.org",
//     "prepend:https://web.archive.org/",
tt({
    input:  "http://example.org/",
    expect: "http://example.org/", // since there no "example.org" rule, only "*.example.org"
});
tt({
    input:  "http://www.example.org/",
    expect: "https://web.archive.org/https://www.example.org/",
});
tt({
    input:  "http://sub.example.org/",
    expect: "https://web.archive.org/https://sub.example.org/",
});

// "site: example.net",
//     "https",
// "site: example.net",
//     "prepend:https://web.archive.org/",
tt({
    input:  "http://example.net/",
    expect: "https://web.archive.org/https://example.net/",
});
tt({
    input:  "http://www.example.net/",
    expect: "https://web.archive.org/https://www.example.net/",
});
tt({
    input:  "http://sub.example.net/",
    expect: "http://sub.example.net/",
});
tt({
    input:  "http://sub.www.example.net/",
    expect: "http://sub.www.example.net/",
});

// "sites: *.github.io  github.io",
//     "https",
// "site:  *.github.io ",
//     "prepend:https://web.archive.org/web/1/",
// "site:    github.io ",
//     "prepend:https://web.archive.org/",
tt({
    input:  "http://github.io/",
    expect: "https://web.archive.org/https://github.io/",
});
tt({
    input:  "http://www.github.io/",
    expect: "https://web.archive.org/https://www.github.io/",
});
tt({
    input:  "http://alttiri.github.io/",
    expect: "https://web.archive.org/web/1/https://alttiri.github.io/",
});
tt({
    input:  "http://alttiri.github.io/href-lister/",
    expect: "https://web.archive.org/web/1/https://alttiri.github.io/href-lister/",
});
