/**
 * adlib.spec.js
 * This is run on the compiled adlib library
 */

let expect = require('chai').expect;
let adlib = require('../dist/adlib.umd.js');

describe('adlib ::', () => {
  it('should return a deep copy of the template', () => {
    let template = {
      foo: 'bar',
      baz: ['one', 'two']
    };
    let result = adlib.adlib(template, {});
    expect(template).to.not.equal(result);
    // ensure that changing the result DOES NOT change the template
    result.check = 'wat';
    expect(template.check).to.be.undefined;
    expect(result.foo).to.equal('bar');
    expect(result.foo).to.equal(template.foo);
  });

  it('should list dependency values in a template', () => {
    let template = {
      value: 'The {{thing.animal}} was {{thing.color}} but still a {{thing.animal}}'
    };
    let result = adlib.listDependencies(template);
    expect(result.length).to.equal(2);
    expect(result[0]).to.equal('thing.animal');
    expect(result[1]).to.equal('thing.color');
  })

  /**
   * Lets play with strings!
   */
  describe('string interpolation ::', () => {
    it('should replace a simple path with a string', () => {
      let template = {
        value: '{{thing.value}}'
      };
      let settings = {
        thing: {
          value: 'red'
        }
      };
      let result = adlib.adlib(template, settings);

      expect(result.value).to.equal('red');
    })

    it('should replace a path within a larger string', () => {
      let template = {
        value: 'The value is {{thing.value}}'
      };
      let settings = {
        thing: {
          value: 'red'
        }
      };
      let result = adlib.adlib(template, settings);

      expect(result.value).to.equal('The value is red');
    })


    it('should replace multiple instances within a larger string', () => {
      let template = {
        value: 'The value is {{thing.value}} and {{thing.value}}'
      };
      let settings = {
        thing: {
          value: 'red'
        }
      };
      let result = adlib.adlib(template, settings);

      expect(result.value).to.equal('The value is red and red');
    })

    it('should leave undefined instances within a larger string', () => {
      let template = {
        value: 'The value is {{thing.novalue}} and {{thing.value}}'
      };
      let settings = {
        thing: {
          value: 'red'
        }
      };
      let result = adlib.adlib(template, settings);

      expect(result.value).to.equal('The value is {{thing.novalue}} and red');
    })

    it('should leave undefined instances within a url string', () => {
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
      let result = adlib.adlib(template, settings);

      expect(result.value).to.equal('http://foo.com/apps/SummaryViewer/index.html?appid={{collisionViewer.item.id}}');
    })

    it('should replace multiple values in a string', () => {
      let template = {
        value: 'The {{thing.animal}} was {{thing.color}} but still a {{thing.animal}}'
      };
      let settings = {
        thing: {
          color: 'red',
          animal: 'fox'
        }
      };
      let result = adlib.adlib(template, settings);

      expect(result.value).to.equal('The fox was red but still a fox');
    })

    it('should flow missing things through', () => {
      let template = {
        value: '{{thing.value}}',
        v2: '{{not.present}}'
      };
      let settings = {
        thing: {
          value: 'red'
        }
      };
      let result = adlib.adlib(template, settings);

      expect(result.value).to.equal('red');
      expect(result.v2).to.equal(template.v2);
    })

    it('should work with deep graphs', () => {
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
      let result = adlib.adlib(template, settings);
      expect(result.l1.l2.l3.v).to.equal('green');
    });
  });
  /**
   * Lets play with objects!
   */
  describe('objects ::', () => {
    it('should preserve empty objects', () => {
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
      let result = adlib.adlib(template, settings);
      expect(result.value.val).not.to.be.undefined;
      expect(result.value.val).to.equal('red');
      expect(typeof result.emptyObj).to.equal('object');
      expect(result.emptyObj).not.to.be.undefined;
    })

    it('should preserve nulls', () => {
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
      let result = adlib.adlib(template, settings);
      expect(result.value.val).not.to.be.undefined;
      expect(result.value.val).to.equal('red');
      expect(result.nullThing).to.equal(null);
    })

    it('should replace a token with an object', () => {
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
      let result = adlib.adlib(template, settings);
      expect(result.value.val).not.to.be.undefined;
      expect(result.value.val).to.equal('red');
    })
    it('should replace a deep token with an deep object', () => {
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
      let result = adlib.adlib(template, settings);
      expect(result.value.val).not.to.be.undefined;
      expect(result.value.val).to.equal('red');
    })
  });
  /**
   * Lets play with arrays!
   */
  describe('arrays ::', () => {
    it('should replace tokens within an array with strings', () => {
      let template = {
        values: ['{{s.animal}}', 'fuzzy', '{{s.color}}']
      };
      let settings = {
        s: {
          animal: 'bear',
          color: 'brown'
        }
      };
      let result = adlib.adlib(template, settings);
      expect(result.values).not.to.be.undefined;
      expect(result.values[0]).to.equal('bear');
      expect(result.values[2]).to.equal('brown');
    })

    it('should replace tokens within an array with objects', () => {
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
      let result = adlib.adlib(template, settings);
      expect(result.values[0].type).to.equal('bear');
    });

    it('should replace tokens with an array', () => {
      let template = {
        values: '{{s.animals}}'
      };
      let settings = {
        s: {
          animals: [
            'bear', 'panda'
          ]
        }
      };
      let result = adlib.adlib(template, settings);
      expect(result.values).not.to.be.undefined;
      expect(Array.isArray(result.values)).to.be.true;
      expect(result.values[1]).to.equal('panda');
    });
    it('should replace tokens with an array and run transforms', () => {
      let template = {
        values: '{{s.animals:upcaseArr}}'
      };
      let settings = {
        s: {
          animals: [
            'bear', 'panda'
          ]
        }
      };
      let transforms = {
        upcaseArr(key, val, settings) {
          return val.map((v) => {
            return v.toUpperCase();
          })
        }
      }
      let result = adlib.adlib(template, settings, transforms);
      expect(result.values).not.to.be.undefined;
      expect(Array.isArray(result.values)).to.be.true;
      expect(result.values[1]).to.equal('PANDA');
    });
    it('should run passed in transforms', () => {
      let template = {
        value: '{{s.animal.type:upcase}}'
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
        upcase(key, val, settings) {
          return val.toUpperCase() + settings.s.color;
        }
      };
      let result = adlib.adlib(template, settings, transforms);
      expect(result.value).not.to.be.undefined;
      expect(result.value).to.equal('BEARbrown');
    });

    it('should run transform even if value is undefined', () => {
      let template = {
        value: '{{s.animal.type:upcase}}'
      };
      let settings = {
        s: {
          color: 'brown'
        }
      };
      let transforms = {
        upcase(key, val, settings) {
          return key.toUpperCase();
        }
      };
      let result = adlib.adlib(template, settings, transforms);
      expect(result.value).not.to.be.undefined;
      expect(result.value).to.equal('S.ANIMAL.TYPE');
    })

    it('transform has access to settings hash', () => {
      let template = {
        value: '{{s.animal.type:upcase}}'
      };
      let settings = {
        s: {
          color: 'brown'
        }
      };
      let transforms = {
        upcase(key, val, settings) {
          return `${key.toUpperCase()} is ${settings.s.color}`;
        }
      };
      let result = adlib.adlib(template, settings, transforms);
      expect(result.value).not.to.be.undefined;
      expect(result.value).to.equal('S.ANIMAL.TYPE is brown');
    });

    it('adlib handles a leading 0 effectively', () => {
      const template = {
        subdomain: "{{solution.subdomain}}"
      };

      const settings = {
        solution: {
          subdomain: "0000332",
        },
      };

      const transforms = {};
      let result = adlib(template, settings, transforms);
      expect(result.subdomain).to.equal('0000332');
    });

    it('adlib handles floats correctly', () => {
      const template = {
        float: "{{solution.float}}"
      };

      const settings = {
        solution: {
          float: '0.01',
        }
      };

      const transforms = {};
      let result = adlib(template, settings, transforms);
      expect(result.float).to.equal(0.01);
    });

    it('adlib handles integers correctly', () => {
      const template = {
        integer: "{{solution.integer}}"
      };

      const settings = {
        solution: {
          integer: '7',
        }
      };

      const transforms = {};
      let result = adlib(template, settings, transforms);
      expect(result.integer).to.equal(7);
    });
  })
})
