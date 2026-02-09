import {fileURLToPath} from 'node:url'
import {mergeConfig, defineConfig, configDefaults} from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
    viteConfig,
    defineConfig({
        test: {
            environment: 'jsdom',
            exclude: [...configDefaults.exclude, 'e2e/**'],
            root: fileURLToPath(new URL('./', import.meta.url)),

            coverage: {
                reporter: ['text', 'lcov'],
                reportsDirectory: 'coverage',
                all: true,
                include: ['src/**/*.{js,ts,vue}'],
                exclude: [
                    '**/*.d.ts',
                    'src/main.ts',
                    'src/**/index.ts',
                    'src/router/**',
                    'src/assets/**',
                    'src/**/*.stories.*',
                ],
            }
        },
    }),
)
