/**
 * Words for the common empty states.
 *
 * Kept separate from the illustration so a caller can take the picture
 * without the copy — and so the copy can be tested without rendering.
 */

export type EmptyPreset =
  | 'inbox'
  | 'search'
  | 'error'
  | 'folder'
  | 'image'
  | 'cart'
  | 'chat'
  | 'notification'

export interface EmptyCopy {
  title: string
  description: string
}

export const emptyPresets: Record<EmptyPreset, EmptyCopy> = {
  inbox: {
    title: 'Nothing here yet',
    description: 'When something arrives it will show up here.',
  },
  search: {
    title: 'No matches',
    description: 'Try a different word, or check the spelling.',
  },
  error: {
    title: 'Something went wrong',
    description: 'This could not be loaded. Try again in a moment.',
  },
  folder: {
    title: 'This folder is empty',
    description: 'Add a file to get started.',
  },
  image: {
    title: 'No images',
    description: 'Upload a picture and it will appear here.',
  },
  cart: {
    title: 'Your cart is empty',
    description: 'Add something you like and it will show up here.',
  },
  chat: {
    title: 'No messages',
    description: 'Say hello — the conversation starts with you.',
  },
  notification: {
    title: 'You are all caught up',
    description: 'New notifications will appear here.',
  },
}

/** The preset's copy, with any part of it replaced. */
export function emptyCopy(
  preset: EmptyPreset,
  overrides: Partial<EmptyCopy> = {}
): EmptyCopy {
  return { ...emptyPresets[preset], ...overrides }
}
