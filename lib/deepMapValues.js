import _ from 'lodash';
/**
 * Pulled from lodash-deep so if/when we get tree-shaking working we can drop the
 * simple object type checks and have a really lean library
 */
export default function deepMapValues(object, callback, propertyPath) {
  propertyPath = propertyPath || '';
  if(_.isArray(object)){
      return _.map(object, deepMapValuesIteratee);
  }
  else if(_.isObject(object) && !_.isDate(object) && !_.isRegExp(object) && !_.isFunction(object)){
      return _.extend({}, object, _.mapValues(object, deepMapValuesIteratee));
  }
  else{
      return callback(object, propertyPath);
  }

  function deepMapValuesIteratee(value, key){
      var valuePath = propertyPath ? propertyPath + '.' + key: key;
      return deepMapValues(value, callback, valuePath);
  }
}
