{
let mod;
let t = import ('./testbed4.mjs');
t.then((f) => {
    setTimeout(() => {
        mod = f;
        console.log(mod.test);
        console.log(mod);
    }, 1000);
})
}
