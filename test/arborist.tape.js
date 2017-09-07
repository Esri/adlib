import test from 'tape';
import {arborist, getPropertyValue} from '../lib//optional-transform/arborist';

test('arborist::exists', (t) => {
  t.plan(1);
  t.ok(arborist);
});


test('getPropertyValue:: returns non-string value', (t) => {
  let data = 23;
  let result = getPropertyValue(data);
  t.plan(1);
  t.equal(result, data, 'should return non-string value');
});

test('getPropertyValue:: returns string value', (t) => {
  let data = 'red';
  let result = getPropertyValue(data);
  t.plan(1);
  t.equal(result, data, 'should return string value');
});

test('getPropertyValue:: returns decremented value', (t) => {
  let data = '{{delete:7}}';
  let result = getPropertyValue(data);
  t.plan(1);
  t.equal(result, '{{delete:6}}', 'should decrement delete level');
});

test('getPropertyValue:: returns null if level === 0', (t) => {
  let data = '{{delete:0}}';
  let result = getPropertyValue(data);
  t.plan(1);
  t.equal(result, undefined, 'val should be undefined');
});
//
//
// test('pruneArray::exists', (t) => {
//   t.plan(1);
//   t.ok(pruneArray);
// });
//
//
// test('pruneArray:: returns flat array', (t) => {
//   let data = [1,2,3];
//   let result = pruneArray(data);
//   t.plan(2);
//   t.ok(result.keep, 'keep should be true');
//   t.deepLooseEqual(result.val, data, 'should return data');
// });
//
// test('pruneArray:: returns object array', (t) => {
//   let data = [{type:'cat'}, {type:'dog'}];
//   let result = pruneArray(data);
//   t.plan(2);
//   t.ok(result.keep, 'keep should be true');
//   t.deepLooseEqual(result.val, data, 'should return data');
// });
//
// test('pruneArray:: removes entry object array', (t) => {
//   let data = [{type:'cat'}, {type:'{{delete:0}}'}];
//   let result = pruneArray(data);
//   t.plan(4);
//   t.ok(result.keep, 'keep should be true');
//   t.notDeepLooseEqual(result.val, [{type:'cat'}], 'should return data');
//   t.equal(result.val.length, 1, 'should have one entry');
//   t.equal(result.val[0].type, 'cat');
// });
//
// test('pruneArray:: removes prop on array obj if delete:0', (t) => {
//   let data = [{type:'cat', color:'gray'}, {type:'{{delete:0}}', color:'orange'}];
//   let result = pruneArray(data);
//   t.plan(3);
//   t.ok(result.keep, 'keep should be true');
//   t.equal(result.val.length, 2, 'should return 2 entries');
//   t.equal(result.val[1].color, 'orange', 'other props remain');
// });


test('arborist::should return a normal object', (t) => {
  let data = {
    foo: {
      bar: 23,
      baz: 'red'
    }
  };
  let result = arborist(data);
  t.plan(1);
  t.deepEqual(result, data, 'should return the object');
});

test('arborist::should return a normal object with array property', (t) => {
  let data = {
    foo: {
      bar: 23,
      baz: 'red'
    },
    arr: [
      {thing: 'one'}, {thing: 'two'}
    ]
  };
  let result = arborist(data);
  t.plan(1);
  t.deepEqual(result, data, 'should return the object');

});

test('arborist:: should drop prop with {{delete:0}} val', (t) => {
  let data = {
    foo: {
      bar: 23,
      baz: 'red'
    },
    blarg: '{{delete:0}}'
  };
  let result = arborist(data);
  t.plan(2);
  t.deepLooseEqual(result.foo, data.foo, 'should return .foo');
  t.equal(result.blarg, undefined, 'should not have .blarg');
});
//
test('arborist:: return undefined for object with {{delete:1}} property', (t) => {
  let data = {
    foo: {
      bar: 23,
      baz: 'red'
    },
    blarg: '{{delete:1}}'
  };
  let result = arborist(data);
  t.plan(1);
  t.equal(result, undefined, 'should return undefined');
});

test('arborist:: remove foo property', (t) => {
  let data = {
    foo: {
      bar: 23,
      baz: '{{delete:1}}'
    },
    blarg: 'this should remain'
  };
  let result = arborist(data);
  t.plan(2);
  t.equal(result.foo, undefined, 'foo should be undefined');
  t.equal(result.blarg, 'this should remain', 'blarg should remain');
});

test('arborist:: remove object 2 levels deep', (t) => {
  let data = {
    lvl1: {
      bar: 23,
      lvl2: {
        val: '{{delete:2}}'
      }
    },
    arr: [
      {thing: 'one'}, {thing: 'two'}
    ],
    blarg: 'this should remain'
  };
  let result = arborist(data);
  t.plan(2);
  t.equal(result.lvl1, undefined, 'lvl1 should be undefined');
  t.equal(result.blarg, 'this should remain', 'blarg should remain');

});


