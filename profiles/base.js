import buble from 'rollup-plugin-buble';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';

const pkg = require('../package.json');
const copyright = `/**
* ${pkg.name} - v${pkg.version} - ${new Date().toString()}
* Copyright (c) ${new Date().getFullYear()} Dave Bouwman / Esri
* ${pkg.license}
*/`;

export default {
  entry: 'lib/adlib.js',
  moduleName: 'adlib',
  format: 'umd',
  plugins: [
    nodeResolve({ main: true }),
    commonjs(),
    buble()
  ],
  banner: copyright
};
