import { createEffect, createRoot } from 'solid-js'
import useLanyard from './lanyard'

const solid = (fn: (done: () => void) => void) =>
  new Promise<void>((resolve) => {
    createRoot((dispose) => {
      fn(() => {
        dispose()
        resolve()
      })
    })
  })

describe('useLanyard', () => {
  const id = '94490510688792576'
  const ids = [id, '149491899240153088']

  jest.requireActual('whatwg-fetch')

  describe('rest api', () => {
    it('should return an accessor', async () => {
      await solid((done) => {
        const presence = useLanyard({ type: 'rest', id })
        expect(typeof presence).toBe('function')
        done()
      })
    })

    it('should fetch the presence and set it', async () => {
      await solid((done) => {
        const presence = useLanyard({ type: 'rest', id })

        let count = 0

        createEffect(() => {
          if (count == 0) {
            expect(presence()).toBeUndefined()
            count++
          } else {
            expect(presence()).toHaveProperty('activities')
            done()
          }
        })
      })
    })

    it('should refresh the presence', async () => {
      await solid((done) => {
        const { presence } = useLanyard({ type: 'rest', id, refreshInterval: 1000 })

        let count = 0

        createEffect(() => {
          if (count > 0) {
            expect(presence()).toHaveProperty('activities')
            if (count === 3) {
              done()
            }
          } else {
            presence()
          }

          count++
        })
      })
    })

    it('should be cancelable', async () => {
      await solid((done) => {
        const { cancel, presence } = useLanyard({ type: 'rest', id, refreshInterval: 1000 })

        let count = 0

        createEffect(() => {
          presence()
          count++

          if (count == 2) {
            cancel()
          }
        })

        setTimeout(() => {
          expect(count).toBe(2)
          done()
        }, 4000)
      })
    })
  })

  describe('socket api', () => {
    it('should return an accessor', async () => {
      await solid((done) => {
        const p1 = useLanyard(id)
        expect(typeof p1).toBe('function')

        const p2 = useLanyard({ type: 'socket', id })
        expect(typeof p2).toBe('function')

        done()
      })
    })

    it('should have the correct methods', async () => {
      await solid((done) => {
        const p1 = useLanyard(id)
        expect(typeof p1.presence).toBe('function')
        expect(typeof p1.close).toBe('function')
        expect(typeof p1.closed).toBe('function')

        const p2 = useLanyard({ type: 'socket', id })
        expect(typeof p2.presence).toBe('function')
        expect(typeof p2.close).toBe('function')
        expect(typeof p2.closed).toBe('function')

        const p3 = useLanyard({ type: 'socket', ids })
        expect(typeof p3.presence).toBe('function')
        expect(typeof p3.close).toBe('function')
        expect(typeof p3.closed).toBe('function')
        expect(typeof p3.latestUpdate).toBe('function')

        const p4 = useLanyard({ type: 'socket', all: true })
        expect(typeof p4.presence).toBe('function')
        expect(typeof p4.close).toBe('function')
        expect(typeof p4.closed).toBe('function')
        expect(typeof p4.latestUpdate).toBe('function')

        done()
      })
    })
  })
})
