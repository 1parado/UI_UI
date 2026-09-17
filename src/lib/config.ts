export type ConfigSize = 'sm' | 'md' | 'lg'
export type ConfigTheme = 'light' | 'dark' | 'system'

/**
 * The strings a screen otherwise re-invents.
 *
 * Deliberately broader than "no data": the shuttle controls, the guided tour
 * and the clear buttons all need words, and every screen that draws them from
 * somewhere different is a screen that cannot be translated.
 */
export interface LocaleMessages {
  empty: string
  noResults: string
  loading: string
  search: string
  clear: string
  selectAll: string
  moveToTarget: string
  moveToSource: string
  next: string
  previous: string
  finish: string
  close: string
  cancel: string
  confirm: string
  save: string
  remove: string
  add: string
  copy: string
  copied: string
  signHere: string
  crop: string
  rotate: string
  zoom: string
  reset: string
  /** `"3 more"` / `"还有 3 项"` — the "+N" a clipped list shows. */
  more: (count: number) => string
}

export const enUS: LocaleMessages = {
  empty: 'Nothing here yet',
  noResults: 'No matches',
  loading: 'Loading…',
  search: 'Search…',
  clear: 'Clear',
  selectAll: 'Select all',
  moveToTarget: 'Move to target',
  moveToSource: 'Move to source',
  next: 'Next',
  previous: 'Back',
  finish: 'Finish',
  close: 'Close',
  cancel: 'Cancel',
  confirm: 'Confirm',
  save: 'Save',
  remove: 'Remove',
  add: 'Add',
  copy: 'Copy',
  copied: 'Copied',
  signHere: 'Sign here',
  crop: 'Crop',
  rotate: 'Rotate',
  zoom: 'Zoom',
  reset: 'Reset',
  more: (count) => `${count} more`,
}

export const zhCN: LocaleMessages = {
  empty: '暂无数据',
  noResults: '没有匹配项',
  loading: '加载中…',
  search: '搜索…',
  clear: '清除',
  selectAll: '全选',
  moveToTarget: '移到右侧',
  moveToSource: '移到左侧',
  next: '下一步',
  previous: '上一步',
  finish: '完成',
  close: '关闭',
  cancel: '取消',
  confirm: '确认',
  save: '保存',
  remove: '移除',
  add: '添加',
  copy: '复制',
  copied: '已复制',
  signHere: '在此签名',
  crop: '裁剪',
  rotate: '旋转',
  zoom: '缩放',
  reset: '重置',
  more: (count) => `还有 ${count} 项`,
}

/** One-word alias for the same dictionary. */
export const zh_CN = zhCN

/**
 * Merge a partial locale over a parent one.
 *
 * Every key stays owned by whichever provider set it last, so nesting a
 * provider that only wants to change `search` does not quietly drop the rest
 * of the app's translations.
 */
export function mergeLocale(
  base: LocaleMessages,
  overrides: Partial<LocaleMessages> | undefined
): LocaleMessages {
  if (!overrides) return base
  return { ...base, ...overrides }
}
