# string-magic

~~ It's not a magic string, it's a string magic. ~~

Some util "StringRule"-driven functions do some string transformations.

---

There are two string cleaners — `TitleCleaner` and `UrlCleaner`.

The first one to clean sites' titles from a boilerplait text like `"on Twitter"`,
the second one to clean URLs (to remove search params and do some other things).

You describe rules as a string array, then apply them on the string is accosiated with some URL.

---

See tests for more examples.

- [TitleCleaner](https://github.com/AlttiRi/string-magic/tree/master/test/title-cleaner)
- [UrlCleaner](https://github.com/AlttiRi/string-magic/tree/master/test/url-cleaner)
