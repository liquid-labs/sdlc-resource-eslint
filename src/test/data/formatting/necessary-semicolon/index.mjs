f = () => [1]

let foo
;
([foo] = f())
console.log(foo)