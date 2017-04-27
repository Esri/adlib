/**
 * adlib.js
 */
import _ from 'lodash';
import deepMapValues from './deepMapValues';
//import Transforms from './transforms'

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
    value = _.get(settings, parameter)
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
        if(!_.isString(templateValue)) {
            return templateValue;
        }

        // When we match "{{layer.fields..}}"
        var settingsValue;
        var replaceValue = false;
        var handlebars = /{{([\w\.\:]+)}}/g;
        let match = templateValue.match(handlebars);

        if (match && match.length) {
          if (match.length > 1) {
            // this is a scenarion like 'The {{thing.animal}} was {{thing.color}}'
            // we map over the matches, hold the {{thing}} along with the value...
            let values = match.map((entry) => {
              let path = entry.replace(/{|}/g, '');
              return {
                key: entry,
                value: _swap(path, settings)
              };
            });

            // now we iterate the values, and run a replace on the templateValue for each...
            values.forEach((entry) => {
              templateValue = templateValue.replace(entry.key, entry.value);
            });

            return templateValue;
          } else {
            // we have a single thing to deal with...
            // clean up the {{}}'s
            let settingsPath = match[0].replace(/{|}/g, '');
            // swap the value out...
            settingsValue = _swap(settingsPath, settings)
          }
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
