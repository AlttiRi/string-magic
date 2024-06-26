import {ANSI_BLUE, t} from "../tester";
import {UCRuleStrings, UrlCleaner} from "@/url-cleaner";


console.log(ANSI_BLUE("--- UC 1 Main ---"));

const rules_1: UCRuleStrings = [
    "sites:gfycat.com  example.com *.example.com  *.wikipedia.org", // "sites:" -- a multiple urls rule set
      "https",

    "site:discord.gg",
      "trim-search-params:fbclid",
    "site:test.testvideo.com", // example hostname
      "trim-regex:(?<main>\\/i\\/[^_]+)(?<trim_postfix>.*)", // https://test.testvideo.com/i/Q3w4R5t6R_123456789_0987654321

    "site:a.test.se",          // example hostname
      "prepend:https://web.archive.org/", // is OK
      // But beware (when there are both rules):
      // "prepend:https://web.archive.org/web/1/",
      // "recursive",
      // -> `RangeError: Maximum call stack size exceeded`
    "site:web.archive.org",
      "filter-start:https://web.archive.org/web/",
      "trim-regex:(?<trim_prefix>^.+web\\/\\d+\\/)", // https://web.archive.org/web/20240624135623/https://example.com/
      "recursive",

    "site:deviantart.com",
      "trim-start:https://www.deviantart.com/users/outgoing?",
      "decode-url",
      "recursive",
    "site:pixiv.net",
      "trim-start:https://www.pixiv.net/jump.php?",
      "decode-url",
      "recursive",
    "sites:subscribestar.com subscribestar.adult",
      "search-param:url",
      "atob",
      "recursive",
    "site:t.umblr.com",
      "filter-start:https://t.umblr.com/redirect", // "filter-start:", to only check the url, with no trimming
      "search-param:z",
      "recursive",

    "site:youtube.com",
      "trim-search-params:feature",
      "trim-search-params:t",
      "trim-search-params:si",
    "site:anonym.es",
      "trim-start:https://anonym.es/?",
    "site:anonym.to",
      "trim-start:https://anonym.to/?",
];


// ---
const urlCleaner = UrlCleaner.fromRuleStrings(rules_1);
// ---
function tt(opt: {input: string, expect: string}) {
    t({
        result: urlCleaner.clean(opt.input),
        expect: opt.expect,
        stackDeep: 1,
    });
}
// ---


// --- no changes --- //
tt({
    input:  "https://example.com/",
    expect: "https://example.com/",
});
tt({
    input:  "https://www.example.com/",
    expect: "https://www.example.com/",
});
tt({
    input:  "https://discord.gg/?a=1&q=2",
    expect: "https://discord.gg/?a=1&q=2",
});
tt({
    input:  "https://www.qwerty.com/",
    expect: "https://www.qwerty.com/",
});
// --- -- ------- --- //


// "https"
tt({
    input:  "http://example.com/",
    expect: "https://example.com/",
});
// "https"
tt({
    input:  "http://www.example.com/",
    expect: "https://www.example.com/",
});
// "https"
tt({
    input:  "http://qwerty.example.com/",
    expect: "https://qwerty.example.com/",
});

// "https"
tt({
    input:  "http://gfycat.com/DarkWhiteCat",
    expect: "https://gfycat.com/DarkWhiteCat",
});

// "prepend:https://web.archive.org/"
tt({
    input:  "http://a.test.se/qwerty.gif",
    expect: "https://web.archive.org/http://a.test.se/qwerty.gif",
});

// "trim-start:https://www.deviantart.com/users/outgoing?",
tt({
    input:  "https://www.deviantart.com/users/outgoing?https://www.qwerty.net/en/artworks/123456",
    expect: "https://www.qwerty.net/en/artworks/123456",
});

// "trim-regex:(?<main>\\/i\\/[^_]+)(?<trim_postfix>.*)"
tt({
    input:  "https://test.testvideo.com/i/Q3w4R5t6R_123456789_0987654321?q=123&w=456&e=qwe#asd",
    expect: "https://test.testvideo.com/i/Q3w4R5t6R",
});


