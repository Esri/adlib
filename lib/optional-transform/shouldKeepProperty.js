/**
 * Should keep a property
 *
 * If the value is like {{delete:NNN}}, then we don't want to keep it
 * and if NNN === 0, this is the end of the pruning chain. Else we decrement
 * and return that value
 */
export default function shouldKeepProperty(val, key) {
  let output = {
    keep: true,
    val: val
  };
 if (val && val.indexOf('delete') > -1) {
   output.keep = false;
   // we need to delete something
   let level = parseInt(val.replace(/{|}/g, '').split(':')[1]);
   if (level === 0) {
     delete output.val;
   } else {
     level = level - 1;
     output.val = `{{delete:${level}}}`;
   }
 }
 return output;
}
