
import test from 'tape';
import adlib from '../lib/adlib';



test('Admib::Objects:: should preserve empty objects', (t) => {
  t.plan(4);
  let template = {
    value: '{{s.obj}}',
    emptyObj: {}
  };
  let settings = {
    s: {
      obj: {
        val: 'red'
      }
    }
  };
  let result = adlib(template, settings);
  t.ok(result.value.val, 'val should be defined');
  t.equal(result.value.val, 'red');
  t.equal(typeof result.emptyObj,'object');
  t.ok(result.emptyObj);
  t.end();
})

test('Admib::Objects:: should preserve nulls', (t) => {
  t.plan(3);
  let template = {
    value: '{{s.obj}}',
    nullThing: null
  };
  let settings = {
    s: {
      obj: {
        val: 'red'
      }
    }
  };
  let result = adlib(template, settings);
  t.ok(result.value.val);
  t.equal(result.value.val, 'red');
  t.equal(result.nullThing, null);
  t.end();
})

test('Admib::Objects:: should replace a token with an object', (t) => {
  t.plan(2);
  let template = {
    value: '{{s.obj}}'
  };
  let settings = {
    s: {
      obj: {
        val: 'red'
      }
    }
  };
  let result = adlib(template, settings);
  t.ok(result.value.val);
  t.equal(result.value.val, 'red');
  t.end();
})
test('Admib::Objects:: should replace a deep token with an deep object', (t) => {
  t.plan(2);
  let template = {
    value: '{{s.l1.l2.obj}}'
  };
  let settings = {
    s: {
      l1: {
        l2: {
          obj: {
            val: 'red'
          }
        }
      }
    }
  };
  let result = adlib(template, settings);
  t.ok(result.value.val);
  t.equal(result.value.val, 'red');
})
