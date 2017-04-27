import config from './base';
import uglify from 'rollup-plugin-uglify';
import filesize from 'rollup-plugin-filesize';

config.dest = 'dist/adlib.min.js';
config.sourceMapFile = 'dist/adlib.js';
config.sourceMap = 'dist/adlib.min.js.map';

// use a Regex to preserve copyright text
config.plugins.push(uglify(), filesize());

export default config;
