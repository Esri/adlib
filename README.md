# adlib

[![npm version][npm-img]][npm-url]
[![build status][travis-img]][travis-url]
[![apache licensed](https://img.shields.io/badge/license-Apache-green.svg?style=flat-square)](https://raw.githubusercontent.com/Esri/adlib/master/LICENSE)

[npm-img]: https://img.shields.io/npm/v/adlib.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/adlib
[travis-img]: https://img.shields.io/travis/Esri/adlib/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/Esri/adlib

> A JavaScript library for interpolating property values in JSON Objects.

The [ArcGIS Hub](https://hub.arcgis.com) team uses adlib to build Web Maps, Hub Sites, Hub Pages and other newly created ArcGIS Online content using customer [Open Data](https://hub.arcgis.com/pages/open-data) on the fly.

To get a feel for how adlib works, check out this [Live Demo](https://arcgis.github.io/ember-arcgis-adlib-service/)!

## Usage

### ES Module
```js
import { adlib, listDependencies }  from 'adlib'

adlib(template, settings) // renders an adlib template
listDependencies(template) // list all dependecies of an adlib template
```

### Browser (from CDN)

This package is distributed as a [UMD](https://github.com/umdjs/umd) module and can also be used in AMD based systems or as a global under the `adlib` namespace.

```html
<script src="https://unpkg.com/adlib"></script>
```
```js
adlib.adlib(template, settings)
adlib.listDependencies(template)
```

### TypeScript

TypeScript definitions are available from [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/adlib):
`npm install --save-dev @types/adlib`

# General Pattern

```js
const template: {
  value: '{{ instance.color }}'
};

const settings: {
  instance: {
    color: 'red'
  }
};

const result = adlib(template, settings);
// > { value: 'red' }
```

**Note** Adlib does not mutate the template, it returns a new object that contains copies of the template properties with interpolations applied. This allows the template to be used multiple times in succession with different settings hashes.

# List dependencies
Gets a list of all variables your template depends upon
```js
const template = 'Injuries: {{CRASHID}}<br />On Scene: {{ISREPORTONSCENE}}'
const deps = adlib.listDependencies(template); // CRASHID, ISREPORTONSCENE
```

# Supported Interpolations

## Strings
Within the template, the value of any property can be described using `{{obj.prop}}`.

If the `obj.prop` "path" in the settings object is a string, that string value is assigned to the value.

## Multiple Strings
A property of a template can have a value like `'The {{thing.animal}} was {{thing.color}}'`. When combined with a settings object that has the appropriate values, this will result in `The fox was brown`.

```js
let template = {
  value: 'The {{thing.animal}} was {{thing.color}}'
};
let settings = {
  thing: {
    color: 'red',
    animal: 'fox'
  }
};
let result = adlib(template, settings);
//> {value: 'The fox was red'}
```

## Objects

If the interpolated value is an object, it is returned. This allow us to graft trees of json together.

```js
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
//> { value: {val: 'red'}}
```

## Arrays
If the interpolated value is an array, it is returned. Interpolation is also done within arrays.

```js
let template = {
  values: ['{{s.animal}}', 'fuzzy', '{{s.color}}'],
  names: '{{s.names}}'
};
let settings = {
  s: {
    animal: 'bear',
    color: 'brown',
    names: ['larry', 'sergey']
  }
};
let result = adlib(template, settings);
//> result.values === ['bear', 'fuzzy', 'brown']
//> result.names === ['larry', 'sergey']
```

## Transforms
Adlib can apply transforms during the interpolation. The transform fn should have the following signature: `fn(key, value, settings)`.

```js
// Pattern
// {{key:transformFnName}}

let  tmpl = `{{s.animal.type:upcase}}`;
let settings = {
  s: {
    animal: {
      type: 'bear'
    }
  }
}
// will parse into
// key: s.animal.type
// value: 'bear'
// transformFnName: 'upcase'
```

### Notes About Transforms
- Transforms are ideally pure functions, and they **must** be sync functions! Promises are not supported.
- Transform functions should be VERY resilient - we recommend unit testing them extensively
- If your settings hash does not have an entry for the `key`, the `value` will be `null`.

### Transforms

```js
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
    return val.toUpperCase();
  }
};
let result = adlib(template, settings, transforms);
//> result.value = 'BEAR'
```

### Transforms using the Key
A typical use-case for this is for translation.

```js
let template = {
  value:'{{s.animal.type:translate}}'
};
let settings = {};
let transforms = {
  translate (key, val, settings) {
    // the translator is passed in from the consuming application
    // note that the settings hash is empty
    return translator.translate(key);
  }
};
let result = adlib(template, settings, transforms);
//> result.value = 'string returned from translation system'
```

## Built-in Transforms

`adlib` comes with some built-in transforms:
- optional - declare a value to be optional

### Optional Transform

`{{key.path:optional:<levelToRemove>}}`

By default, if the key is not found, `adlib` simply leaves the `{{key.path}}` in the output json. However, that can/will lead to problems when the json is consumed.

The `optional` transform helps out in these scenarios. By default when `adlib` encounters something like:

```js
{
  someProp: 'red'
  val: '{{key.path:optional}}'
}
```

and `key.path` is `null` or `undefined`, the `val` property will simply be removed.

```js
{
  someProp: 'red'
}
```

The same thing works in arrays

```js
{
  someProp: 'red'
  vals: [
    'red',
    '{{key.path:optional}}'
  ]
}

// returns
{
  someProp: 'red'
  vals: [
    'red',
  ]
}

```

However, there are times when simply removing the property/entry is not enough. Sometimes you need to "reach up" the object graph and remove a parent. This is where the `levelToRemove` comes in...

```js
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
// will returns
{
  someProp: 'red'
  operationalLayers: []
}
```

### levelToRemove

| value | removes what |
| --- | --- |
| 0 (default) | the property or array entry |
| 1 | the parent object/array |
| 2 | the grand-parent object/array |
| ... | ... up the hierarchy |

### Path Hierarchies

Sometimes you may want to adlib a value using one of several possible data sources. You can specify each data source in a hierarchy of preference in the template

```js
let template = {
  dataset: {
    title: {{layer.name||item.title}},
    modified: {{metadata.some.super.nested.value.bc.im.a.weird.xml.doc:toISO||item.modified:toISO}},
    tags: {{metadata.categories||item.tags}}
  }
}

let settings = {
  metadata: {
    categories: [
      'citations',
      'civil offense',
      'misdemeanor'
    ],
    some: {
      super: {
        nested: {
          value: {
            bc: {
              im: {
                a: {
                  weird: {
                    xml: {
                      doc: '1505836376836'
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  item: {
    title: '2014 Parking Violations',
    tags: [
      'Parking',
      'Washington',
      'Citations',
      'Crimes',
      'Law Enforcement',
      'Nuisance',
      'Cars'
    ]
  },
  layer: {}
}

let transforms = {
  toISO: function (key, val, settings) {
    if (isStringAndNotADateValue(val)) {
      return new Date(val).toISOString()
    }
  }
}

adlib(template, settings, transforms)
// => returns
{
  dataset: {
    title: '2014 Parking Violations',
    modified: '2017-09-19T15:52:56.836Z',
    tags: [
      'citations',
      'civil offense',
      'misdemeanor'
    ]
  }
}
```

### Path Hierarchies with Defaults

If none of the paths are available, the last entry can be a static value and that will be returned.
We support returning strings ('RED', 'the red fox'), ints (23, 15), and floats (12.3, 0.234)

**Note** Transforms can not be applied to the default value!
Please see TODO.md for notes about changes required for this.

```js
let template = {
  msg: 'Site is at {{obj.mainUrl||obj.otherUrl||https://foo.bar?o=p&e=n}}'
}

var settings = {}

let result = adlib(template, settings);
// => returns
// 'Site is at https://foo.bar?o=p&e=n'
```

### Local Development

```
npm install && npm test
```

### Contributing

Esri welcomes contributions from anyone and everyone. Please see our [guidelines for contributing](https://github.com/Esri/contributing/blob/master/CONTRIBUTING.md).

### License

Copyright &copy; 2017-2019 Esri

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

> http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

A copy of the license is available in the repository's [LICENSE](./LICENSE) file.
