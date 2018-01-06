import mapValues from './mapValues';

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

export default function deepMapValues(object, callback, propertyPath, that) {
  propertyPath = propertyPath || '';
  if(Array.isArray(object)){
    return object.map(deepMapValuesIteratee);
  }
  else if(object && isObject(object) && !isDate(object) && !isRegExp(object) && !isFunction(object)){
    return Object.assign({}, object, mapValues(object, deepMapValuesIteratee));
  }
  else {
    let output = callback(object, propertyPath);
    return output;
  }

  function deepMapValuesIteratee(value, key){
    var valuePath = propertyPath ? propertyPath + '.' + key : key;
    return deepMapValues(value, callback, valuePath);
  }
}
