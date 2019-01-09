
import test from 'tape';
import { mapValues } from '../lib/mapValues';

test('mapValues:: returns object if passed object', (t)=>{
  var users = {
    'fred':    { 'user': 'fred',    'age': 40 },
    'pebbles': { 'user': 'pebbles', 'age': 1 }
  };
  t.plan(2);
  let cb = function(value, key, obj) {
    return value.age;
  }
  let result = mapValues(users, cb);
  t.equal(result.fred, 40 );
  t.equal(result.pebbles, 1 );
});

//
test('mapValues:: returns empty object if passed empty object', (t)=>{
  let input = {};
  t.plan(2);
  let cb = function(value, key, obj) {
    return value.age;
  }
  let result = mapValues(input, cb);
  t.equal(typeof result, 'object');
  t.ok(result);
});
