import map from 'lodash.map';
import mapValues from 'lodash.mapvalues';
import assignIn from 'lodash.assignin';
import isObject from 'lodash.isobject';
import isDate from 'lodash.isdate';
import isFunction from 'lodash.isfunction';
import isRegExp from 'lodash.isregexp';

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
