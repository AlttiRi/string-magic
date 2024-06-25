import {ANSI_BLUE, t} from "../../tester";
import {getHostname, getHostnameWithURL} from "@/util-hostname";


console.log(ANSI_BLUE("---getHostname / getHostnameWithURL ---"));

function tt(opt: {input: string, expect: string}) {
    t({
        name: "getHostname",
        result: getHostname(opt.input),
        expect: opt.expect,
        stackDeep: 1,
    });
    t({
        name: "getHostnameWithURL",
        result: getHostnameWithURL(opt.input),
        expect: opt.expect,
        stackDeep: 1,
    });
}

tt({
    input:  "https://example.com/",
    expect: "example.com",
});

tt({
    input: "https://example.com/",
    expect: "example.com",
});

tt({
    input: "https://example.com/qwerty",
    expect: "example.com",
});

tt({
    input: "https://example.com/qwerty?a=1&b=2#345",
    expect: "example.com",
});

tt({
    input: "https://www.example.com/",
    expect: "www.example.com",
});

tt({
    input: "https://a.b.example.com/",
    expect: "a.b.example.com",
});

tt({
    input: "https://example.com:443/",
    expect: "example.com",
});

tt({
    input: "http://www.example.com:80/",
    expect: "www.example.com",
});

tt({
    input: "http://localhost:8080/",
    expect: "localhost",
});

tt({
    input: "https://xn--4v8h.com/", // "https://🔥.com/"
    expect: "xn--4v8h.com",         // "🔥.com"
});


t({
    result: getHostname("https://🔥.com/"),
    expect: "🔥.com",
});
// t({
//     result: getHostnameWithURL("https://🔥.com/"),
//     expect: "🔥.com",  // "xn--4v8h.com"
// });

// t({
//     result: getHostname("http://admin@example.com/"),
//     expect: "example.com", // "admin@example.com "
// });
t({
    result: getHostnameWithURL("http://admin@example.com/"),
    expect: "example.com",
});

// t({
//     result: getHostname("http://admin:123@example.com/"),
//     expect: "example.com", // "admin"
// });
t({
    result: getHostnameWithURL("http://admin:123@example.com/"),
    expect: "example.com",
});
