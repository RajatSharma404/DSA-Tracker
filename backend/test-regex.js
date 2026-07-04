const raw = "LEETCODE_SESSION=test12345678901234567890; another=abc;";
const from = raw.match(/(?:^|[;\\s])LEETCODE_SESSION=([^;\\s]+)/i)?.[1];
const from2 = raw.match(/(?:^|[;\s])LEETCODE_SESSION=([^;\s]+)/i)?.[1];
console.log("from:", from);
console.log("from2:", from2);
