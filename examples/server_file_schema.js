const path = require('path')
const avsc = require('avsc')
const fastify = require('fastify')({ logger: true })

fastify.register(require('../'), { schemaFile: path.join(__dirname, 'schema', 'CatDog.avpr') })

fastify.get('/animal', function (request, reply) {
  reply.send({ kind: 'DOG', name: 'Falcor' })
})

fastify.post('/animal', function (request, reply) {
  const { body } = request
  reply.send({ ...body, name: `${body.name} (Modified)` })
})

fastify.listen(3000, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  fastify.log.info(`Server running on: ${address}`)
})
