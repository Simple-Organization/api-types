import { dts } from 'rollup-plugin-dts';

const config = [
  //
  //  Build the project
  //

  {
    input: './dist/types/src/index.d.ts',
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    plugins: [dts()],
  },

  //
  //  Build the http-errors types
  //

  {
    input: './dist/types/src/http-errors.d.ts',
    output: [{ file: 'http-errors/index.d.ts', format: 'es' }],
    plugins: [dts()],
  },
];

export default config;
