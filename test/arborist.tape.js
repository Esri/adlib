import test from 'tape';
import {arborist, getPropertyValue, pruneArray, pruneObject} from '../lib//optional-transform/arborist';

test('arborist::exists', (t) => {
  t.plan(1);
  t.ok(arborist);
});


test('getPropertyValue:: returns numeric value', (t) => {
  let result = getPropertyValue(23);
  t.plan(1);
  t.equal(result, 23, 'should return numeric value');
});

test('getPropertyValue:: returns 0 value', (t) => {
  let result = getPropertyValue(0);
  t.plan(1);
  t.equal(result, 0, 'should return 0 value');
});

test('getPropertyValue:: returns bool value', (t) => {
  let result = getPropertyValue(true);
  t.plan(1);
  t.equal(result, true, 'should return bool value');
});

test('getPropertyValue:: returns string value', (t) => {
  let data = 'red';
  let result = getPropertyValue(data);
  t.plan(1);
  t.equal(result, data, 'should return string value');
});

test('getPropertyValue:: returns same delete value', (t) => {
  let data = '{{delete:7}}';
  let result = getPropertyValue(data);
  t.plan(1);
  t.equal(result, '{{delete:7}}', 'should not modify delete level');
});

test('getPropertyValue:: returns undefined if level === 0', (t) => {
  let data = '{{delete:0}}';
  let result = getPropertyValue(data);
  t.plan(1);
  t.equal(result, undefined, 'val should be undefined');
});

test('pruneArray::exists', (t) => {
  t.plan(1);
  t.ok(pruneArray);
});

test('pruneArray:: returns array of numbers', (t) => {
  let data = [1,2,3];
  let result = pruneArray(data);
  t.plan(1);
  t.equal(result, data);
});

test('pruneArray:: returns array of numbers with falsey values', (t) => {
  let data = [255,0,303,0, false, true];
  let result = pruneArray(data);
  t.plan(1);
  t.equal(result, data);
});

test('pruneArray:: returns array of objects', (t) => {
  let data = [
    {nested: true, color: 'red'},
    {nested: false, color: 'orange'},
    {nested: false, color: 'brown'}
  ];
  let result = pruneArray(data);
  t.plan(1);
  t.equal(result, data);
});

test('pruneArray:: returns array of objects', (t) => {
  let data = [
    {nested: true, color: 'red'},
    {nested: false, color: 'orange'},
    {nested: false, color: 'brown'}
  ];
  let result = pruneArray(data);
  t.plan(1);
  t.equal(result, data);
});

test('pruneArray:: returns [] if delete:0', (t) => {
  let data = [
    {nested: true, color: 'red'},
    {nested: false, color: 'orange'},
    '{{delete:0}}'
  ];
  let result = pruneArray(data);
  t.plan(1);
  t.looseEqual(result, [], 'should return an empty array');
});

test('pruneArray:: returns {{delete:0}} if delete:1', (t) => {
  let data = [
    {nested: true, color: 'red'},
    {nested: false, color: 'orange'},
    '{{delete:1}}'
  ];
  let result = pruneArray(data);
  t.plan(1);
  t.equal(result, '{{delete:0}}', 'should return an delete:0');
});

test('pruneArray:: returns {{delete:7}} if delete:8', (t) => {
  let data = [
    {nested: true, color: 'red'},
    {nested: false, color: 'orange'},
    '{{delete:8}}'
  ];
  let result = pruneArray(data);
  t.plan(1);
  t.equal(result, '{{delete:7}}', 'should return an delete:7');
})

test('pruneObject::exists', (t) => {
  t.plan(1);
  t.ok(pruneObject);
});

test('pruneObject:: returns object if no {{delete:NNN}} props', (t) => {
  let data =  {
    nested: true,
    color: 'red',
    nested: {
      object: {
        is: {
          cool: true
        }
      }
    },
    arr: [1,2,3,0,1]
  };
  let result = pruneObject(data);
  t.plan(1);
  t.deepLooseEqual(result, data, 'should return the object');
});

test('pruneObject:: returns object w/o prop with {{delete:0}}', (t) => {
  let data =  {
    nested: true,
    color: 'red',
    nuker: '{{delete:0}}',
    arr: [1,2,3,0,1]
  };
  let result = pruneObject(data);
  t.plan(4);
  t.equal(result.nested, data.nested);
  t.equal(result.nuker, undefined, 'nuker prop should be removed');
  t.equal(result.color, data.color);
  t.deepLooseEqual(result.arr, data.arr);
});

test('pruneObject:: returns undefined when prop with {{delete:1}}', (t) => {
  let data =  {
    nested: true,
    color: 'red',
    nuker: '{{delete:1}}',
    arr: [1,2,3,0,1]
  };
  let result = pruneObject(data);
  t.plan(1);
  t.equal(result, undefined, 'should return undefined');
});

test('pruneObject:: returns {{delete:7}} w/o prop with {{delete:8}}', (t) => {
  let data =  {
    nested: true,
    color: 'red',
    nuker: '{{delete:8}}',
    arr: [1,2,3,0,1]
  };
  let result = pruneObject(data);
  t.plan(1);
  t.equal(result, '{{delete:7}}', 'should return delete:7');
});

test('pruneObject:: returns maximum deletion level', (t) => {
  let data =  {
    nested: true,
    color: '{{delete:5}}',
    nuker: '{{delete:8}}',
    arr: [1,2,3,0,1]
  };
  let result = pruneObject(data);
  t.plan(1);
  t.equal(result, '{{delete:7}}', 'should return delete:7');
});

test('arborist::should return a normal object', (t) => {
  let data = {
    foo: {
      bar: 23,
      baz: 'red',
      isFalse: false
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
      baz: 'red',
      isFalse: false
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
      baz: 'red',
      isFalse: false
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
      baz: 'red',
      isFalse: false
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
      baz: '{{delete:1}}',
      isFalse: false
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
      {thing: 'one'}, {thing: '{{delete:1}}'}
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
              {nested: false, color: '{{delete:2}}'}
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
  t.equal(result.lvl1.lvl2.arr[0].props, undefined, 'arr[0] should not have a props property');
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
