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

import { getWithDefault } from './getWithDefault';
import { deepMapValues } from './deepMap';
import { arborist } from './optional-transform/arborist';
import { optionalTransform } from './optional-transform/optional';
import { cloneObject } from './cloneObject';
const HANDLEBARS = /{{\s*?[\w].*?}}/g;

const isString = (v) => typeof v === 'string';

function _swap(parameter, settings, transforms) {
  let value;
  // console.info(`_swap: param: ${parameter}`);
  // Parameters can optionally call transform functions
  // e.g. "{{ipsum:translateLatin}}"
  // so extract {{<parameter>:<transformFunction>:<key||value>}}
  let transformCheck = parameter.split(':');
  if (transformCheck.length > 1) {
    // we have a request to use a transform...
    let key = transformCheck[0];
    let fn = transformCheck[1];
    // we default to using the value...
    let param;
    if (transformCheck[2]){
      param = transformCheck[2];
    }
    if(transforms && transforms[fn] && typeof transforms[fn] === 'function') {
      // get the value from the param
      value = getWithDefault(settings, key);
      // transform it...
      value = transforms[fn](key, value, settings, param);
    } else {
      throw new Error(`Attempted to apply non-existant transform ${fn} on ${key} with params ${parameter}`);
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
  let cleanPath = propertyPath.split(':')[0];
  let value = getWithDefault(target, cleanPath, null);
  if (value !== null && value !== undefined) {
    return true;
  } else {
    return false;
  }
}

/**
 * Is the value considered valid
 */
function _isValue (val) {
  return val || val === '' || val === 0;
}

// Combine a Template with Settings
export function adlib (template, settings, transforms = null) {
  transforms = cloneObject(transforms) || {};
  if (transforms.optional) {
    throw new Error('Please do not pass in an `optional` transform; adlib provides that internally.');
  } else {
    transforms.optional = optionalTransform;
  }

  let res = deepMapValues(template, function(templateValue, templatePath){
    // Only string templates
    if (!isString(templateValue)) {
      return templateValue;
    }

    // When we match "{{layer.fields..}}"
    var settingsValue;
    var replaceValue = false;

    let hbsEntries = templateValue.match(HANDLEBARS);

    if (hbsEntries && hbsEntries.length) {
      // console.log(`Got a ${hbsEntries.length} handlebar entries...`);
      // iterate over the entries...
      let values = hbsEntries.map((entry) => {
        let isStaticValue = false;
        // console.info(`Matched ${entry}...`);
        // strip off the curlies and trim any leading/trailing whitespace...
        let path = entry.replace(/{|}/g, '').trim();
        // check for || which indicate a hiearchy
        if (path.indexOf('||') > -1) {
          var paths = path.split('||').map(path => path.trim());
          let numberOfPaths = paths.length;
          // here we check each option, in order, and return the first with a value in the hash, OR the last
          path = paths.find((pathOption, idx) => {
            // console.info(`Checking to see if ${pathOption} is in settings hash...`);
            let exists = _propertyPathExists(pathOption, settings);
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
        let result = {
          key: entry,
          value: path
        };
        // if we have a valid object path, value comes from _swap
        if (!isStaticValue) {
          var swap = _swap(path, settings, transforms);
          result.value = _isValue(swap) ? swap : entry;
        }
        // console.info(`Value: ${JSON.stringify(result)}`);
        return result;
      });

      values.forEach((v) => {
        // console.log(`Comparing ${templateValue} with ${v.key}`)
        if (templateValue === v.key) {
          // console.log(`template matches key, returning ${v.value}`);
          // if the value is a string...
          if (typeof v.value === 'string') {
            // and it's numeric-ish
            if(!isNaN(v.value) && v.value !== '') {
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
          // console.log(`KEY ${v.key}`);
          // console.log(`TEMPLATE ${templateValue}`);
          templateValue = templateValue.replace(v.key, v.value);
          // console.log(`template did not match key, interpolating value ${v.value} into template to produce ${templateValue}`);
        }
      });

      // if we have a value, let's return that...
      if (_isValue(settingsValue)) {
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

// read a template and spit out unique values
export function listDependencies (template) {
  if (typeof template !== 'string') {
    template = JSON.stringify(template)
  }

  try {
    return Array.from(
      new Set(
        template.match(HANDLEBARS)
      )
    )
    .map(term => {
      return term.replace(/^{{/g, '').replace(/}}$/g, '').replace(/:.+$/, '')
      // Node > 10 and browsers support this w/ a lookahead
      // won't need to use the replace
      // /(?<={{)[\w].*?(?=}})/g
    })
  } catch (e) {
    console.error(e)
  }
}

