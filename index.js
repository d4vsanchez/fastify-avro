'use strict'

const fs = require('fs')
const avsc = require('avsc')
const fp = require('fastify-plugin')

const AVRO_MIME_TYPE_REGEX = /^application\/(.*-)?avro$/

function loadIdl(schemaUrl) {
  const content = fs.readFileSync(schemaUrl, 'utf-8')
  return avsc.readSchema(content)
}

function fastifyAvro(fastify, options, next) {
  const { schemaFile, schema } = options
  const schemaContent = schemaFile ? loadIdl(schemaFile) : schema
  const avroSchema = avsc.Type.forSchema(schemaContent)

  fastify.register(require('fastify-accepts-serializer'), {
    serializers: [
      {
        regex: AVRO_MIME_TYPE_REGEX,
        serializer: (body) => avroSchema.toBuffer(body),
      },
    ],
    default: 'application/json',
  })

  fastify.addContentTypeParser(AVRO_MIME_TYPE_REGEX, { parseAs: 'buffer' }, (req, body, done) => {
    try {
      const res = avroSchema.fromBuffer(body)
      done(null, res)
    } catch (err) {
      done(err)
    }
  })

  next()
}

module.exports = fp(fastifyAvro, { fastify: '3.x', name: 'fastify-avro' })
