import {ANSI_BLUE, t} from "../tester";
import {isTCRuleStringArray} from "@/title-cleaner";


console.log(ANSI_BLUE("--- TC `isTCRuleStringArray` ---"));

t({
    result: isTCRuleStringArray(["site:example.com", "trim-start:Example"]),
    expect: true,
});
t({
    result: isTCRuleStringArray(["site: example.com", "trim-start: Example"]),
    expect: true,
});
t({
    result: isTCRuleStringArray(["site :example.com", "trim-start:Example"]),
    expect: false,
});
t({
    result: isTCRuleStringArray(["site:example.com", "trim-start :Example"]),
    expect: false,
});
t({
    result: isTCRuleStringArray(["sites:example.com", "trim--start:Example"]),
    expect: false,
});

t({
    result: isTCRuleStringArray(["sites:example.com", "trim-start:"]),
    expect: true, // empty data // todo
});
t({
    result: isTCRuleStringArray(["sites:", "trim-start:"]),
    expect: true, // empty site / data // todo
});
