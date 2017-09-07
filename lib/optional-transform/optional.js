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

export default function optional(key, value, settings, level = 0) {
  let val = value;
  if (!value) {
    val = `{{delete:${level}}}`;
  }
  return val;
}
