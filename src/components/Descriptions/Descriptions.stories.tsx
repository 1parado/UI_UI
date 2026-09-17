import type { Meta, StoryObj } from '@storybook/react'
import { Descriptions, DescriptionsItem } from './Descriptions'
import { Badge } from '@/components/Badge'

const meta: Meta<typeof Descriptions> = {
  title: 'Components/Descriptions',
  component: Descriptions,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Descriptions>

export const Default: Story = {
  render: () => (
    <Descriptions className="w-[320px]">
      <DescriptionsItem label="Status">Running</DescriptionsItem>
      <DescriptionsItem label="Region">ap-guangzhou</DescriptionsItem>
      <DescriptionsItem label="Created">2026-09-17 09:41</DescriptionsItem>
    </Descriptions>
  ),
}

export const TwoColumns: Story = {
  render: () => (
    <Descriptions columns={2} className="w-[520px]">
      <DescriptionsItem label="Model">claude-sonnet-4</DescriptionsItem>
      <DescriptionsItem label="Context">200k tokens</DescriptionsItem>
      <DescriptionsItem label="Input">1,204</DescriptionsItem>
      <DescriptionsItem label="Output">8,930</DescriptionsItem>
      <DescriptionsItem label="Request id" span>
        req_01HZX9K2M4
      </DescriptionsItem>
    </Descriptions>
  ),
}

/** Labels on the left read like a spec sheet rather than a form. */
export const Horizontal: Story = {
  render: () => (
    <Descriptions orientation="horizontal" className="w-[380px]">
      <DescriptionsItem label="Plan">Team</DescriptionsItem>
      <DescriptionsItem label="Seats">12 of 20</DescriptionsItem>
      <DescriptionsItem label="Billing">Monthly</DescriptionsItem>
    </Descriptions>
  ),
}

/** Any node works as a value. */
export const RichValues: Story = {
  render: () => (
    <Descriptions orientation="horizontal" columns={2} className="w-[560px]">
      <DescriptionsItem label="Status">
        <Badge variant="success">Healthy</Badge>
      </DescriptionsItem>
      <DescriptionsItem label="Latency">184 ms</DescriptionsItem>
      <DescriptionsItem label="Endpoint" span>
        <span className="font-mono text-xs">https://api.paradox.dev/v1/messages</span>
      </DescriptionsItem>
    </Descriptions>
  ),
}
