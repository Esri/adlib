
import test from 'tape';
import adlib from '../lib/adlib';

test('AdLib:: Throws if optional transform passed in', (t)=>{
  let template = {
    foo: 'bar',
    baz: ['one', 'two']
  };
  let transforms = {
    optional: function (k,v,s, p) {
      return v;
    }
  }
  t.plan(1);
  t.throws(() => adlib(template, {}, transforms));
});

test('AdLib:: Does not throws if transform passed in', (t)=>{
  let template = {
    foo: 'bar',
    baz: ['one', 'two']
  };
  let transforms = {
    someOther: function (k,v,s, p) {
      return v;
    }
  }
  t.plan(1);
  t.doesNotThrow(() => adlib(template, {}, transforms));
});

test('Adlib::Strings:: should return a deep copy of the template', (t) => {
  let template = {
    foo: 'bar',
    baz: ['one', 'two']
  };
  let result = adlib(template, {});
  t.notEqual(template, result, 'result should not deeply equal the template');
  // ensure that changing the result DOES NOT change the template
  result.check = 'wat';
  t.notOk(template.check, 'should be undefined');
  t.equal(result.foo, 'bar');
  t.equal(result.foo, template.foo);
  t.end();
});

test('Adlib::Strings:: should replace a simple path with a string', (t) => {
  t.plan(1);
  let template = {
    value: '{{thing.value}}'
  };
  let settings = {
    thing: {
      value: 'red'
    }
  };
  let result = adlib(template, settings);

  t.equal(result.value, 'red');
  t.end();
})

test('Adlib::Strings:: should replace a path within a larger string', (t) => {
  t.plan(1);
  let template = {
    value: 'The value is {{thing.value}}'
  };
  let settings = {
    thing: {
      value: 'red'
    }
  };
  let result = adlib(template, settings);

  t.equal(result.value, 'The value is red');
  t.end();
})


test('Adlib::Strings:: should replace multiple instances within a larger string', (t) => {
  t.plan(1);
  let template = {
    value: 'The value is {{thing.value}} and {{thing.value}}'
  };
  let settings = {
    thing: {
      value: 'red'
    }
  };
  let result = adlib(template, settings);

  t.equal(result.value, 'The value is red and red');
  t.end();
})

test('Adlib::Strings:: should leave undefined instances within a larger string', (t) => {
  t.plan(1);
  let template = {
    value: 'The value is {{thing.novalue}} and {{thing.value}}'
  };
  let settings = {
    thing: {
      value: 'red'
    }
  };
  let result = adlib(template, settings);

  t.equal(result.value, 'The value is {{thing.novalue}} and red');
  t.end();
})

test('Adlib::Strings:: should leave undefined instances within a url string', (t) => {
  t.plan(1);
  let template = {
    value: '{{organization.portalBaseUrl}}/apps/SummaryViewer/index.html?appid={{collisionViewer.item.id}}'
  };
  let settings = {
    organization: {
      portalBaseUrl: 'http://foo.com'
    },
    collisionViewer: {
      item: {
        notId: '3ef'
      }
    }
  };
  let result = adlib(template, settings);

  t.equal(result.value, 'http://foo.com/apps/SummaryViewer/index.html?appid={{collisionViewer.item.id}}');
  t.end();
});


test('Adlib::Strings:: should replace multiple values in a string', (t) => {
  t.plan(1);
  let template = {
    value: 'The {{thing.animal}} was {{thing.color}} but still a {{thing.animal}}'
  };
  let settings = {
    thing: {
      color: 'red',
      animal: 'fox'
    }
  };
  let result = adlib(template, settings);

  t.equal(result.value, 'The fox was red but still a fox');
  t.end();
})

test('Adlib::Strings:: should flow missing things through', (t) => {
  t.plan(2);
  let template = {
    value: '{{thing.value}}',
    v2: '{{not.present}}'
  };
  let settings = {
    thing: {
      value: 'red'
    }
  };
  let result = adlib(template, settings);

  t.equal(result.value, 'red');
  t.equal(result.v2, template.v2);
  t.end();
})

test('Adlib::Strings:: should work with deep graphs', (t) => {
  t.plan(1);
  let template = {
    l1: {
      l2: {
        l3: {
          v: '{{s.l1.l2.val}}'
        }
      }
    }
  };
  let settings = {
    s: {
      l1: {
        l2: {
          val: 'green'
        }
      }
    }
  };
  let result = adlib(template, settings);
  t.equal(result.l1.l2.l3.v, 'green');
  t.end();
});



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
});


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

test('Adlib::Arrays:: should not remove falsy values', (t) => {

  let template = {
    values: ['{{s.animal}}', 'fuzzy','{{s.color}}'],
    color: [255,0,0,230]
  };
  let settings = {
    s: {
      animal: 'bear',
      color: 'brown'
    }
  };
  let result = adlib(template, settings);
  t.plan(5);
  t.ok(result.values);
  t.ok(result.color);
  console.info(JSON.stringify(result));
  t.equal(result.values[0], 'bear');
  t.equal(result.values[2], 'brown');
  t.equal(result.color.length, 4);
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

test('Adlib::Optional:: missing optional output prop is removed', (t) => {

  let template = {
    value:'{{s.color}}',
    missing: '{{s.color.wonky:optional:0}}'
  };
  let settings = {
    s: {
      color: 'brown'
    }
  };
  let result = adlib(template, settings);
  t.plan(3);
  t.ok(result.value);
  t.equal(result.value, 'brown');
  t.equal(result.missing, undefined, 'missing should be undefined');
  t.end();
});

test('Adlib::Optional:: missing optional array entry is removed', (t) => {

  let template = {
    value:'{{s.color}}',
    arr: [
      {
        color: '{{s.color}}',
        props: '{{s.props}}'
      },
      {
        color: '{{s.color}}',
        props: '{{j.props:optional:1}}'
      }
    ]
  };
  let settings = {
    s: {
      color: 'brown',
      props: {
        foo: 'bar'
      }
    }
  };
  let result = adlib(template, settings);
  t.plan(3);
  t.ok(result.value);
  t.equal(result.value, 'brown');
  t.equal(result.arr.length, 1, 'array should have one entry');
  t.end();
});

test('Adlib::Optional:: example case', (t) => {

  let template = {
    someProp: 'red',
    operationalLayers: [
      {
        url: `{{layers.pipes.url}}`,
        fields: [
          {
            key: 'direction',
            fieldName: `{{layers.pipes.directionField:optional:3}}`
          }
        ]
      }
    ]
  };
  let settings = {
    layers: {
      pipes: {
        url: 'http://someserver.com/23'
      }
    }
  };
  let result = adlib(template, settings);
  t.plan(3);
  t.ok(result.someProp);
  t.equal(result.someProp, 'red');
  t.equal(result.operationalLayers.length, 0, 'array should have no entry');
  t.end();
});