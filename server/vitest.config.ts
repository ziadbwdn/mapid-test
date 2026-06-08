import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
      include: ['test/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/types/**', 'src/migrations/**'],
      thresholds: {
        statements: 40,
        branches: 20,
        functions: 30,
        lines: 40
      }
    }
  }
})
