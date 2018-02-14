/**
* adlib - v2.2.1 - Wed Feb 14 2018 15:31:06 GMT-0700 (MST)
* Copyright (c) 2018 Dave Bouwman / Esri
* Apache-2.0
*/
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.adlib = factory());
}(this, (function () { 'use strict';

/**
 * Return the value of a deep property, using a path.
 */
function getWithDefault (obj, path, defaultValue) {
  if ( defaultValue === void 0 ) defaultValue = undefined;

  return path
    .split('.')
    .reduce(function (o, p) { return o ? o[p] : defaultValue; }, obj)
}

/**
 * Simply Map over the props of an object
 */
function mapValues (obj, fn) {
  var keys = Object.keys(obj);
  // console.info(`keys: ${keys}`);
  var newObject = keys.reduce(function(acc, currentKey) {
    // console.log(`   acc: ${JSON.stringify(acc)} curKey: ${currentKey}`);
    acc[currentKey] = fn(obj[currentKey], currentKey, obj);
    return acc;
  }, {});
  // console.info(`  output: ${JSON.stringify(newObject)}`);
  return newObject;
}

/**
 * Deep Map over the values in an object
 */
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

function deepMapValues(object, callback, propertyPath, that) {
  propertyPath = propertyPath || '';
  if(Array.isArray(object)){
    return object.map(deepMapValuesIteratee);
  }
  else if(object && isObject(object) && !isDate(object) && !isRegExp(object) && !isFunction(object)){
    return Object.assign({}, object, mapValues(object, deepMapValuesIteratee));
  }
  else {
    var output = callback(object, propertyPath);
    return output;
  }

  function deepMapValuesIteratee(value, key){
    var valuePath = propertyPath ? propertyPath + '.' + key : key;
    return deepMapValues(value, callback, valuePath);
  }
}

/**
 * The arborist is responsible for pruning trees with nodes/entries
 * marked with `{{delete:NNN}}`
 *
 * There are multiple exports, mainly to allow for easy testing of the
 * worker functions. Only `arborist` is meant to be used directy
 */
// import mapValues from 'lodash.mapvalues';
function isObject$1 (v) {
  return typeof v === 'object'
}

/**
 * Trim a tree decorated with `{{delete:NNN}}`
 */
function arborist (object, propertyPath) {
  propertyPath = propertyPath || '';

  if(Array.isArray(object)){
    // filter out any nulls...
    var arrResults = object.map(iteratee).filter(function (entry) {
      // need to ensure entry is actually NULL vs just falsey
      return entry !== null && entry !== undefined;
    });
    return pruneArray(arrResults);

  } if(object && isObject$1(object) ) {

    return pruneObject(mapValues(object, iteratee));

  } else {

    return getPropertyValue(object, propertyPath);
  }

  function iteratee(value, key){
    var valuePath = propertyPath ? propertyPath + '.' + key: key;
    return arborist(value, valuePath);
  }
}

/**
 * Prune an array
 * For all the entries in the array...
 *    if the entry is a naked string and contains `{{delete:NNN}}`
 *      get maximum NNN value
 *    then
 *      if maxN === 0
 *        return an empty array
 *      if maxN > 0
 *        return `{{delete:maxN-1}}`
 *    else
 *      return array
 */
function pruneArray (arrResults) {
  var res = arrResults;
  // is any entry a string w/ {{delete}}?
  var maxLevel = arrResults.reduce(function (maxLevel, e) {
    if (isString$1(e) && hasDelete(e)) {
      var lvl = getLevel(e);
      if (lvl > maxLevel) {
        maxLevel = lvl;
      }
    }
    return maxLevel;
  }, -1);

  if (maxLevel > -1) {
    if (maxLevel === 0) {
      res = [];
    } else {
      res = "{{delete:" + (maxLevel - 1) + "}}";
    }
  }

  return res;
}


function pruneObject (objResults) {
  // console.log(`   pruneObject:: working on ${JSON.stringify(objResults)}`);
  var startVal = {obj: {}, maxLevel: -1 };
  var res;
  // cook a new clone object, and track the maxLevel
  var reduction = Object.keys(objResults).reduce(function (acc, key) {
    var val = objResults[key];
    if (isString$1(val) && hasDelete(val)) {
      var lvl = getLevel(val);
      if (lvl > acc.maxLevel) {
        acc.maxLevel = lvl;
      }
    } else {
      // only add the prop if it's not a `{{delete:NNN}}`
      acc.obj[key] = val;
    }
    return acc;
  }, startVal);
  // if -1, we return entire object...
  // if 0 we just remove the prop...
  // if 1 we return undefined...
  // if > 1 we return the deleteVal
  if (reduction.maxLevel > 0 ) {
    if (reduction.maxLevel === 1) {
      res = undefined;
    } else {
      res = "{{delete:" + (reduction.maxLevel - 1) + "}}";
    }
  } else {
    res = reduction.obj;
  }

  // console.log(`     returning ${JSON.stringify(res)}`);
  return res;
}

/**
 * Get a value for a property, handling the `{{delete:NNN}}` syntax
 */
function getPropertyValue (val){
  var output = val;

  if (typeof val === 'string') {
    if (hasDelete(val)) {
      output = getDeleteValue(val);
    }
  }
  return output;
}

/**
 * Given a string with `{{delete:NNN}}`
 * if NNN === 0 return undefined
 * else return `{{delete:NNN - 1}}`
 */
function getDeleteValue (val) {
  var output = val;
  var level = getLevel(val);
  if (level === 0) {
    output = undefined;
  } else {
    output = "{{delete:" + level + "}}";
  }
  return output;
}

/**
 * Extract the level from a `{{delete:NNN}}`
 */
function getLevel (value) {
  return parseInt(value.replace(/{|}/g, '').split(':')[1]);
}

/**
 * Simple check if a value has `{{delete` in it
 */
function hasDelete (value) {
  if (value && typeof value === 'string') {
    return value.indexOf('{{delete') > -1;
  } else {
    return false;
  }
}

function isString$1 (v) {
  return typeof v === 'string';
}

/**
 * Optional Transform
 * Supports a declarative syntax for optional template properties
 *
 * {{some.object.key:optional:2}}
 *
 * In this example, if defined, the value of `some.object.key` is used.
 * If not defined, then the optional transform is utilized
 * and a post-processing step is executed which will remove two parent levels
 * from the output structure
 */

function optional(key, value, settings, level) {
  if ( level === void 0 ) level = 0;

  // console.log(`optional: ${key}, ${value}, ${level}`);
  var val = value;
  if (!value) {
    val = "{{delete:" + level + "}}";
  }
  return val;
}

/**
 * adlib.js
 */
function isString(v) {
  return typeof v === 'string';
}

function _swap(parameter, settings, transforms) {
  var value;
  // console.info(`_swap: param: ${parameter}`);
  // Parameters can optionally call transform functions
  // e.g. "{{ipsum:translateLatin}}"
  // so extract {{<parameter>:<transformFunction>:<key||value>}}
  var transformCheck = parameter.split(':');
  if (transformCheck.length > 1) {
    // we have a request to use a transform...
    var key = transformCheck[0];
    var fn = transformCheck[1];
    // we default to using the value...
    var param = null;
    if (transformCheck[2]){
      param = transformCheck[2];
    }
    if(transforms && transforms[fn] && typeof transforms[fn] === 'function') {
      // get the value from the param
      value = getWithDefault(settings, key);
      // transform it...
      value = transforms[fn](key, value, settings, param);
    } else {
      throw new Error(("Attempted to apply non-existant transform " + fn + " on " + key + " with params " + parameter));
    }
  } else {
    // we just get the value
    value = getWithDefault(settings, parameter);
  }
  return value;
}

/**
 * Does a propertyPath exist on a target
 */
function _propertyPathExists (propertyPath, target) {
  // remove any transforms
  var cleanPath = propertyPath.split(':')[0];
  var value = getWithDefault(target, cleanPath, null);
  if (value !== null && value !== undefined) {
    return true;
  } else {
    return false;
  }
}

// Combine a Template with Settings
function adlib(template, settings, transforms) {
  if ( transforms === void 0 ) transforms = null;

  transforms = transforms || {};
  if (transforms.optional) {
    throw new Error('Please do not pass in an `optional` transform, adlib provides that interally.');
  } else {
    transforms.optional = optional;
  }

  var res = deepMapValues(template, function(templateValue, templatePath){
    // Only string templates
    if (!isString(templateValue)) {
      return templateValue;
    }

    // When we match "{{layer.fields..}}"
    var settingsValue;
    var replaceValue = false;

    // var handlebars = /{{[\S\s]*?}}/g;
    var handlebars = /{{[\w\.\:||&\/?=]*?}}/g;
    var hbsEntries = templateValue.match(handlebars);

    if (hbsEntries && hbsEntries.length) {
      // console.log(`Got a ${hbsEntries.length} handlebar entries...`);
      var isStaticValue = false;
      // iterate over the entries...
      var values = hbsEntries.map(function (entry) {
        // console.info(`Matched ${entry}...`);
        // strip off the curlies...
        var path = entry.replace(/{|}/g, '');
        // check for || which indicate a hiearchy
        if (path.indexOf('||') > -1) {
          var paths = path.split('||');
          var numberOfPaths = paths.length;
          // here we check each option, in order, and return the first with a value in the hash, OR the last
          path = paths.find(function (pathOption, idx) {
            // console.info(`Checking to see if ${pathOption} is in settings hash...`);
            var exists = _propertyPathExists(pathOption, settings);
            if (!exists) {
              if ((idx + 1) === numberOfPaths) {
                // console.info(`Got to last entry, and still did not find anything... assuming ${pathOption} is a static value...`);
                isStaticValue = true;
                // check if we can convert this into a number...
                if (!isNaN(pathOption)) {
                  pathOption = parseInt(pathOption);
                }
                return pathOption;
              } else {
                return false;
              }
            } else {
              return pathOption;
            }
          });
        }
        // setup the return value...
        var result = {
          key: entry,
          value: path
        };
        // if we have a valid object path, value comes from _swap
        if (!isStaticValue) {
          result.value = _swap(path, settings, transforms) || entry;
        }
        // console.info(`Value: ${JSON.stringify(result)}`);
        return result;
      });

      values.forEach(function (v) {
        // console.log(`Comparing ${templateValue} with ${v.key}`)
        if (templateValue === v.key) {
          // console.log(`template matches key, returning ${v.value}`);
          // if the value is a string...
          if (typeof v.value === 'string') {
            // and it's numeric-ish
            if(!isNaN(v.value)) {
              // and has a . in it...
              if (v.value.indexOf('.') > -1) {
                // parse as a float...
                v.value = parseFloat(v.value);
              } else {
                // parse as an int
                v.value = parseInt(v.value);
              }
            }
          }
          settingsValue = v.value;
        } else {
          // a little extra regex dance to match the '||' because '|'
          // is a Very Special Regex Character and we need to super
          // escape them for the regex to work
          console.log(("KEY " + (v.key)));
          console.log(("TEMPLATE " + templateValue));
          templateValue = templateValue.replace(v.key, v.value);
          // console.log(`template did not match key, interpolating value ${v.value} into template to produce ${templateValue}`);
        }
      });

      // if we have a value, let's return that...
      if (settingsValue) {
        // console.log(`We found a value so we return it ${settingsValue}`);
        return settingsValue;
      } else {
        // console.log(`We did not find a value so we return the template ${templateValue}`);
        // but if we don't, lets return the template itself
        return templateValue;
      }
    } else {
      // console.log(`We did not find a hbs match, so we return the template ${templateValue}`);
      // no match, return the templateValue...
      return templateValue;
    }
  });
  return arborist(res);
}

return adlib;

})));
//# sourceMappingURL=adlib.umd.js.map