test('arborist:: remove array entry', (t) => {

  let data = {
    lvl1: {
      bar: 23,
      lvl2: {
        val: 'blue'
      }
    },
    arr: [
      {thing: 'one'}, {thing: '{{delete:0}}'}
    ],
    blarg: 'this should remain'
  };
  let result = arborist(data);
  t.plan(3);

  t.deepLooseEqual(result.lvl1, data.lvl1, 'lvl1 should be defined');
  t.equal(result.arr.length, 1, 'array should have one entry');
  t.equal(result.blarg, 'this should remain', 'blarg should remain');
});

test('arborist:: remove array entry property', (t) => {

  let data = {
    lvl1: {
      bar: 23,
      lvl2: {
        val: 'blue'
      }
    },
    arr: [
      {thing: 'one', color:'red'}, {thing: '{{delete:0}}', color:'orange'}
    ],
    blarg: 'this should remain'
  };
  let result = arborist(data);
  t.plan(4);

  t.deepLooseEqual(result.lvl1, data.lvl1, 'lvl1 should be defined');
  t.equal(result.arr.length, 2, 'array should have two entry');
  t.equal(result.arr[1].color, 'orange', 'array should have two entry');
  t.equal(result.blarg, 'this should remain', 'blarg should remain');
});

test('arborist:: returns deep arrays', (t) => {

  let data = {
    lvl1: {
      bar: 23,
      lvl2: {
        arr: [
          {
            props: [
              {nested: true, color: 'red'},
              {nested: false, color: 'orange'},
              {nested: false, color: 'magenta'}
            ]
          }
        ]
      }
    },
    arr: [
      {thing: 'one'}, {thing: 'two'}
    ],
    blarg: 'this should remain'
  };
  let result = arborist(data);
  t.plan(4);
  t.deepLooseEqual(result.lvl1, data.lvl1, 'lvl1 should be defined');
  t.equal(result.arr.length, 2, 'array should have 2 entry');
  t.equal(result.lvl1.lvl2.arr[0].props.length, 3, 'deep nested array should have 3 entry');
  t.equal(result.blarg, 'this should remain', 'blarg should remain');
});

test('arborist:: removed prop on deep arrays', (t) => {

  let data = {
    lvl1: {
      bar: 23,
      lvl2: {
        arr: [
          {
            props: [
              {nested: true, color: 'red'},
              {nested: false, color: 'orange'},
              {nested: false, color: '{{delete:0}}'}
            ]
          }
        ]
      }
    },
    arr: [
      {thing: 'one'}, {thing: 'two'}
    ],
    blarg: 'this should remain'
  };
  let result = arborist(data);
  t.plan(4);
  t.equal(result.arr.length, 2, 'array should have 2 entry');
  t.equal(result.lvl1.lvl2.arr[0].props.length, 3, 'deep nested array should have 3 entry');
  t.notOk(result.lvl1.lvl2.arr[0].props[2].color, 'color should not be defined');
  t.equal(result.blarg, 'this should remain', 'blarg should remain');
});

test('arborist:: remove entry from deep arrays', (t) => {

  let data = {
    lvl1: {
      bar: 23,
      lvl2: {
        arr: [
          {
            props: [
              {nested: true, color: 'red'},
              {nested: false, color: 'orange'},
              {nested: false, color: '{{delete:1}}'}
            ]
          }
        ]
      }
    },
    arr: [
      {thing: 'one'}, {thing: 'two'}
    ],
    blarg: 'this should remain'
  };
  let result = arborist(data);
  t.plan(4);
  t.notDeepLooseEqual(result.lvl1, data.lvl1, 'lvl1 should not be the same as data.lvl1');
  t.equal(result.arr.length, 2, 'array should have 2 entry');
  t.equal(result.lvl1.lvl2.arr[0].props.length, 2, 'deep nested array should have 2 entry');
  t.equal(result.blarg, 'this should remain', 'blarg should remain');
});

test('arborist:: remove grandparent from array entry', (t) => {

  let data = {
    lvl1: {
      bar: 23,
      lvl2: {
        arr: [
          {
            prop: [
              {nested: true, color: 'red'},
              {nested: false, color: 'orange'},
              {nested: false, color: '{{delete:3}}'},
            ]
          }
        ]
      }
    },
    arr: [
      {thing: 'one'}, {thing: 'two'}
    ],
    blarg: 'this should remain'
  };
  let result = arborist(data);
  t.plan(3);

  t.equal(result.arr.length, 2, 'array should have one entry');
  t.equal(result.lvl1.lvl2.arr.length, 0, 'deep nested array should have no entry');
  t.equal(result.blarg, 'this should remain', 'blarg should remain');
});
