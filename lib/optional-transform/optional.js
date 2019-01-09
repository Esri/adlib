/*   Copyright (c) 2017-2019 Esri Inc.
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
 * Optional Transform
 * Supports a declarative syntax for optional template properties
 *
 * {{some.object.key:optional:2}}
 *
 * In this example, if defined, the value of `some.object.key` is used.
 * If not defined, then the optional transform is utilized
 * and a post-processing step is executed which will remove two parent levels
 * from the output structure
 */

export function optionalTransform(key, value, settings, level = 0) {
  // console.log(`optional: ${key}, ${value}, ${level}`);
  let val = value;
  if (!value) {
    val = `{{delete:${level}}}`;
  }
  return val;
}
