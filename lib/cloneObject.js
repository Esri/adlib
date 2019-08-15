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
 * ```js
 * import { cloneObject } from "./cloneObject";
 * const original = { foo: "bar" }
 * const copy = cloneObject(original)
 * copy.foo // "bar"
 * copy === original // false
 * ```
 * Make a deep clone, including arrays. Does not handle functions!
 *
 * Copied from @esri/hub-common to avoid bringing along that package's
 * dependencies, @esri/hub-common should be made a dependency if more
 * functions are needed from it in the future
 */
export const cloneObject = function (obj) {
  let clone = {};
  // first check array
  if (Array.isArray(obj)) {
    clone = obj.map(cloneObject);
  } else if (typeof obj === "object") {
    for (const i in obj) {
      if (obj[i] != null && typeof obj[i] === "object") {
        clone[i] = cloneObject(obj[i]);
      } else {
        clone[i] = obj[i];
      }
    }
  } else {
    clone = obj;
  }
  return clone;
};
