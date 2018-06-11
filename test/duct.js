/**
 * Simple helper that will initiatize esm and execute the tape tests
 * directly against the ES6 soruce
 */

require = require("esm")(module);

// add tape modules here
require('./getWithDefault.tape')
require('./mapvalues.tape')
require('./arborist.tape')
require('./adlib.tape')
// require('./deepmap.tape')
