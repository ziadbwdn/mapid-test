import '@testing-library/jest-dom'

class MockIntersectionObserver {
  observe = () => null
  unobserve = () => null
  disconnect = () => null
}
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: MockIntersectionObserver
})

class MockResizeObserver {
  observe = () => null
  unobserve = () => null
  disconnect = () => null
}
Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: MockResizeObserver
})

Object.defineProperty(URL, 'createObjectURL', {
  writable: true,
  value: () => ''
})
