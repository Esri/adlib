/**
 * Array related adlib tests
 */

import test from 'tape';
import adlib from '../lib/adlib';

test('Adlib::Arrays:: should replace tokens within an array with strings', (t) => {
  t.plan(3);
  let template = {
    values: ['{{s.animal}}', 'fuzzy','{{s.color}}']
  };
  let settings = {
    s: {
      animal: 'bear',
      color: 'brown'
    }
  };
  let result = adlib(template, settings);
  t.ok(result.values);
  t.equal(result.values[0], 'bear');
  t.equal(result.values[2], 'brown');
})

test('Adlib::Arrays:: should replace tokens within an array with objects', (t) => {
  t.plan(1);
  let template = {
    values: ['{{s.animal}}']
  };
  let settings = {
    s: {
      animal: {
        type: 'bear'
      },
      color: 'brown'
    }
  };
  let result = adlib(template, settings);
  t.ok(result.values[0].type, 'bear');
  t.end();
});

test('Adlib::Arrays:: should replace tokens with an array', (t) => {
  t.plan(3);
  let template = {
    values:'{{s.animals}}'
  };
  let settings = {
    s: {
      animals: [
        'bear', 'panda'
      ]
    }
  };
  let result = adlib(template, settings);
  t.ok(result.values, 'values should be defined');
  t.ok(Array.isArray(result.values), 'values should be an array');
  t.equal(result.values[1], 'panda');
  t.end();
});
test('Adlib::Arrays:: should replace tokens with an array and run transforms', (t) => {
  t.plan(3);
  let template = {
    values:'{{s.animals:upcaseArr}}'
  };
  let settings = {
    s: {
      animals: [
        'bear', 'panda'
      ]
    }
  };
  let transforms = {
    upcaseArr (key, val, settings) {
      return val.map((v) =>{
        return v.toUpperCase();
      })
    }
  }
  let result = adlib(template, settings, transforms);
  t.ok(result.values, 'values should be defined');
  t.ok(Array.isArray(result.values));
  t.equal(result.values[1], 'PANDA');
  t.end();
});
test('Adlib::Arrays:: should run passed in transforms', (t) => {
  t.plan(2);
  let template = {
    value:'{{s.animal.type:upcase}}'
  };
  let settings = {
    s: {
      animal: {
        type: 'bear'
      },
      color: 'brown'
    }
  };
  let transforms = {
    upcase (key, val, settings) {
      return val.toUpperCase() + settings.s.color;
    }
  };
  let result = adlib(template, settings, transforms);
  t.ok(result.value);
  t.equal(result.value, 'BEARbrown');
  t.end();
});

test('Adlib::Arrays:: should run transform even if value is undefined', (t) => {
  t.plan(2);
  let template = {
    value:'{{s.animal.type:upcase}}'
  };
  let settings = {
    s: {
      color: 'brown'
    }
  };
  let transforms = {
    upcase (key, val, settings) {
      return key.toUpperCase();
    }
  };
  let result = adlib(template, settings, transforms);
  t.ok(result.value);
  t.equal(result.value, 'S.ANIMAL.TYPE');
  t.end();
});

test('Adlib::Arrays:: transform has access to settings hash', (t) => {
  t.plan(2);
  let template = {
    value:'{{s.animal.type:upcase}}'
  };
  let settings = {
    s: {
      color: 'brown'
    }
  };
  let transforms = {
    upcase (key, val, settings) {
      return `${key.toUpperCase()} is ${settings.s.color}`;
    }
  };
  let result = adlib(template, settings, transforms);
  t.ok(result.value);
  t.equal(result.value, 'S.ANIMAL.TYPE is brown');
  t.end();
});
