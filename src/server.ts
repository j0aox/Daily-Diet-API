import fastify from 'fastify'

const app = fastify()

app.get('/test', () => {
  return 'Hello!'
})

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log('HTTP Server Running!')
  })
