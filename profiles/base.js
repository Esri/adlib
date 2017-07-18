import buble from 'rollup-plugin-buble';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';

const pkg = require('../package.json');
const copyright = `/**
* ${pkg.name} - v${pkg.version} - ${new Date().toString()}
* Copyright (c) ${new Date().getFullYear()} ${pkg.author.name} / Esri
* ${pkg.license}
*/`;

export default {
  entry: `lib/${pkg.name}.js`,
  moduleName: pkg.name,
  format: 'umd',
  plugins: [
    nodeResolve({ main: true }),
    commonjs(),
    buble()
  ],
  banner: copyright
};
