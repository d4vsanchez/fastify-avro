'use strict'

const fs = require('fs')
const avsc = require('avsc')
const path = require('path')
const assert = require('assert')
const fastify = require('fastify')
const fastifyAvro = require('../')

function createServerEndpoints(server) {
  server.get('/encode', (req, reply) => {
    reply.send(catPayload)
  })

  server.post('/decode', (req, reply) => {
    const { body } = req
    reply.send({ ...body, name: `${body.name} (Modified)` })
  })
}

describe('FastifyAvro', () => {
  describe('Using Schema file', () => {
    const server = fastify()
    const catPayload = { kind: 'CAT', name: 'Manson' }

    const schema = fs.readFileSync(path.join(__dirname, 'schema', 'CatDog.avpr'), 'utf-8')
    const FileCatDogSchema = avsc.Type.forSchema(avsc.readSchema(schema))

    server.register(fastifyAvro, { schemaFile: path.join(__dirname, 'schema', 'CatDog.avpr') })

    createServerEndpoints(server)

    it('should return an encoded response', () => {
      server.inject(
        {
          method: 'GET',
          url: '/encode',
          payload: {},
          headers: {
            accept: 'application/x-avro',
          },
        },
        (err, res) => {
          assert.strictEqual(err, null)
          assert.strictEqual(res.headers['content-type'], 'application/x-avro')
          assert.strictEqual(res.payload, FileCatDogSchema.toBuffer(catPayload).toString())
        }
      )
    })

    it('should decode and manipulate the data', () => {
      const payload = FileCatDogSchema.toBuffer(catPayload)
      const modifiedPayload = { kind: 'CAT', name: 'Manson (Modified)' }

      server.inject(
        {
          method: 'POST',
          url: '/decode',
          payload,
          headers: {
            accept: 'application/x-avro',
            'content-type': 'application/x-avro',
          },
        },
        (err, res) => {
          assert.strictEqual(err, null)
          assert.strictEqual(res.headers['content-type'], 'application/x-avro')
          assert.strictEqual(res.payload, FileCatDogSchema.toBuffer(modifiedPayload).toString())
        }
      )
    })
  })

  describe('Using JSON Schema', () => {
    const server = fastify()
    const catPayload = { kind: 'CAT', name: 'Manson' }

    const JSONCatDogSchema = avsc.Type.forSchema({
      type: 'record',
      fields: [
        { name: 'kind', type: 'string' },
        { name: 'name', type: 'string' },
      ],
    })

    server.register(fastifyAvro, { schema: JSONCatDogSchema })
    createServerEndpoints(server)

    it('should return an encoded response', () => {
      server.inject(
        {
          method: 'GET',
          url: '/encode',
          payload: {},
          headers: {
            accept: 'application/x-avro',
          },
        },
        (err, res) => {
          assert.strictEqual(err, null)
          assert.strictEqual(res.headers['content-type'], 'application/x-avro')
          assert.strictEqual(res.payload, JSONCatDogSchema.toBuffer(catPayload).toString())
        }
      )
    })

    it('should decode and manipulate the data', () => {
      const payload = JSONCatDogSchema.toBuffer(catPayload)
      const modifiedPayload = { kind: 'CAT', name: 'Manson (Modified)' }

      server.inject(
        {
          method: 'POST',
          url: '/decode',
          payload,
          headers: {
            accept: 'application/x-avro',
            'content-type': 'application/x-avro',
          },
        },
        (err, res) => {
          assert.strictEqual(err, null)
          assert.strictEqual(res.headers['content-type'], 'application/x-avro')
          assert.strictEqual(res.payload, JSONCatDogSchema.toBuffer(modifiedPayload).toString())
        }
      )
    })
  })
})
