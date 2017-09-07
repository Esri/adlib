/**
 * Should keep an Object
 *
 */
import mapValues from 'lodash.mapvalues';
import assignIn from 'lodash.assignin';

function isObject (v) {
  return typeof v === 'object'
}

function hasDelete (value) {
  if (value && typeof value === 'string') {
    return value.indexOf('delete') > -1;
  } else {
    return false;
  }

}

function getLevel (value) {
  return parseInt(value.replace(/{|}/g, '').split(':')[1]);
}


export function arborist (object, propertyPath) {
  propertyPath = propertyPath || '';

  if(Array.isArray(object)){

    let arrResults = object.map(iteratee).filter((e) => {
      // remove any nulls
      return e;
    });
    // is any entry a string w/ {{delete}}?
    let deletes = arrResults.filter((e) => {
      return typeof e === 'string' && e.indexOf('{{delete:') > -1;
    });
    console.log(`arborist:: array :: deletes ${JSON.stringify(deletes)}`);
    if (deletes.length) {
      // find out the maximum deletion level
      let maxLevel = deletes.reduce((acc, d) => {
        let l = getLevel(d);
        if (l > acc) {
          acc = l;
        }
        return acc;
      }, 0);
      let res = `{{delete:${maxLevel}}}`;
      if (maxLevel === 0) {
        res = []
      }

      console.log(`arborist:: array :: arrResults for propertyPath "${propertyPath}" is ${JSON.stringify(res)}`);
      return res;
    } else {
      // see if any of the results are {{delete}} things
      console.log(`arborist:: array :: arrResults for propertyPath "${propertyPath}" is ${JSON.stringify(arrResults)}`);
      return arrResults;
    }




  } if(object && isObject(object) ) {

    let objResults = mapValues(object, iteratee);
    console.log(`arborist:: object :: objResult for propertyPath "${propertyPath}" is ${JSON.stringify(objResults)}`);

    let deleteUp = false;
    let deleteUpVal = undefined;
    let returnObj = {};
    Object.keys(objResults).map((key)=>{
      // console.log(` key ${key} has val ${JSON.stringify(objResults[key])}`)
      if(hasDelete(objResults[key])) {
        deleteUp = true
        deleteUpVal = getDeleteValue(objResults[key]);
        console.log(`   prop "${key}" has delete with value ${objResults[key]} - entire object will be marked for deletion using ${deleteUpVal}`);
      } else {
        if (objResults.hasOwnProperty(key) && typeof objResults[key] !== 'undefined') {
          console.log(` objResults[${key}] hasval ${JSON.stringify(objResults[key])}`)
          returnObj[key] = objResults[key];
        }
      }
    });
    if (deleteUp) {
      console.log(`arborist:: object :: returning deleteUp for key ${propertyPath} is ${JSON.stringify(deleteUpVal)}`);
      return deleteUpVal
    } else {
      if (Object.keys(returnObj).length === 0) {
        return undefined;
      } else {
        console.log(`arborist:: object :: returning propertyPath "${propertyPath}" value ${JSON.stringify(returnObj)}`);
        return returnObj;
      }
    }

  } else {

    return getPropertyValue(object, propertyPath);
  }

  function iteratee(value, key){
    var valuePath = propertyPath ? propertyPath + '.' + key: key;
    return arborist(value, valuePath);
  }
}




