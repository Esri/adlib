/**
 * Should keep an Object
 *
 */
import mapValues from 'lodash.mapvalues';

function isObject (v) {
  return typeof v === 'object'
}

/**
 * Trim a tree decorated with `{{delete:NNN}}`
 */
export function arborist (object, propertyPath) {
  propertyPath = propertyPath || '';

  if(Array.isArray(object)){

    let arrResults = object.map(iteratee).filter((e) => {
      return e;  // remove any nulls
    });
    return pruneArray(arrResults);

  } if(object && isObject(object) ) {

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
export function pruneArray (arrResults) {
  let res = arrResults;
  // is any entry a string w/ {{delete}}?
  let maxLevel = arrResults.reduce((maxLevel, e) => {
    if (isString(e) && hasDelete(e)) {
      let lvl = getLevel(e);
      if (lvl > maxLevel) {
        maxLevel = lvl;
      }
    }
    return maxLevel;
  }, -1);

  if (maxLevel > -1) {
    if (maxLevel === 0) {
      res = []
    } else {
      res = `{{delete:${maxLevel - 1}}}`;
    }
  }

  return res;
}


export function pruneObject (objResults) {
  console.log(`   pruneObject:: working on ${JSON.stringify(objResults)}`);
  let startVal = {obj: {}, maxLevel: -1 };
  let res;
  // cook a new clone object, and track the maxLevel
  let reduction = Object.keys(objResults).reduce((acc, key) => {
    let val = objResults[key];
    if (isString(val) && hasDelete(val)) {
      let lvl = getLevel(val);
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
      res = `{{delete:${reduction.maxLevel - 1}}}`;
    }
  } else {
    res = reduction.obj;
  }

  console.log(`     returning ${JSON.stringify(res)}`);
  return res;
}

/**
 * Get a value for a property, handling the `{{delete:NNN}}` syntax
 */
export function getPropertyValue (val){
  let output = val;

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
  let output = val;
  let level = getLevel(val);
  if (level === 0) {
    output = undefined;
  } else {
    output = `{{delete:${level}}}`;
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

function isString (v) {
  return typeof v === 'string';
}
