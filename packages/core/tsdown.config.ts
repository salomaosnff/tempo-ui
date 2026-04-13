import { defineConfig } from 'tsdown'

const PATH_SEP = /[\\/]/g

export default defineConfig({
    entry: {
        index: './src/index.ts',
    },
    format: ['esm', 'cjs'],
    minify: true,
    clean: true,
    fromVite: true,
    tsconfig: 'tsconfig.app.json',
    dts: { vue: true, sourcemap: true },
    sourcemap: true,
    hash: false,
    outDir: 'dist',
    platform: 'neutral',
    inputOptions: {
        preserveEntrySignatures: 'allow-extension',
    },
    outputOptions: {
        minifyInternalExports: false,
        strictExecutionOrder: false,
        codeSplitting: {
            groups: [
                {
                    // Exclude d.ts files so they get bundled up
                    // Also not possible when using unbundle mode...
                    test: /(?<!\.d\.c?ts)$/,
                    name: (id: string) => {
                        const [namespace, file] = id.split('?')[0].split(PATH_SEP).slice(-2)
                        return (
                            file
                                ? namespace === 'src'
                                    ? file.slice(0, file.lastIndexOf('.'))
                                    : `${namespace}/${file.slice(0, file.lastIndexOf('.'))}`
                                : namespace
                        )
                    },
                },
            ],
        },
    },
})