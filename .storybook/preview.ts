import * as React from 'react'
import type { Preview } from '@storybook/react'
import '../src/styles/globals.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'centered',
  },
  globalTypes: {
    theme: {
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: ['light', 'dark'],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme as string
      const root = document.documentElement
      root.classList.toggle('dark', theme === 'dark')
      // NOTE: no JSX here — this file is `.ts`, and esbuild only enables JSX
      // for `.tsx`/`.jsx`, so `<Story />` would break `storybook build`.
      return React.createElement(Story)
    },
  ],
}

export default preview
