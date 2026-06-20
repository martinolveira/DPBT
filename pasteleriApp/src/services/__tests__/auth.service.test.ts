import { describe, it, expect } from 'vitest'
import { registerShop, loginUser } from '../auth.service'

describe('auth.service', () => {
  describe('registerShop', () => {
    it('creates shop and user, returns token', async () => {
      const result = await registerShop({
        shopNombre: 'La Dulce Tentación',
        slug: 'la-dulce-tentacion',
        email: 'maria@test.com',
        password: 'password123',
        nombre: 'María García',
      })
      expect(result.token).toBeDefined()
      expect(result.shop.slug).toBe('la-dulce-tentacion')
      expect(result.user.email).toBe('maria@test.com')
    })

    it('throws if slug already taken', async () => {
      await registerShop({ shopNombre: 'A', slug: 'dup', email: 'a@test.com', password: 'pass', nombre: 'A' })
      await expect(
        registerShop({ shopNombre: 'B', slug: 'dup', email: 'b@test.com', password: 'pass', nombre: 'B' })
      ).rejects.toThrow('slug already taken')
    })
  })

  describe('loginUser', () => {
    it('returns token for valid credentials', async () => {
      await registerShop({ shopNombre: 'T', slug: 'test', email: 'login@test.com', password: 'mypass', nombre: 'T' })
      const result = await loginUser('login@test.com', 'mypass')
      expect(result.token).toBeDefined()
    })

    it('throws for wrong password', async () => {
      await registerShop({ shopNombre: 'T', slug: 'test2', email: 'l2@test.com', password: 'correct', nombre: 'T' })
      await expect(loginUser('l2@test.com', 'wrong')).rejects.toThrow('Invalid credentials')
    })

    it('throws for unknown email', async () => {
      await expect(loginUser('ghost@test.com', 'pass')).rejects.toThrow('Invalid credentials')
    })
  })
})
