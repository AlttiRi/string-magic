import {ANSI_BLUE, t} from "../tester";
import {isTCRuleStringArray, TCRuleStrings, TitleCleaner} from "@/title-cleaner";


console.log(ANSI_BLUE("--- TC Simple ---"));

const rules_0: TCRuleStrings = [
    "sites:pixiv.net deviantart.com",
      "trim-start: ☑ ✅ ✔ ",
    "site:pixiv.net",
      "trim-end:: - pixiv",
    "site:deviantart.com",
      "trim-regex: on DeviantArt$", // "trim-end:: on DeviantArt",
    "site:artstation.com",
      "trim-start:: ArtStation - ",
];

t({
    result: isTCRuleStringArray(rules_0),
    expect: true,
});

const titleCleaner_0 = TitleCleaner.fromRuleStrings(rules_0);

t({
    result: titleCleaner_0.clean(
        "https://www.artstation.com/artwork/o0Yxm",
        "ArtStation - Overwatch Preorder Widowmaker Noire"
    ),
    expect: "Overwatch Preorder Widowmaker Noire",
});
t({
    result: titleCleaner_0.clean(
        "https://pixiv.net/artworks/123456",
        "✅ illustration, original, creation / フオリイ - pixiv"
    ),
    expect: "illustration, original, creation / フオリイ",
});
t({
    result: titleCleaner_0.clean(
        "https://www.pixiv.net/en/artworks/123456",
        "✅ illustration, original, creation / フオリイ - pixiv"
    ),
    expect: "illustration, original, creation / フオリイ",
});
t({
    result: titleCleaner_0.clean(
        "https://deviantart.com/view/123456",
        "☑ bridge structure 8 by sselfless on DeviantArt"
    ),
    expect: "bridge structure 8 by sselfless",
});
t({
    result: titleCleaner_0.clean(
        "https://www.deviantart.com/sselfless/art/bridge-structure-8-123456",
        "☑ bridge structure 8 by sselfless on DeviantArt"
    ),
    expect: "bridge structure 8 by sselfless",
});
