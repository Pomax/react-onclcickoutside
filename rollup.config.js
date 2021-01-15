import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';
import pkg from './package.json';

const mergeAll = objs => Object.assign({}, ...objs);

const commonPlugins = [
  babel({
    exclude: 'node_modules/**',
  }),
];

const configBase = {
  input: 'src/index.js',
  external: Object.keys(pkg.dependencies || {}).concat(Object.keys(pkg.peerDependencies || {})),
  plugins: commonPlugins,
};

const devUmdConfig = mergeAll([
  configBase,
  {
    output: {
      file: pkg.unpkg.replace(/\.min\.js$/, '.js'),
      format: 'umd',
      name: 'onClickOutside',
      exports: 'named',
    },
    globals: { react: 'React', 'react-dom': 'ReactDOM' },
    external: Object.keys(pkg.peerDependencies || {}),
  },
]);

const prodUmdConfig = mergeAll([
  devUmdConfig,
  { output: mergeAll([devUmdConfig.output, { file: pkg.unpkg }]) },
  {
    plugins: devUmdConfig.plugins.concat(
      uglify({
        compress: {
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true          
        },
      })
    ),
  },
]);

const webConfig = mergeAll([
  configBase,
  {
    output: [
      { file: pkg.module, format: 'es' },
      { file: pkg.main, format: 'cjs', exports: 'named' }
    ],
  },
]);

export default [devUmdConfig, prodUmdConfig, webConfig];
