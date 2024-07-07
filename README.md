# string-magic

~~ It's not a magic string, it's a string magic. ~~

Some util "StringRule"-driven functions do some string transformations.

I think, this lib will be mostly for my personal use, so the readme is short.

---

There are two string cleaners — `TitleCleaner` and `UrlCleaner`.

The first one is to clean sites' titles from a boilerplate text like `"on Twitter"`,
the second one is to clean URLs (to remove search params and do some other things like removing site's redirects).

You describe rules as a string array, then apply them on a string is associated with some URL.

---

## TitleCleaner

```ts
const tcRules: TCRuleStrings = [
    "site:artstation.com",
      "trim-start:: ArtStation - ",
    "site:deviantart.com",
      "trim-end:: on DeviantArt",
];
const titleCleaner = TitleCleaner.fromRuleStrings(tcRules);

titleCleaner.clean(
    "https://www.artstation.com/artwork/o0Yxm",
    "ArtStation - Overwatch Preorder Widowmaker Noire"
);
//  "Overwatch Preorder Widowmaker Noire"
```

## UrlCleaner
```ts
const ucRules: UCRuleStrings = [
    "site:youtube.com",
      "trim-search-params:feature t si list",
    "site:t.umblr.com",
      "filter-start:https://t.umblr.com/redirect",
      "search-param:z",
      "recursive",
    "site:deviantart.com",
      "trim-start:https://www.deviantart.com/users/outgoing?",
      "decode-url",
      "recursive",
];
const urlCleaner = UrlCleaner.fromRuleStrings(ucRules);

urlCleaner.clean("https://t.umblr.com/redirect?z=http%3A%2F%2Fgfycat.com%2FRedFatCat&m=1");
// "https://gfycat.com/RedFatCat"

urlCleaner.clean("http://www.youtube.com/watch?feature=player_embedded&v=z_HWtzUHm6s");
// "http://www.youtube.com/watch?v=z_HWtzUHm6s"

urlCleaner.clean("https://www.deviantart.com/users/outgoing?https://t.umblr.com/redirect?z=https%3A%2F%2Ftwitter.com%2FSpaceX%2Fstatus%2F1798792222743122164");
// "https://twitter.com/SpaceX/status/1798792222743122164"

```

---

See tests for more examples.

- [TitleCleaner](https://github.com/AlttiRi/string-magic/tree/master/test/title-cleaner)
- [UrlCleaner](https://github.com/AlttiRi/string-magic/tree/master/test/url-cleaner)

---
