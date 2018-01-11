
import test from 'tape';
import deepMap from '../lib/deepMap';


test('deepMap:: returns object if passed object', (t)=>{
  let input = {
    foo: '{{val.bar}}'
  };
  t.plan(1);
  let cb = function(obj, path) {
    console.info(`obj: ${JSON.stringify(obj)} path: ${path}`);
  }
  let result = deepMap(input, cb);
  t.equal(result.foo, '{{val.bar}}' );
});

//
// test('deepMap:: returns empty object if passed empty object', (t)=>{
//   let input = {};
//   t.plan(1);
//   let fn = (v, k) {
//     return v;
//   }
//   let result = deepMap(input, fn);
//   t.equal(result, {} );
// });
