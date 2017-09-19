import map from 'lodash.map';
import mapValues from 'lodash.mapvalues';
import assignIn from 'lodash.assignin';

function isDate (v) {
  return v instanceof Date
}

function isFunction (v) {
  return typeof v === 'function'
}

function isObject (v) {
  return typeof v === 'object'
}

function isRegExp (v) {
  return v instanceof RegExp
}

/**
 * Pulled from lodash-deep so if/when we get tree-shaking working we can drop the
 * simple object type checks and have a really lean library
 */
export default function deepMapValues(object, callback, propertyPath) {
  propertyPath = propertyPath || '';
  if(Array.isArray(object)){
    // console.log(`mapping over ${propertyPath}...`);
    return map(object, deepMapValuesIteratee);
  }
  else if(object && isObject(object) && !isDate(object) && !isRegExp(object) && !isFunction(object)){
    // console.log(`looking at ${propertyPath}...`);
    return assignIn({}, object, mapValues(object, deepMapValuesIteratee));
  }
  else{
    // console.log(`recursing on ${propertyPath}...`);
    return callback(object, propertyPath);
  }

  function deepMapValuesIteratee(value, key){
    var valuePath = propertyPath ? propertyPath + '.' + key: key;
    return deepMapValues(value, callback, valuePath);
  }
}
