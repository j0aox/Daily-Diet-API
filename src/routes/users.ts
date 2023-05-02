import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import bcryptj from 'bcryptjs'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', async (req, res) => {
    const createUserBodySchema = z.object({
      name: z.string(),
      email: z.string(),
      password: z.string(),
    })

    const { name, email, password } = createUserBodySchema.parse(req.body)

    const userExist = await knex('users').where('email', email).first()

    console.log(userExist)

    if (userExist) {
      return res.status(409).send({
        error: 'User already exists',
      })
    }

    function hashPassword(password: string): string {
      const salt = bcryptj.genSaltSync(10)

      return bcryptj.hashSync(password, salt)
    }

    await knex('users').insert({
      id: randomUUID(),
      name,
      email,
      password: hashPassword(password),
    })

    return res.status(201).send()
  })

  app.get('/', async (req, res) => {
    const users = await knex('users').select()

    return { users }
  })

  app.get('/:id', async (req) => {
    const getUserParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getUserParamsSchema.parse(req.params)

    const user = await knex('users').where('id', id).first()

    return { user }
  })
}
