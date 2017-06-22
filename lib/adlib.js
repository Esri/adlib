/**
 * adlib.js
 */
import get from 'lodash-es/get';
import deepMapValues from './deepMapValues';
//import Transforms from './transforms'

function isString(v) {
  return typeof v === 'string';
}

function _swap(parameter, settings) {

    var transformFunction;
    var value;
    var transformCheck;
    // Parameters can optionally call transform functions
    // e.g. "{{ipsum:translateLatin}}"
    // so extract {{<parameter>:<transformFunction>}}
    if(transformCheck = parameter.match(/(.*):(\w+)/)) {
        transformFunction = transformCheck[2];
        parameter = transformCheck[1];
    }

    // get the setting value for this parameter
    value = get(settings, parameter)

    // console.info(`Param ${parameter} value: ${JSON.stringify(value)}`);
    // TODO: If necessary, call transform methods
    // if(transformFunction !== undefined && transformFunction !== null) {
    //     value = Transforms[transformFunction](value);
    // }

    return value;
}

// Combine a Template with Settings
export default function adlib(template, settings) {
    return deepMapValues(template, function(templateValue, templatePath){
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
              value: _swap(path, settings) || entry
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
}
