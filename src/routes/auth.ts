import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import bcryptj from 'bcryptjs'

export async function authRoutes(app: FastifyInstance) {
  app.post('/', async (req, res) => {
    const createSessionBodySchema = z.object({
      email: z.string(),
      password: z.string(),
    })

    const { email, password } = createSessionBodySchema.parse(req.body)

    const user = await knex('users').where({ email }).first()

    if (!user) {
      return res.status(404).send()
    }

    const passwordMatch = bcryptj.compareSync(password, user.password)

    if (!passwordMatch) {
      return res.status(401).send()
    }

    const sessionId = user.id

    const oneHourInMilliseconds = 1000 * 60 * 60 // uma hora

    res.setCookie('sessionId', sessionId, {
      path: '/',
      maxAge: oneHourInMilliseconds,
      expires: new Date(Date.now() + 1000 * 60 * 60),
    })
  })
}
