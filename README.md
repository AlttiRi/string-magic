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

## *.d.ts

```ts
declare const TypeArray_TCCommands: readonly ["trim-start", "trim-end", "trim-start-end"];
declare const TypeArray_TCCommands_SD: readonly ["trim-regex"];
export type TCCommandString = typeof TypeArray_TCCommands[number];
export type TCCommandString_SD = typeof TypeArray_TCCommands_SD[number];
export type TCRuleString = `${TCCommandString | TCCommandString_SD | "sites" | "site"}:${string}`;
export type TCRuleStrings = TCRuleString[];
export type TCRule = {
    command: TCCommandString;
    data: string[];
} | {
    command: TCCommandString_SD;
    data: string;
};
export type TCRuleRecords = Record<string, Array<TCRule>>;
export type TCCompiledRules = {
    ruleRecords: TCRuleRecords;
    ruleRecordsWC: TCRuleRecords | null;
};
export declare function isTCRuleStringArray(array: string[]): array is TCRuleStrings;
export declare const knownCommands: Set<string>;
export declare const knownCommands_SD: Set<string>;
export declare class TitleCleaner {
    private readonly ruleRecords;
    private readonly ruleRecordsWC;
    private constructor();
    static fromRuleStrings(rule_strings: TCRuleStrings): TitleCleaner;
    static fromRuleRecords(rules: TCCompiledRules): TitleCleaner;
    static compileRuleStrings(rule_strings: TCRuleStrings): TCCompiledRules;
    private getRules;
    clean(url: string, title: string): string;
    private applyRule;
    private static parseRuleString;
}

declare const TypeArray_UCRuleCommands: readonly ["https", "decode-url", "recursive", "atob"];
type UCCommandString = typeof TypeArray_UCRuleCommands[number];
declare const TypeArray_UCRuleDataCommands: readonly ["filter-start", "trim-start", "prepend", "trim-regex", "trim-search-param", "search-param"];
type UCDataCommandString = typeof TypeArray_UCRuleDataCommands[number];
declare const TypeArray_UCRuleMDataCommands: readonly ["trim-search-params"];
type UCMDataCommandString = typeof TypeArray_UCRuleMDataCommands[number];
type UCAnyDataCommandString = UCDataCommandString | UCMDataCommandString;
type UCRuleCommandString = UCCommandString;
type UCRuleDataCommandString = `site:${string}` | `sites:${string}` | `${UCAnyDataCommandString}:${string}`;
export type UCRuleString = UCRuleCommandString | UCRuleDataCommandString;
export type UCRuleStrings = UCRuleString[];
type UCRule = {
    command: UCCommandString;
};
type UCDataRule = {
    command: UCDataCommandString;
    data: string;
};
type UCMDataRule = {
    command: UCMDataCommandString;
    data: string | string[];
};
type UCAnyDataRule = UCDataRule | UCMDataRule;
type UCAnyRule = UCRule | UCAnyDataRule;
export type UCRuleRecords = Record<string, Array<UCAnyRule>>;
export type UCCompiledRules = {
    ruleRecords: UCRuleRecords;
    ruleRecordsWC: UCRuleRecords | null;
};
export declare function isUCRuleStringArray(array: string[]): array is UCRuleStrings;
export declare class UrlCleaner {
    private readonly ruleRecords;
    private readonly ruleRecordsWC;
    private constructor();
    static fromRuleStrings(rule_strings: UCRuleStrings): UrlCleaner;
    static fromRuleRecords(rules: UCCompiledRules): UrlCleaner;
    static compileRuleStrings(rule_strings: UCRuleStrings): UCCompiledRules;
    private getRules;
    clean(url: string): string;
    private static parseRuleString;
}

export declare function isPlainObjectEmpty(obj: object): boolean;
export declare function noWWW(hostname: string): string;
export declare function getHostname(url: string): string;
export declare function getHostnameWithURL(url: string): string;
/** Find dot positions in a string. */
export declare function findDots(str: string): number[];
/**
 * @example
 * getParentSubHosts("localhost")    -> []
 * getParentSubHosts("example.com")  -> []
 * getParentSubHosts("qwerty.example.com")      -> [ "example.com" ]
 * getParentSubHosts("test.qwerty.example.com") -> [ "example.com", "qwerty.example.com" ]
 */
export declare function getParentSubHosts(hostname: string): string[];
/**
 * # Hostname rule matching
 *
 * Simple and performance oriented implementation with simplified WildCards support.
 * Only one (the first) hostname match's rules are applied.
 *
 * - "example.com"
 *  1. look for "example.com" rules, if none then do nothing (since, there are only 2 hostname parts).
 *
 *  - "www.example.com"
 *  1. look for "example.com" rules, if none then
 *  2. look for "*.example.com" rules.
 *
 *  - "qwerty.example.com"
 *  1. look for "qwerty.example.com", if none then
 *  2. look for "*.example.com".
 *
 *  - "more.qwerty.example.com"
 *  1. look for "more.qwerty.example.com", if none then
 *  2. look for "*.example.com", if none then
 *  3. look for "*.qwerty.example.com".
 */
```
