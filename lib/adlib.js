/**
 * adlib.js
 */
import getWithDefault from './getWithDefault';
import deepMapValues from './deepMap';
import {arborist} from './optional-transform/arborist';
import optionalTransform from './optional-transform/optional';

function isString(v) {
  return typeof v === 'string';
}

function _swap(parameter, settings, transforms) {
  let value;
  // Parameters can optionally call transform functions
  // e.g. "{{ipsum:translateLatin}}"
  // so extract {{<parameter>:<transformFunction>:<key||value>}}
  let transformCheck = parameter.split(':');
  if (transformCheck.length > 1) {
    // we have a request to use a transform...
    let key = transformCheck[0];
    let fn = transformCheck[1];
    // we default to using the value...
    let param = null;
    if (transformCheck[2]){
      param = transformCheck[2];
    }
    if(transforms && transforms[fn] && typeof transforms[fn] === 'function') {
      // get the value from the param
      value = getWithDefault(settings, key);
      // transform it...
      value = transforms[fn](key, value, settings, param);
    } else {
      throw new Error(`Attempted to apply non-existant transform ${fn} on ${key} with params ${param}`);
    }
  } else {
    // we just get the value
    value = getWithDefault(settings, parameter);
  }
  return value;
}

// Combine a Template with Settings
export default function adlib(template, settings, transforms = null) {
  transforms = transforms || {};
  if (transforms.optional) {
    throw new Error('Please do not pass in an `optional` transform, adlib provides that interally.');
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
    var handlebars = /{{([\w\.\:(||)?]+)}}/g;
    let match = templateValue.match(handlebars);

    if (match && match.length) {
      let values = match.map((entry) => {
        let path = entry.replace(/{|}/g, '');
        let value;
        // checking if there were multiple paths specified
        // If so, take the value of the path that matches first
        // in order from left to right.
        //
        // e.g.
        //
        // {{special.value||backup.value}}
        //
        // we will prefer the value @ 'special.value' but if it is not
        // there we will take the value @ 'backup.value'
        if (path.indexOf('||') !== -1) {
          var paths = path.split('||');

          // AKH: I originally used one of those 'for (var x in arr)' thingies but then buble yelled at me.
          paths.forEach((pathOption) => {
            if (!value) {
              let v = _swap(pathOption, settings, transforms);
              if (v !== undefined && v !== pathOption) {
                value = v
              }
            }
          })
        } else {
          value = _swap(path, settings, transforms);
        }
        return {
          key: entry,
          value: value || entry
        };
      });
      values.forEach((v) => {
        if (templateValue == v.key) {
          settingsValue = v.value;
        } else {
          // a little extra regex dance to match the '||' because '|'
          // is a Very Special Regex Character and we need to super
          // escape them for the regex to work
          let re = new RegExp(v.key.replace(/\|\|/gi, '\\|\\|'));
          templateValue = templateValue.replace(re, v.value);
        }
      });

      // if we have a value, let's return that...
      if (settingsValue) {
        return settingsValue;
      } else {
        // but if we don't, lets return the template itself
        return templateValue;
      }
    } else {
      // no match, return the templateValue...
      return templateValue;
    }
  });
  return arborist(res);
}
