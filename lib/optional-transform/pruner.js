import mapValues from 'lodash.mapvalues';

function isObject (v) {
  return typeof v === 'object'
}

function hasDelete (value) {
  if (value) {
    return value.indexOf('delete') > -1;
  } else {
    return false;
  }

}

function getLevel (value) {
  return parseInt(value.replace(/{|}/g, '').split(':')[1]);
}

export default function pruner(obj) {
  // if we don't have an object, return null
  if (!obj) return null;

  let output = {
    keep: true,
    val: obj
  };
  let iterResult;
  if (Array.isArray(obj)) {
    // array
    iterResult = pruneArray(obj);
  } else if (isObject(obj)) {
    // object
    iterResult = pruneObject(obj);
  } else {
    // property
    iterResult = pruneProperty(obj);
  }

}

function pruneProperty (val) {
  let output = {
    keep: true,
    val: val
  };
  if (obj === 'string') {
    if (hasDelete(val)) {
      output.keep = false;
      level = getLevel(val);
      if (level === 0) {
        delete output.val;
      } else {
        leve = level - 1;
        output.val = `{{delete:${level}}}`;
      }
    }
  }
  return output;
}

function pruneObject (obj) {
  let clone = {};
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      let propResult = pruner(obj[key]);
      if (propResult.keep) {
        clone[key] = propResult.val;
      }
    }
  }
  return clone;
}

function pruneArray (arr) {
  let clone = [];
  arr.reduce((acc,obj) => {
    let result = prune(obj);
    if (result.keep) {
      acc.push(result.val);
    }
  }, [])
}
