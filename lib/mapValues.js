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

/**
 * Simply Map over the props of an object
 */
export function mapValues (obj, fn) {
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
