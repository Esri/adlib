import config from './base';
import filesize from 'rollup-plugin-filesize';

config.output.file = 'dist/adlib.js';
config.output.sourceMap = 'dist/adlib.js.map';
config.plugins.push(filesize());

export default config;
