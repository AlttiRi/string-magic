import {ANSI_BLUE, t} from "../tester";
import {isUCRuleStringArray} from "@/url-cleaner";


console.log(ANSI_BLUE("--- TC `isUCRuleStringArray` ---"));

t({
    result: isUCRuleStringArray(["site:example.com", "trim-start:Example"]),
    expect: true,
});
t({
    result: isUCRuleStringArray(["site: example.com", "trim-start: Example"]),
    expect: true,
});
t({
    result: isUCRuleStringArray(["site :example.com", "trim-start:Example"]),
    expect: false,
});
t({
    result: isUCRuleStringArray(["site:example.com", "trim-start :Example"]),
    expect: false,
});
t({
    result: isUCRuleStringArray(["sites:example.com", "trim--start:Example"]),
    expect: false,
});

t({
    result: isUCRuleStringArray(["site:example.com", "atob"]),
    expect: true,
});
t({
    result: isUCRuleStringArray(["site:example.com", "atob:"]),
    expect: false,
});

t({
    result: isUCRuleStringArray(["sites:example.com", "trim-start:"]),
    expect: true, // empty data // todo
});
t({
    result: isUCRuleStringArray(["sites:", "trim-start:"]),
    expect: true, // empty site / data // todo
});