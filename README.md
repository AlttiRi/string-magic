# string-magic

~~ It's not a magic string, it's a string magic. ~~

Some util "StringRule"-driven functions do some string transformations.

---

There are two string cleaners — `TitleCleaner` and `UrlCleaner`.

The first one to clean sites' titles from a boilerplate text like `"on Twitter"`,
the second one to clean URLs (to remove search params and do some other things).

You describe rules as a string array, then apply them on the string is associated with some URL.

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

See tests for more examples.

- [TitleCleaner](https://github.com/AlttiRi/string-magic/tree/master/test/title-cleaner)
- [UrlCleaner](https://github.com/AlttiRi/string-magic/tree/master/test/url-cleaner)
