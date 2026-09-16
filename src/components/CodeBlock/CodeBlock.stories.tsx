import type { Meta, StoryObj } from '@storybook/react'
import { CodeBlock } from './CodeBlock'

const meta: Meta<typeof CodeBlock> = {
  title: 'Components/CodeBlock',
  component: CodeBlock,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-[44rem] max-w-full">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof CodeBlock>

export const TypeScript: Story = {
  args: {
    language: 'ts',
    code: `export function retryOnce<T>(run: () => Promise<T>) {
  return run().catch(async (error) => {
    if (!isUnauthorized(error)) throw error
    await refreshToken()
    return run()
  })
}`,
  },
}

export const Shell: Story = {
  args: {
    language: 'bash',
    code: `pnpm install
pnpm typecheck && pnpm lint && pnpm test
git push origin main`,
  },
}

export const NoLanguage: Story = {
  args: {
    code: `Plain output keeps the header for the copy action:
12:04:11  build started
12:04:29  build finished in 18.4s`,
  },
}

export const LongLines: Story = {
  args: {
    language: 'json',
    code: `{
  "model": "gpt-5",
  "messages": [{ "role": "system", "content": "You are a precise code reviewer. Cite the exact lines you change and never rewrite a file you have not read." }],
  "response_format": { "type": "json_schema", "json_schema": { "name": "review", "strict": true } }
}`,
  },
}
