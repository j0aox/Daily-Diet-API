import fastify from 'fastify'
import coockie from '@fastify/cookie'
import { env } from './env'
import { usersRoutes } from './routes/users'
import { authRoutes } from './routes/auth'
import { foods } from './routes/foods'

const app = fastify()

app.register(coockie)

app.register(authRoutes, {
  prefix: 'auth',
})

app.register(foods, {
  prefix: 'foods',
})

app.register(usersRoutes, {
  prefix: 'user',
})

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log('HTTP Server Running!')
  })
