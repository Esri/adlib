
import test from 'tape';
import adlib from '../lib/adlib';


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
