import vuePlugin from 'rollup-plugin-vue';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import nodeGlobals from 'rollup-plugin-node-globals';

export default [
  {
    input: 'assets/js/src/main.js',
    output: {
      file: 'assets/js/dist/main.js',
      format: 'iife',
    },
    global: {
      Vue: 'Vue',
    },
    external: ['Vue'],

    plugins: [
      commonjs(),
      resolve(),
      vuePlugin(),
      nodeGlobals(),
    ],
  },
];
