import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export async function foods(app: FastifyInstance) {
  app.addHook('onRequest', checkSessionIdExists)

  app.post('/', async (req, res) => {
    const createFoodsBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      isDiet: z.boolean(),
    })

    const { name, description, isDiet } = createFoodsBodySchema.parse(req.body)

    const sessionId = req.cookies.sessionId

    const data = {
      id: randomUUID(),
      name,
      description,
      isDiet,
      user_id: sessionId,
    }

    await knex('foods').insert(data)

    return res.status(201).send({ data })
  })

  app.get('/', async (req, res) => {
    const sessionId = req.cookies.sessionId

    const foods = await knex('foods').where('user_id', sessionId).select()

    return { foods }
  })

  app.get('/:id', async (req, res) => {
    const getIdFoodParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getIdFoodParamsSchema.parse(req.params)

    const sessionId = req.cookies.sessionId

    const food = await knex('foods').where({ user_id: sessionId, id }).select()

    return { food }
  })

  app.get('/metrics', async (req, res) => {
    const sessionId = req.cookies.sessionId

    const meals = await knex('foods').where({ user_id: sessionId })

    const metrics = {
      total: meals.length,
      diet: meals.filter((foods) => foods.isDiet).length,
      notDiet: meals.filter((foods) => !foods.isDiet).length,
    }

    return res.status(200).send({
      metrics,
    })
  })

  app.put('/:id', async (req, res) => {
    const getIdFoodParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const updateFoodBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      isDiet: z.boolean(),
    })

    const { name, description, isDiet } = updateFoodBodySchema.parse(req.body)
    const { id } = getIdFoodParamsSchema.parse(req.params)

    const sessionId = req.cookies.sessionId

    const foodExist = await knex('foods')
      .where({ user_id: sessionId, id })
      .first()

    if (!foodExist) {
      return res.status(404).send()
    }

    const data = {
      name,
      description,
      isDiet,
    }

    await knex('foods').where({ id, user_id: sessionId }).update(data)

    return res.code(200).send({ data })
  })

  app.delete('/:id', async (req, res) => {
    const getIdFoodParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getIdFoodParamsSchema.parse(req.params)

    const sessionId = req.cookies.sessionId

    const foodExist = await knex('foods')
      .where({ user_id: sessionId, id })
      .first()

    if (!foodExist) {
      return res.status(404).send()
    }

    await knex('foods').where({ user_id: sessionId, id }).delete()

    return res.status(200).send()
  })
}
