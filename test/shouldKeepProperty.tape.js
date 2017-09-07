import test from 'tape';
import shouldKeepProperty from '../lib//optional-transform/shouldKeepProperty';

test('shouldKeepProperty:: exists', (t) => {
  t.plan(1);
  t.ok(shouldKeepProperty);
  t.end();
});

test('shouldKeepProperty:: it should return false if {{delete:0}}', (t) => {
  t.plan(2);
  let result = shouldKeepProperty('{{delete:0}}', 'someKey');
  t.notOk(result.keep, 'keep should be false');
  t.equal(result.val, undefined, 'value should be undefined');
});


test('shouldKeepProperty:: it should return {{delete:0}} if {{delete:1}}', (t) => {
  t.plan(2);
  let result = shouldKeepProperty('{{delete:1}}', 'someKey');
  t.notOk(result.keep, 'keep should be false');
  t.equal(result.val, '{{delete:0}}', 'result should be {{delete:0}}');
});
