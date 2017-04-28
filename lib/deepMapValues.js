import map from 'lodash-es/map';
import mapValues from 'lodash-es/mapValues';
import assignIn from 'lodash-es/assignIn';

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
    return map(object, deepMapValuesIteratee);
  }
  else if(isObject(object) && !isDate(object) && !isRegExp(object) && !isFunction(object)){
    return assignIn({}, object, mapValues(object, deepMapValuesIteratee));
  }
  else{
    return callback(object, propertyPath);
  }

  function deepMapValuesIteratee(value, key){
    var valuePath = propertyPath ? propertyPath + '.' + key: key;
    return deepMapValues(value, callback, valuePath);
  }
}