let mod;
let t = import ('./testbed4.mjs');
t.then((f) => {
    mod = f;
    mod.setTest('val1');
    mod.obj.b = 'there';
})
