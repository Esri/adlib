import config from './base';
import { uglify } from 'rollup-plugin-uglify';
import filesize from 'rollup-plugin-filesize';

config.output.file = 'dist/adlib.min.js';
config.output.sourceMapFile = 'dist/adlib.js';
config.output.sourceMap = 'dist/adlib.min.js.map';

// use a Regex to preserve copyright text
config.plugins.push(filesize());
config.plugins.push(uglify());

export default config;
