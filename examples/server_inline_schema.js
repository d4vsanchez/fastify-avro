const avsc = require('avsc')
const fastify = require('fastify')({ logger: true })

const AvroSchema = avsc.Type.forSchema({
  type: 'record',
  fields: [
    { name: 'kind', type: 'string' },
    { name: 'name', type: 'string' },
  ],
})

fastify.register(require('../'), { schema: AvroSchema })

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