// export function shears (object, callback, propertyPath) {
//   propertyPath = propertyPath || '';
//   console.log(`shears:: propertyPath "${propertyPath}"`);
//   if(Array.isArray(object)){
//     console.log(`shears:: array :: propertyPath "${propertyPath}"`);
//     let arrResults = object.map(iteratee);
//     console.log(`shears:: arrResults: ${JSON.stringify(arrResults)}`);
//     return arrResults;
//   }
//   // && !isDate(object) && !isRegExp(object) && !isFunction(object)
//   else if(object && isObject(object) ){
//     console.log(`shears:: object :: propertyPath "${propertyPath}"`);
//     let killObject = false;
//     let objResult = mapValues(object, (v, k) => {
//       let propResult = iteratee(v, k);
//       console.log(`shears:: object :: propResult for key ${k} is ${JSON.stringify(propResult)}`);
//       if (propResult && propResult.keep) {
//         return propResult.val;
//       } else {
//         console.log(`shears:: object :: got delete for ${k}`);
//         killObject = true;
//         return null;
//       }
//     });
//     console.log(`shears:: objectResult: ${JSON.stringify(objResult)}`);
//     if (killObject) {
//       console.log(`shears:: returning null for ${propertyPath}`)
//       return null;
//     } else {
//       let assigned = assignIn({}, object, objResult);
//       console.log(`shears:: returning ${JSON.stringify(assigned)} for ${propertyPath}`);
//       return assigned;
//     }
//
//   }
//   else{
//     console.log(`shears:: property :: propertyPath "${propertyPath}"`);
//     let inspection =  inspectValue(object);
//     if (inspection.keep) {
//       console.log(`shears:: property :: returning "${inspection.val}" for ${propertyPath}`);
//       return inspection.val;
//     } else {
//       if (!propertyPath.split('.').length) {
//         console.log(`shears:: property :: returning "undefined" for ${propertyPath}`);
//         return undefined;
//       } else {
//         console.log(`shears:: property :: returning "${JSON.stringify(inspection)}" for ${propertyPath}`);
//         return inspection;
//       }
//     }
//   }
//
//   function iteratee(value, key){
//     var valuePath = propertyPath ? propertyPath + '.' + key: key;
//     return shears(value, callback, valuePath);
//   }
// }
//
//
// export function arboristV1(obj) {
//   let output = {
//     keep: true,
//     val: obj
//   };
//   if (obj) {
//     console.log(`arborist :: input: ${JSON.stringify(obj)}}`);
//    // iterate the properties...
//    let result = mapValues(obj, (propValue, key) => {
//      console.log(`arborist :: key: "${key}" with value ${JSON.stringify(propValue)}}`);
//      // if it's an array, map over it w/ arborist...
//      if (Array.isArray(propValue)) {
//        console.log(`arborist:: array prop ${key}`);
//        let arrResult = pruneArray(propValue);
//        if (arrResult.keep) {
//          obj[key] = arrResult.val;
//        } else {
//          if (arrResult.val) {
//            obj[key] = arrResult.val;
//          } else {
//            delete obj[key];
//          }
//        }
//        console.log(`  obj[${key}]:  ${JSON.stringify(obj[key])}`);
//      }
//      else if (typeof propValue === 'string') {
//        console.log(`arborist:: string prop "${key}"`);
//        // if it's a string, check it for delete directive
//        let propResult = pruneProperty(propValue);
//        if (!propResult.keep) {
//          if (propResult.val) {
//            output.val = propResult.val;
//          } else {
//            delete output.val[key];
//          }
//        }
//      } else if (isObject(propValue)) {
//        // if it's an object, recurse into it...
//        let result = arborist(propValue);
//        if (!result.keep) {
//          delete obj[key];
//          if (result.value && result.value.indexOf('delete')){
//            output.keep = false;
//          }
//        }
//      }
//    });
//  }
//  console.log(`arborist:: returning ${JSON.stringify(output)}`)
//  return output;
// }
//
// export function pruneArray (arr) {
//   let keepMap = arr.map(arborist);
//   console.log(`  keepMap:  ${JSON.stringify(keepMap)}`);
//   let arrResult = {
//     keep: true,
//     val: []
//   }
//   let results = keepMap.reduce((acc, obj) => {
//     if(obj.keep) {
//       acc.push(obj.val);
//     } else {
//       if (hasDelete(obj.val)) {
//         // it is requesting that we (at least) delete the array
//         let level = getLevel(obj.val);
//         console.log(`   keepMapEntry has delete at level ${level}`);
//         if (level > 0) {
//           level = level - 1;
//           arrResult.keep = false;
//           arrResult.val =  `{{delete:${level}}}`;
//           console.log(`   returning has delete at level ${level}`);
//         }
//       }
//     }
//     return acc;
//   }, []);
//   console.log(`  reduced:  ${JSON.stringify(results)}`);
//   if (arrResult.keep) {
//     arrResult.val = results;
//   }
//   console.log(`  pruneArray returning:  ${JSON.stringify(arrResult)}`);
//   return arrResult;
// }
//
// export function pruneObject (obj) {
//   let output = {
//     keep: true,
//     val: val
//   };
//
// }

export function getPropertyValue (val){
  let output = val;

  if (typeof val === 'string') {
    if (hasDelete(val)) {
      output = getDeleteValue(val);
    }
  }
  console.log(`getPropertyValue:: returning: ${output}`);
  return output;
}

function getDeleteValue (val) {
  let output = val;
  let level = getLevel(val);
  if (level === 0) {
    output = undefined;
  } else {
    level = level - 1;
    output = `{{delete:${level}}}`;
  }
  return output;
}

// export function pruneProperty (val) {
//   // console.log(`pruneProperty:: val: ${val}`);
//   let output = {
//     keep: true,
//     val: val
//   };
//   if (typeof val === 'string') {
//     if (hasDelete(val)) {
//       output.keep = false;
//       let level = getLevel(val);
//       if (level === 0) {
//         delete output.val;
//       } else {
//         // level = level - 1;
//         output.val = `{{delete:${level}}}`;
//       }
//     }
//   }
//   console.log(`pruneProperty:: returning: ${JSON.stringify(output)}`);
//   return output;
// }
