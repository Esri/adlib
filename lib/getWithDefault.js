/**
 * Return the value of a deep property, using a path.
 */
export default function getWithDefault (obj, path, defaultValue = undefined) {
  return path
    .split('.')
    .reduce((o, p) => o ? o[p] : defaultValue, obj)
}
