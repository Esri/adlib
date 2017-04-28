import map from 'lodash-es/map';
import mapValues from 'lodash-es/mapValues';
import assignIn from 'lodash-es/assignin';
import isObject from 'lodash-es/isObject';
import isDate from 'lodash-es/isDate';
import isFunction from 'lodash-es/isFunction';
import isRegExp from 'lodash-es/isRegexp';

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
