import {ANSI_BLUE, t} from "../../tester";
import {getParentSubHosts} from "@/util-hostname";


console.log(ANSI_BLUE("--- getParentSubHosts ---"));

function tt(opt: {input: string, expect: string[]}) {
    t({
        result: JSON.stringify(getParentSubHosts(opt.input)),
        expect: JSON.stringify(opt.expect),
        stackDeep: 1,
    });
}

tt({
    input:  "localhost",
    expect: [],
});
tt({
    input:  "example.com",
    expect: [],
});
tt({
    input:  "www.example.com",
    expect: ["example.com"],
});
tt({
    input:  "qwerty.example.com",
    expect: ["example.com"],
});
tt({
    input:  "test.qwerty.example.com",
    expect: ["example.com", "qwerty.example.com"],
});
