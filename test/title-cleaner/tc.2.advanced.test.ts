import {ANSI_BLUE, t} from "../tester";
import {isTCRuleStringArray, TCRuleStrings, TitleCleaner} from "@/title-cleaner";



console.log(ANSI_BLUE("--- TC Advanced ---"));

const rules_1: TCRuleStrings = [
    "sites:example.com asdf.com",
      "trim-start: ☑ ✅ ✔ ",

    "site:example.com",
      "trim-start-end:[ ]",
      "trim-end:|: - some text | - another text",

    "site:asdf.com",       // extra rules
      "trim-end:: - on ASDF",
      "trim-end:: | on ASDF",

    "site:lorem.com",
      "trim-start:|: [ ☑ ] | [ ✅ ] | [ ✔ ]",
      "trim-start-end: [ ]",

    "sites:*.x.com x.com", // will work for any hostname ends with `x.com`
      "trim-start:  ☑ ✅ ✔",

    "site:*.twitter.com",  // will work for `www.twitter.com` / `aaa.twitter.com`, but not for `twitter.com`
      "trim-start:  ☑ ✅ ✔",

    "site:qwerty.com",     // strict hostname matching, but it will work for `www.qwerty.com` too
      "trim-start:  ☑ ✅ ✔",


    "site:regex.org",
      "trim-regex: on RegEx$",
    "site:regex.moe",
      "trim-regex:on RegEx$",
    "site:regex.co",
      "trim-regex:\\[\\s+\\d+\\s+]$",
];

t({
    result: isTCRuleStringArray(rules_1),
    expect: true,
});

const titles_1 = [
    ["https://example.com/", "✔✔✔ Lorem Ipsum"],
    ["https://example.com/", " ✔✔✔ Lorem Ipsum"],
    ["https://example.com/", " ✔ ✔ ✔ Lorem Ipsum"],
    ["https://example.com/", " ✔ ✔ ✔ Lorem Ipsum "],
    ["https://example.com/", "✔✔✔ Lorem Ipsum"],
    ["https://example.com/", "Lorem Ipsum - some text"],
    ["https://example.com/", "Lorem Ipsum - another text"],
    ["https://example.com/", "[Lorem Ipsum - another text]"],

    ["https://asdf.com/", "✔✔✔ Lorem Ipsum | on ASDF"],
    ["https://asdf.com/", "☑ Lorem Ipsum - on ASDF"],

    ["https://asdf.com/", "Lorem Ipsum - on ASDF"],
    ["https://asdf.com/", "Lorem Ipsum | on ASDF"],

    ["https://lorem.com/", "[ Lorem Ipsum ]"],
    ["https://lorem.com/", "[Lorem Ipsum]"],
    ["https://lorem.com/", "[ ✔ ] Lorem Ipsum"],


    [          "https://x.com/", "✔ Lorem Ipsum"],
    [      "https://www.x.com/", "✔ Lorem Ipsum"],
    [  "https://example.x.com/", "✔ Lorem Ipsum"],
    [     "https://test.x.com/", "✔ Lorem Ipsum"],
    [ "https://xxx.test.x.com/", "✔ Lorem Ipsum"],

    ["https://mobile.twitter.com/", "✔ Lorem Ipsum"],
    [   "https://www.twitter.com/", "✔ Lorem Ipsum"],
 // [       "https://twitter.com/", "✔ Lorem Ipsum"], // will do nothing [expected]

    [    "https://qwerty.com/", "✔ Lorem Ipsum"],
    ["https://www.qwerty.com/", "✔ Lorem Ipsum"],
 // ["https://aaa.qwerty.com/", "✔ Lorem Ipsum"],     // will do nothing [expected]


    ["https://regex.org/", "Lorem Ipsum on RegEx"],
    ["https://regex.moe/", "Lorem Ipsum on RegEx"],
    ["https://regex.co/",  "Lorem Ipsum [  123  ]"],
];

const titleCleaner_1 = TitleCleaner.fromRuleStrings(rules_1);
for (const [url, title] of titles_1) {
    const newTitle = titleCleaner_1.clean(url, title);
    t({
        result: newTitle,
        expect: "Lorem Ipsum",
    });
}


// The same rule is recursive, but not the rule set. // todo [?] "recursive"
t({
    result: titleCleaner_1.clean("https://example.com/", "[[[Lorem Ipsum] - some text]]"),
 // expect:  "Lorem Ipsum",
    expect: "[Lorem Ipsum]",
});
