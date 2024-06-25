import {ANSI_BLUE, t} from "../../tester";
import {isPlainObjectEmpty} from "@/util-hostname";


console.log(ANSI_BLUE("---isPlainObjectEmpty ---"));

t({
    result: isPlainObjectEmpty({}),
    expect: true,
});
t({
    result: isPlainObjectEmpty({a: 1}),
    expect: false,
});
t({
    result: isPlainObjectEmpty({a: undefined}),
    expect: false,
});
t({
    result: isPlainObjectEmpty({a: {b: ""}}),
    expect: false,
});
