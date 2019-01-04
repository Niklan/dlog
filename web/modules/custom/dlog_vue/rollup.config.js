import vuePlugin from 'rollup-plugin-vue';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import nodeGlobals from 'rollup-plugin-node-globals';

export default {
  input: 'assets/js/src/main.js',
  external: ['vue'],
  output: {
    file: 'assets/js/dist/main.js',
    format: 'iife',
    globals: {
      vue: 'Vue',
    },
  },
  plugins: [
    commonjs(),
    resolve(),
    vuePlugin(),
    nodeGlobals(),
  ],
};
