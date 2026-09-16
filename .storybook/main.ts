import type { StorybookConfig } from '@storybook/react-vite'
import { mergeConfig } from 'vite'
import { resolve } from 'path'

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-links',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  async viteFinal(config, { configType }) {
    return mergeConfig(config, {
      // The build uses a relative base on purpose. An absolute '/UI_UI/' was
      // correct for the GitHub Pages project site and nothing else: served from
      // any other path the preview iframe's script 404s, so the manager shell
      // renders while every story spins on "loading" forever. './' lets a single
      // build run from the domain root, from /UI_UI/, or from a local server.
      // The dev server keeps '/' — Vite resolves module URLs against an
      // absolute base there, and relative base breaks HMR on nested imports.
      base: configType === 'PRODUCTION' ? './' : '/',
      resolve: {
        alias: {
          '@': resolve(__dirname, '../src'),
        },
      },
    })
  },
}

export default config
