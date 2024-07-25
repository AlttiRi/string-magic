import {getHostname, getParentSubHosts, isPlainObjectEmpty, noWWW} from "./util-hostname.js";

const TypeArray_TCCommands = [
    "trim-start",     "trim-end",
    "trim-start-end",
] as const;
const TypeArray_TCCommands_SD = [ // SingleData
     "trim-regex",
] as const;
export type TCCommandString    = typeof TypeArray_TCCommands[number];
export type TCCommandString_SD = typeof TypeArray_TCCommands_SD[number];
export type TCRuleString = `${TCCommandString | TCCommandString_SD | "sites" | "site"}:${string}`;
export type TCRuleStrings = TCRuleString[];
export type TCRule = {
    command: TCCommandString
    data: string[]
} | {
    command: TCCommandString_SD
    data: string
};
export type TCRuleRecords = Record<string, Array<TCRule>>;
export type TCCompiledRules = {
    ruleRecords:   TCRuleRecords
    ruleRecordsWC: TCRuleRecords | null
};

const tcRuleStringPrefixes = ["site:", "sites:",
    ...TypeArray_TCCommands.map(   command => `${command}:`),
    ...TypeArray_TCCommands_SD.map(command => `${command}:`),
];
export function isTCRuleStringArray(array: string[]): array is TCRuleStrings {
    return array.every(str => tcRuleStringPrefixes.some(prefix => str.startsWith(prefix)));
}

export const knownCommands    = new Set<TCCommandString>(TypeArray_TCCommands)       as Set<string>;
export const knownCommands_SD = new Set<TCCommandString_SD>(TypeArray_TCCommands_SD) as Set<string>;
function isCommand(str: string): str is TCCommandString {
    return knownCommands.has(str);
}
function isSingleDataCommand(str: string): str is TCCommandString_SD {
    return knownCommands_SD.has(str);
}

export class TitleCleaner {
    private readonly ruleRecords:   TCRuleRecords;
    private readonly ruleRecordsWC: TCRuleRecords | null; // WildCard
    private constructor({ruleRecords, ruleRecordsWC}: TCCompiledRules) {
        this.ruleRecords   = ruleRecords;
        this.ruleRecordsWC = ruleRecordsWC;
    }

    static fromRuleStrings(rule_strings: TCRuleStrings): TitleCleaner {
        const rules = TitleCleaner.compileRuleStrings(rule_strings);
        return new TitleCleaner(rules);
    }

    static fromRuleRecords(rules: TCCompiledRules): TitleCleaner {
        return new TitleCleaner(rules);
    }

    static compileRuleStrings(rule_strings: TCRuleStrings): TCCompiledRules {
        const ruleRecords:   TCRuleRecords = {};
        const ruleRecordsWC: TCRuleRecords = {};
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

            const rule: TCRule | null = this.parseRuleString(rule_str);
            if (!rule) {
                // console.log(`[Wrong rule string] "${rule_str}"`); // For example, "trim-start: "
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

    private getRules(url: string): TCRule[] | null {
        const hostname = getHostname(url);
        const siteRules: TCRule[] | undefined = this.ruleRecords[noWWW(hostname)];
        if (siteRules) {
            return siteRules;
        }
        if (this.ruleRecordsWC !== null) {
            const hosts = getParentSubHosts(hostname);
            for (const host of hosts) {
                const siteRules: TCRule[] | undefined = this.ruleRecordsWC[host];
                if (siteRules) {
                    return siteRules;
                }
            }
        }
        return null;
    }

    clean(url: string, title: string): string {
        const rules = this.getRules(url);
        if (!rules) {
            return title;
        }
        let newTitle = title.trim();
        for (const rule of rules) {
            newTitle = this.applyRule(newTitle, rule);
        }
        return newTitle;
    }

    private applyRule(title: string, rule: TCRule): string {
        if (rule.command === "trim-start") {
            for (const prefix of rule.data) {
                if (title.startsWith(prefix)) {
                    const newTitle = title.replace(prefix, "").trimStart();
                    return this.applyRule(newTitle, rule);
                }
            }
        } else
        if (rule.command === "trim-end") {
            for (const postfix of rule.data) {
                if (title.endsWith(postfix)) {
                    const newTitle = title.slice(0, -postfix.length).trimEnd();
                    return this.applyRule(newTitle, rule);
                }
            }
        } else
        if (rule.command === "trim-start-end") {
            const [prefix, postfix] = rule.data;
            if (title.startsWith(prefix) && title.endsWith(postfix)) {
                const newTitle = title.slice(0, -postfix.length)
                    .replace(prefix, "")
                    .trim();
                return this.applyRule(newTitle, rule);
            }
        } else
        if (rule.command === "trim-regex") {
            const regex = new RegExp(rule.data);
            const newTitle = title.replace(regex, "").trim();
            if (newTitle !== title) {
                return this.applyRule(newTitle, rule);
            }
        }
        return title;
    }

    private static parseRuleString(rule_str: string): TCRule | null {
        const commandEnd = rule_str.indexOf(":");
        if (commandEnd === -1) {
            return null;
        }
        const command = rule_str.slice(0, commandEnd);
        if (isCommand(command)) {
            let data: string[];
            const rulePart2 = rule_str.slice(commandEnd + 1);
            if (rulePart2.charAt(0) === ":") {
                // one peace //
                data = [rulePart2.slice(1).trim()];
            } else if (rulePart2.charAt(1) === ":") {
                // has a sep char //
                const sep = rulePart2.charAt(0);
                data = rulePart2.slice(2).trim().split(new RegExp(`\\s*\\${sep}+\\s*`));
            } else {
                // just split by spaces //
                data = rulePart2.trim().split(/\s+/);
            }
            data = data.filter(d => d);
            if (!data.length) {
                return null;
            }
            return {
                command,
                data,
            };
        }
        if (isSingleDataCommand(command)) {
            const data = rule_str.slice(commandEnd + 1);
            return {
                command,
                data,
            };
        }
        return null;
    }
}
