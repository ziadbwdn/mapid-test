import { describe, it, expect } from 'vitest'
import {
  formatCurrency,
  formatNumber,
  formatCompactCurrency,
  formatPercent,
  formatDate
} from '@/utils/formatters'

describe('formatCurrency', () => {
  it('formats positive number with $', () => {
    expect(formatCurrency(1234.5)).toBe('$1,234.50')
  })

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0.00')
  })
})

describe('formatNumber', () => {
  it('formats with thousand separators', () => {
    expect(formatNumber(1500)).toBe('1,500')
  })

  it('formats zero', () => {
    expect(formatNumber(0)).toBe('0')
  })
})

describe('formatCompactCurrency', () => {
  it('formats millions as $XM', () => {
    expect(formatCompactCurrency(2500000)).toBe('$2.5M')
  })

  it('formats thousands as $XK', () => {
    expect(formatCompactCurrency(3500)).toBe('$3.5K')
  })

  it('formats small values as currency', () => {
    expect(formatCompactCurrency(500)).toBe('$500.00')
  })

  it('handles zero', () => {
    expect(formatCompactCurrency(0)).toBe('$0.00')
  })
})

describe('formatPercent', () => {
  it('formats with one decimal', () => {
    expect(formatPercent(75.3)).toBe('75.3%')
  })

  it('formats zero', () => {
    expect(formatPercent(0)).toBe('0.0%')
  })
})

describe('formatDate', () => {
  it('formats date string', () => {
    const result = formatDate('2024-06-01')
    expect(result).toContain('Jun')
    expect(result).toContain('1')
    expect(result).toContain('2024')
  })

  it('returns dash for empty string', () => {
    expect(formatDate('')).toBe('-')
  })
})
