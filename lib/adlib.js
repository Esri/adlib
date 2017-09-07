/**
 * adlib.js
 */
import get from 'lodash.get';
import deepMapValues from './deepMapValues';
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
        value = get(settings, key);
        // transform it...
        value = transforms[fn](key, value, settings, param);
      } else {
        throw new Error(`Attempted to apply non-existant transform ${fn} on ${key} with params ${param}`);
      }
    } else {
      // we just get the value
      value = get(settings, parameter);
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
        var handlebars = /{{([\w\.\:]+)}}/g;
        let match = templateValue.match(handlebars);

        if (match && match.length) {
          let values = match.map((entry) => {
            let path = entry.replace(/{|}/g, '');
            return {
              key: entry,
              value: _swap(path, settings, transforms) || entry
            };
          });
          values.forEach((v) => {
            if (templateValue == v.key) {
              settingsValue = v.value;
            } else {
              let re = new RegExp(v.key, 'g');
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
