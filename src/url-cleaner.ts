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
} | {
    command: UCDataCommandString
    data: string
};
export type UCRuleRecords = Record<string, Array<UCRule>>;
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

            const rule: UCRule | null = this.parseRuleString(rule_str);
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

    private getRules(url: string): UCRule[] | null {
        const hostname = getHostname(url);
        const siteRules: UCRule[] | undefined = this.ruleRecords[noWWW(hostname)];
        if (siteRules) {
            return siteRules;
        }
        if (this.ruleRecordsWC !== null) {
            const hosts = getParentSubHosts(hostname);
            for (const host of hosts) {
                const siteRules: UCRule[] | undefined = this.ruleRecordsWC[host];
                if (siteRules) {
                    return siteRules;
                }
            }
        }
        return null;
    }

    clean(url: string): string {
        const rules: UCRule[] | null = this.getRules(url);
        if (!rules) {
            return url;
        }
        return this.applyRules(url, rules);
    }

    private applyRules(url: string, rules: UCRule[]): string {
        let newUrl = url;
        for (const rule of rules) {
            if (rule.command === "trim-start") {
                if (newUrl.startsWith(rule.data)) {
                    newUrl = newUrl.replace(rule.data, "");
                    continue;
                }
                break;
            }
            if (rule.command === "filter-start") {
                if (newUrl.startsWith(rule.data)) {
                    continue;
                }
                break;
            }
            if (rule.command === "trim-regex") {
                const regex = new RegExp(rule.data);
                const match = regex.exec(newUrl);
                if (match?.groups) {
                    Object.entries(match.groups).forEach(([k, v]) => {
                        if (k.startsWith("trim")) {
                            newUrl = newUrl.replace(v, "");
                        }
                    });
                }
                continue;
            }
            if (rule.command === "decode-url") {
                newUrl = decodeURIComponent(newUrl)
                    .replaceAll(/\s+/g, "");
                continue;
            }
            if (rule.command === "trim-search-params") {
                const u = new URL(newUrl);
                u.searchParams.delete(rule.data);
                newUrl = u.toString();
                continue;
            }
            if (rule.command === "atob") {
                try {
                    newUrl = atob(newUrl);
                } catch (e) {
                    console.log(newUrl);
                    console.error(e);
                    return url;
                }
                continue;
            }
            if (rule.command === "search-param") {
                const u = new URL(newUrl);
                const spUrl = u.searchParams.get(rule.data);
                if (spUrl === null) {
                    return url;
                }
                newUrl = spUrl;
                continue;
            }
            if (rule.command === "https") {
                if (newUrl.startsWith("http://")) {
                    newUrl = newUrl.replace("http://", "https://");
                }
                continue;
            }
            if (rule.command === "prepend") {
                newUrl = rule.data + newUrl;
                continue;
            }

            if (rule.command === "recursive") {
                if (newUrl !== url) {
                    // return this.applyRules(newUrl, rules);
                    return this.clean(newUrl); // for a case when the url will have a new hostname
                }
            }
        }
        return newUrl;
    }

    private static parseRuleString(rule_str: string): UCRule | null {
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


