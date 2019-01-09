
import test from 'tape';
import { getWithDefault } from '../lib/getWithDefault';

test('getWithDefault:: returns value', (t)=>{
  var users = {
    'fred':    { 'user': 'fred',    'age': 40 },
    'pebbles': { 'user': 'pebbles', 'age': 1 }
  };
  t.plan(1);

  let result = getWithDefault(users, 'fred.age');
  t.equal(result, 40 );
});


test('getWithDefault:: returns undefined', (t)=>{
  var users = {
    'fred':    { 'user': 'fred',    'age': 40 },
    'pebbles': { 'user': 'pebbles', 'age': 1 }
  };
  t.plan(1);

  let result = getWithDefault(users, 'blarg.age');
  t.equal(result, undefined );
});

test('getWithDefault:: returns deep value', (t)=>{
  var users = {
    'fred':    { 'user': 'fred',    'age': 40 , address: { street: {name: 'pine'}}},
    'pebbles': { 'user': 'pebbles', 'age': 1 }
  };
  t.plan(1);

  let result = getWithDefault(users, 'fred.address.street.name');
  t.equal(result, 'pine' );
});
