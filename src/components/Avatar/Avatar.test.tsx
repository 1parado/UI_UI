import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Avatar, AvatarImage, AvatarFallback } from './Avatar'

describe('Avatar', () => {
  it('shows the fallback when no image is provided', () => {
    render(
      <Avatar>
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
    )
    expect(screen.getByText('AB')).toBeInTheDocument()
  })

  it('shows the fallback when the image fails to load', () => {
    render(
      <Avatar>
        <AvatarImage src="https://example.com/broken.png" alt="Broken" />
        <AvatarFallback>BF</AvatarFallback>
      </Avatar>
    )

    expect(screen.getByText('BF')).toBeInTheDocument()

    fireEvent.error(screen.getByRole('img'))

    expect(screen.getByText('BF')).toBeInTheDocument()
  })

  it('hides the fallback once the image loads', () => {
    render(
      <Avatar>
        <AvatarImage src="https://example.com/avatar.png" alt="User" />
        <AvatarFallback>UF</AvatarFallback>
      </Avatar>
    )

    fireEvent.load(screen.getByRole('img'))

    expect(screen.queryByText('UF')).not.toBeInTheDocument()
    expect(screen.getByRole('img')).toHaveAttribute(
      'src',
      'https://example.com/avatar.png'
    )
  })
})
