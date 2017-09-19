import config from './base';
import filesize from 'rollup-plugin-filesize';

config.dest = 'dist/adlib.js';
config.sourceMap = 'dist/adlib.js.map';
config.plugins.push(filesize());

export default config;
