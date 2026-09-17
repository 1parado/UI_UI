import type { Meta, StoryObj } from '@storybook/react'
import { Stepper, StepperItem } from './Stepper'

const meta: Meta<typeof Stepper> = {
  title: 'Components/Stepper',
  component: Stepper,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Stepper>

export const Default: Story = {
  render: () => (
    <Stepper current={1} className="w-[560px]">
      <StepperItem title="Account" description="Email and password" />
      <StepperItem title="Workspace" description="Name and region" />
      <StepperItem title="Invite" description="Bring the team in" />
    </Stepper>
  ),
}

export const AllComplete: Story = {
  render: () => (
    <Stepper current={3} className="w-[560px]">
      <StepperItem title="Account" description="Email and password" />
      <StepperItem title="Workspace" description="Name and region" />
      <StepperItem title="Invite" description="Bring the team in" />
    </Stepper>
  ),
}

/** Force a state on a single step — a failure the user has to go back and fix. */
export const WithError: Story = {
  render: () => (
    <Stepper current={2} className="w-[560px]">
      <StepperItem title="Account" description="Email and password" />
      <StepperItem title="Workspace" status="error" description="Region already taken" />
      <StepperItem title="Invite" description="Bring the team in" />
    </Stepper>
  ),
}

export const Vertical: Story = {
  render: () => (
    <Stepper current={1} orientation="vertical" className="w-[280px]">
      <StepperItem title="Connect repository" description="Grant read access" />
      <StepperItem title="Choose a branch" description="Default is main" />
      <StepperItem title="Run the first review" />
    </Stepper>
  ),
}
