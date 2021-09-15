import typescript from 'rollup-plugin-typescript2'
import pkg from './package.json'

const deps = Object.keys({...pkg.dependencies, ...pkg.peerDependencies})
const reExternal = new RegExp(`^(${deps.join('|')})($|/)`)

export default [
  {
    input: pkg.source,
    output: [
      {
        file: pkg.main,
        format: 'cjs',
      },
      {
        file: pkg.module,
        format: 'esm',
      },
    ],
    plugins: [
      typescript({
        tsconfigOverride: {
          include: ['**/*'],
          exclude: ['**/*.spec.*', '**/__tests__'],
          compilerOptions: {target: 'ES6'},
        },
      }),
    ],
    external: (id) => (deps.length ? reExternal.test(id) : false),
  },
]
