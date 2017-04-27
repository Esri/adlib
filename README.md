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
  values: ['{{s.animal}}', 'fuzzy','{{s.color}}'],
  names: '{{s.names}}'
};
let settings = {
  s: {
    animal: 'bear',
    color: 'brown',
    names: ['steve', 'dave']
  }
};
let result = adlib(template, settings);
//> result.values === ['bear', 'fuzzy', 'brown']
//> result.names === ['steve', 'dave']
```
