import {getHostname, getParentSubHosts, isPlainObjectEmpty, noWWW} from "./util-hostname";

const TypeArray_UCRuleCommands = [
    "https",     "decode-url",
    "recursive", "atob",
] as const;
type  UCCommandString = typeof TypeArray_UCRuleCommands[number];

const TypeArray_UCRuleDataCommands = [
    "trim-start",         "trim-regex",
    "search-param",       "prepend",
    "trim-search-params", "filter-start",
    "trim-search-param",
] as const;
type  UCDataCommandString = typeof TypeArray_UCRuleDataCommands[number];

const commands     = new Set(TypeArray_UCRuleCommands)     as Set<string>;
const dataCommands = new Set(TypeArray_UCRuleDataCommands) as Set<string>;
function isCommand(str: string): str is UCCommandString {
    return commands.has(str);
}
function isDataCommand(str: string): str is UCDataCommandString {
    return dataCommands.has(str);
}

type UCRuleCommandString = UCCommandString;
type UCRuleDataCommandString = `site:${string}` | `sites:${string}` | `${UCDataCommandString}:${string}`;
export type UCRuleString = UCRuleCommandString | UCRuleDataCommandString;
export type UCRuleStrings = UCRuleString[];
type UCRule = {
    command: UCCommandString
};
type UCDataRule = {
    command: UCDataCommandString
    data: string
};
type UCAnyRule = UCRule | UCDataRule;
export type UCRuleRecords = Record<string, Array<UCAnyRule>>;
export type UCCompiledRules = {
    ruleRecords:   UCRuleRecords
    ruleRecordsWC: UCRuleRecords | null
};

const ucRuleStringPrefixes = new Set(TypeArray_UCRuleCommands.map(command => `${command}`));
const ucRuleDataStringPrefixes = [
    "site:", "sites:",
    ...TypeArray_UCRuleDataCommands.map(command => `${command}:`),
];
export function isUCRuleStringArray(array: string[]): array is UCRuleStrings {
    return array.every(str => ucRuleStringPrefixes.has(str)
        || ucRuleDataStringPrefixes.some(prefix => str.startsWith(prefix)));
}

export class UrlCleaner {
    private readonly ruleRecords:   UCRuleRecords;
    private readonly ruleRecordsWC: UCRuleRecords | null; // Wildcard
    private constructor({ruleRecords, ruleRecordsWC}: UCCompiledRules) {
        this.ruleRecords   = ruleRecords;
        this.ruleRecordsWC = ruleRecordsWC;
    }

    static fromRuleStrings(rule_strings: UCRuleStrings): UrlCleaner {
        const rules = UrlCleaner.compileRuleStrings(rule_strings);
        return new UrlCleaner(rules);
    }

    static fromRuleRecords(rules: UCCompiledRules): UrlCleaner {
        return new UrlCleaner(rules);
    }

    static compileRuleStrings(rule_strings: UCRuleStrings): UCCompiledRules {
        const ruleRecords:   UCRuleRecords = {};
        const ruleRecordsWC: UCRuleRecords = {};
        let lastSites: string[] = [];

        for (const rule_str of rule_strings) {
            if (rule_str.startsWith("site:")) {
                lastSites = [noWWW(rule_str.slice("site:".length).trim())];
                continue;
            } else if (rule_str.startsWith("sites:")) {
                lastSites = rule_str.slice("sites:".length).trim().split(/\s+/);
                lastSites = [...new Set(lastSites.map(noWWW))];
                continue;
            }

            const rule: UCAnyRule | null = this.parseRuleString(rule_str);
            if (!rule) {
                console.log(`[Wrong rule string] "${rule_str}"`); // todo
                continue;
            }

            for (let lastSite of lastSites) {
                let ruleStore = ruleRecords;
                if (lastSite.startsWith("*.")) {
                    ruleStore = ruleRecordsWC;
                    lastSite = lastSite.slice(2);
                }
                let siteRules = ruleStore[lastSite];
                if (!siteRules) {
                    siteRules = [];
                    ruleStore[lastSite] = siteRules;
                }
                siteRules.push(rule);
            }
        }

        if (isPlainObjectEmpty(ruleRecordsWC)) {
            return {ruleRecords, ruleRecordsWC: null};
        }
        return {ruleRecords, ruleRecordsWC};
    }