// "filter-start:https://t.umblr.com/redirect", "search-param:z",
// "https"
tt({
    input:  "https://t.umblr.com/redirect?z=http%3A%2F%2Fgfycat.com%2FRedFatCat&m=1",
    expect: "https://gfycat.com/RedFatCat",
});

// "trim-start:https://www.deviantart.com/users/outgoing?", "decode-url",
// "https"
tt({
    input:  "https://www.deviantart.com/users/outgoing?http://en.wikipedia.org/wiki/Rock_%28geology%29",
    expect: "https://en.wikipedia.org/wiki/Rock_(geology)",
});

// "trim-start:https://www.pixiv.net/jump.php?", "decode-url",
tt({
    input:  "https://www.pixiv.net/jump.php?https%3A%2F%2Ffiles.qwerty.moe%2Fa2d1a3.png",
    expect: "https://files.qwerty.moe/a2d1a3.png",
});

// "trim-start:https://www.deviantart.com/users/outgoing?", "decode-url", "recursive",
// "trim-start:https://www.pixiv.net/jump.php?", "decode-url", "recursive",
tt({
    input:  "https://www.deviantart.com/users/outgoing?https://www.pixiv.net/jump.php?https%3A%2F%2Ftwitter.com%2FSpaceX%2Fstatus%2F1798792222743122164",
    expect: "https://twitter.com/SpaceX/status/1798792222743122164",
});

// "trim-start:https://www.deviantart.com/users/outgoing?", "recursive",
// "trim-search-params:fbclid",
tt({
    input:  "https://www.deviantart.com/users/outgoing?https://discord.gg/ABCDe9F?fbclid=Aq123e_QwErrTy45ZAQwsxCdE12w",
    expect: "https://discord.gg/ABCDe9F",
});


// "trim-start:https://www.deviantart.com/users/outgoing?", "recursive",
// "trim-start:https://subscribestar.com/away?url=", "atob", "recursive",
// "https"
tt({
    input:  "https://www.deviantart.com/users/outgoing?https://subscribestar.com/away?url=aHR0cDovL2V4YW1wbGUuY29tLw==",
    expect: "https://example.com/",
});

// ...same with extra "%0A" in the url
tt({
    input:  "https://www.deviantart.com/users/outgoing?https://subscribestar.com/away?url=aHR0cDovL2V4YW1wbGUuY29tLw==%0A",
    expect: "https://example.com/",
});

// "trim-start:https://www.deviantart.com/users/outgoing?", "decode-url",
// "https"
tt({
    input:  "https://www.deviantart.com/users/outgoing?http://www.wikipedia.org/",
    expect: "https://www.wikipedia.org/",
});

// "https"
tt({
    input:  "http://www.wikipedia.org/",
    expect: "https://www.wikipedia.org/",
});


tt({
    input:  "https://subscribestar.com/",
    expect: "https://subscribestar.com/",
});
tt({
    input:  "https://subscribestar.com/away",
    expect: "https://subscribestar.com/away",
});
tt({
    input:  "https://subscribestar.com/away?url=aHR0cDovL2V4YW1wbGUuY29tLw==",
    expect: "https://example.com/",
});
tt({
    input:  "https://subscribestar.com/away?url=aHR0cDovL2V4YW1wbGUuY29tLw==%0A",
    expect: "https://example.com/",
});

// "trim-search-params:feature"
tt({
    input:  "http://www.youtube.com/watch?feature=player_embedded&v=acWknWsvc-s",
    expect: "http://www.youtube.com/watch?v=acWknWsvc-s",
});
// "trim-search-params:feature", "trim-search-params:t"
tt({
    input:  "http://www.youtube.com/watch?feature=player_embedded&v=t0VjK-IH2z4&t=12",
    expect: "http://www.youtube.com/watch?v=t0VjK-IH2z4",
});

// "trim-start:..."
tt({
    input:  "https://anonym.es/?https://example.com/",
    expect: "https://example.com/",
});
tt({
    input:  "https://anonym.to/?https://example.com/",
    expect: "https://example.com/",
});

// "filter-start:https://web.archive.org/web/", "trim-regex:(?<trim_prefix>^.+web\\/\\d+\\/)"
tt({
    input:  "https://web.archive.org/web/20240624135623/https://example.com/",
    expect: "https://example.com/",
});
