/**
 * Simply Map over the props of an object
 */
export default function mapValues (obj, fn) {
  let keys = Object.keys(obj);
  // console.info(`keys: ${keys}`);
  var newObject = keys.reduce(function(acc, currentKey) {
    // console.log(`   acc: ${JSON.stringify(acc)} curKey: ${currentKey}`);
    acc[currentKey] = fn(obj[currentKey], currentKey, obj);
    return acc;
  }, {});
  // console.info(`  output: ${JSON.stringify(newObject)}`);
  return newObject;
}
