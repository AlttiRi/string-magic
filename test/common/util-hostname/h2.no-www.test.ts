import {ANSI_BLUE, t} from "../../tester";
import {noWWW} from "@/util-hostname";


console.log(ANSI_BLUE("---noWWW ---"));

t({
    result: noWWW("www.example.com"),
    expect: "example.com",
});
t({
    result: noWWW("example.com"),
    expect: "example.com",
});
t({
    result: noWWW("www.a.example.com"),
    expect: "a.example.com",
});
t({
    result: noWWW("a.www.example.com"),
    expect: "a.www.example.com",
});
t({
    result: noWWW("https://www.example.com/"),
    expect: "https://www.example.com/",
});
t({
    result: noWWW("https://a.www.example.com/"),
    expect: "https://a.www.example.com/",
});
