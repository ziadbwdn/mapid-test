import { describe, it, expect } from 'vitest'
import AppError from '../../../src/utils/AppError'

describe('AppError', () => {
  it('creates error with correct statusCode, code, message', () => {
    const err = new AppError(404, 'NOT_FOUND', 'Resource tidak ditemukan')
    expect(err.statusCode).toBe(404)
    expect(err.code).toBe('NOT_FOUND')
    expect(err.message).toBe('Resource tidak ditemukan')
    expect(err.isOperational).toBe(true)
  })

  it('creates error with 500 status code', () => {
    const err = new AppError(500, 'INTERNAL_ERROR', 'Server error')
    expect(err.statusCode).toBe(500)
    expect(err.code).toBe('INTERNAL_ERROR')
    expect(err.isOperational).toBe(true)
  })

  it('is instance of Error', () => {
    const err = new AppError(400, 'BAD_REQUEST', 'Bad request')
    expect(err).toBeInstanceOf(Error)
    expect(err).toBeInstanceOf(AppError)
  })
})
