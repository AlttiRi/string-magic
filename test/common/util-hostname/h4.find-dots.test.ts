import {ANSI_BLUE, t} from "../../tester";
import {findDots} from "@/util-hostname";


console.log(ANSI_BLUE("--- findDots ---"));

function tt(opt: {input: string, expect: number[]}) {
    t({
        result: JSON.stringify(findDots(opt.input)),
        expect: JSON.stringify(opt.expect),
        stackDeep: 1,
    });
}


tt({
    input: "",
    expect: [],
});
tt({
    input: ".",
    expect: [0],
});
tt({
    input: "q.q",
    expect: [1],
});
tt({
    input: "..",
    expect: [0, 1],
});
tt({
    input: "q.q.q",
    expect: [1, 3],
});
tt({
    input: "example.com",
    expect: [7],
});
tt({
    input: "www.example.com",
    expect: [3, 11],
});
tt({
    input: "*.example.com",
    expect: [1, 9],
});
