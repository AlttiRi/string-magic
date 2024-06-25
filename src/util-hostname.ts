export function isPlainObjectEmpty(obj: object): boolean {
    for (const _prop in obj) {
        return false;
    }
    return true;
}

// Only for strings with hostname, not with an entire URL.
export function noWWW(hostname: string): string {
    return hostname.replace(/^www\./, "");
}

const hostnameRegEx = /^https?:\/\/(?<hostname>[^\/:]+)/;

// `userinfo` is not supported
export function getHostname(url: string): string {
    const matches = url.match(hostnameRegEx);
    return matches?.[1] || "";
}

export function getHostnameWithURL(url: string): string {
    return new URL(url).hostname;
}

/** Find dot positions in a string. */
export function findDots(str: string): number[] {
    const positions = [];
    for (let i = 0; i < str.length; i++) {
        if (str[i] === ".") {
            positions.push(i);
        }
    }
    return positions;
}

/**
 * @example
 * getParentSubHosts("localhost")    -> []
 * getParentSubHosts("example.com")  -> []
 * getParentSubHosts("qwerty.example.com")      -> [ "example.com" ]
 * getParentSubHosts("test.qwerty.example.com") -> [ "example.com", "qwerty.example.com" ]
 */
export function getParentSubHosts(hostname: string): string[] {
    const positions = findDots(hostname);
    const result = [];
    if (positions.length > 1) {
        for (let i = positions.length - 2; i >= 0; i--) {
            const position = positions[i];
            result.push(hostname.substring(position + 1));
        }
    }
    return result;
}

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
