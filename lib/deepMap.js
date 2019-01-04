/*    Copyright (c) 2017-2019 Esri Inc.
   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at
       http://www.apache.org/licenses/LICENSE-2.0
   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License. */

/**
 * Deep Map over the values in an object
 */
import { mapValues } from './mapValues';

const isDate = (v) => v instanceof Date;

const isFunction = (v) => typeof v === 'function';

const isObject = (v) => typeof v === 'object';

const isRegExp = (v) => v instanceof RegExp;

export function deepMapValues(object, callback, propertyPath) {
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
