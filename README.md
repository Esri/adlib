# Adlib

A library for interpolating property values in JSON Objects.

The Hub team uses this to create customized Web Maps, Hub Sites, Hub Pages and other types of items.

# General Pattern
```
template: {
  val: '{{thing.val}}'
};
settings: {
  thing: {
    val: 'red'
  }
};
result = adlib(template, settings);
// > {val: 'red'}
```

**Note** Adlib does not mutate the template, it returns a new object that contains copies of the template properties, with interpolations applied. This allows the template to be used multiple times in succession with different settings hashes.

# Supported Interpolations

## Strings
Within the template, the value of any property can be described using `{{obj.prop}}`.

If the `obj.prop` "path" in the settings object is a string, that string value is assigned to the value.

## Multiple Strings
A property of a template can have a value like `'The {{thing.animal}} was {{thing.color}}'`. When combined with a settings object that has the appropriate values, this will result in `The fox was brown`.

```
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

```
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

```
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

```
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

```
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

```
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
```
{
  someProp: 'red'
  val: '{{key.path:optional}}'
}
```

and `key.path` is `null` or `undefined`, the `val` property will simply be removed.

```
{
  someProp: 'red'
}
```

The same thing works in arrays

```
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

```
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
| ... | ... up the hiearchy |