    private getRules(url: string): UCAnyRule[] | null {
        const hostname = getHostname(url);
        const siteRules: UCAnyRule[] | undefined = this.ruleRecords[noWWW(hostname)];
        if (siteRules) {
            return siteRules;
        }
        if (this.ruleRecordsWC !== null) {
            const hosts = getParentSubHosts(hostname);
            for (const host of hosts) {
                const siteRules: UCAnyRule[] | undefined = this.ruleRecordsWC[host];
                if (siteRules) {
                    return siteRules;
                }
            }
        }
        return null;
    }

    clean(url: string): string {
        const rules: UCAnyRule[] | null = this.getRules(url);
        if (!rules) {
            return url;
        }
        return new RuleApplier(this, url, rules).applyRules();
    }

    private static parseRuleString(rule_str: string): UCAnyRule | null {
        if (isCommand(rule_str)) {
            return {
                command: rule_str,
            };
        } else {
            const i = rule_str.indexOf(":");
            if (i !== -1) {
                const [command, data] = [rule_str.slice(0, i), rule_str.slice(i + 1)];
                if (isDataCommand(command)) {
                    return ({
                        command,
                        data,
                    });
                }
            }
        }
        return null;
    }
}

type IRuleApplier =
      Record<UCDataCommandString, (rule: UCDataRule) => void>
    & Record<    UCCommandString, (rule: UCRule)     => void>
    & {
        nextRule:   () => void
        applyRules: (cleaner: UrlCleaner, url: string, rules: UCAnyRule[]) => string
    };

class RuleApplier implements IRuleApplier {
    private readonly cleaner: UrlCleaner;
    private readonly rules:   UCAnyRule[];
    private readonly initUrl: string;
    private url:     string;
    private index:   number = -1;
    constructor(cleaner: UrlCleaner, url: string, rules: UCAnyRule[]) {
        this.cleaner = cleaner;
        this.initUrl = url;
        this.url     = url;
        this.rules   = rules;
    }
    applyRules(): string {
        this.nextRule();
        return this.url;
    }
    nextRule() {
        this.index++;
        const next = this.rules[this.index];
        if (next) {
            // @ts-ignore
            // TS2345: Argument of type UCAnyRule is not assignable to parameter of type never
            // The intersection UCDataRule & UCRule was reduced to never because property command has conflicting types in some constituents.
            // Type UCDataRule is not assignable to type never
            this[next.command](next);
        }
    }

    // --- Filters --- //
    ["filter-start"](rule: UCDataRule) {
        if (this.url.startsWith(rule.data)) {
            this.nextRule();
        }
    }
    ["trim-start"](rule: UCDataRule) {
        if (this.url.startsWith(rule.data)) {
            this.url = this.url.replace(rule.data, "");
            this.nextRule();
        }
    }

    ["trim-regex"](rule: UCDataRule) {
        const regex = new RegExp(rule.data);
        const match = regex.exec(this.url);
        if (match?.groups) {
            Object.entries(match.groups).forEach(([k, v]) => {
                if (k.startsWith("trim")) {
                    this.url = this.url.replace(v, "");
                }
            });
        }
        this.nextRule();
    }
    ["trim-search-params"](rule: UCDataRule) {
        const u = new URL(this.url);
        const params = rule.data.split(/\s+/);
        for (const param of params) {
            u.searchParams.delete(param);
        }
        this.url = u.toString();
        this.nextRule();
    }
    ["trim-search-param"](rule: UCDataRule) {
        const u = new URL(this.url);
        u.searchParams.delete(rule.data);
        this.url = u.toString();
        this.nextRule();
    }
    ["search-param"](rule: UCDataRule) {
        const u = new URL(this.url);
        const spUrl = u.searchParams.get(rule.data);
        if (spUrl !== null) {
            this.url = spUrl;
            this.nextRule();
        }
    }
    ["prepend"](rule: UCDataRule) {
        this.url = rule.data + this.url;
        this.nextRule();
    }

    ["https"]() {
        if (this.url.startsWith("http://")) {
            this.url = this.url.replace("http://", "https://");
        }
        this.nextRule();
    }
    ["decode-url"]() {
        this.url = decodeURIComponent(this.url)
            .replaceAll(/\s+/g, "");
        this.nextRule();
    }
    ["atob"]() {
        try {
            this.url = atob(this.url);
            this.nextRule();
        } catch (e) {
            console.log(this.url);
            console.error(e);
        }
    }
    ["recursive"]() {
        if (this.url !== this.initUrl) {
            this.url = this.cleaner.clean(this.url); // for a case when the url will have a new hostname
        }
    }
}
