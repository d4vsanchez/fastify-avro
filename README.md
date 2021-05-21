# Fastify Avro

Plugin to provide [Avro](https://avro.apache.org/) support as a middleware for
[Fastify](https://github.com/fastify/fastify).

Simply register the `fastify-avro` plugin in your Fastify server and support Avro support for every request that
accepts the `application/x-avro` MIME type.

## Installation

Run this command in your project's root folder:

```bash
# In case you use NPM
npm install fastify-avro

# In case you use Yarn
yarn add fastify-avro
```

## Usage example

This would be the `server.js` file:

```javascript
const avsc = require('avsc')
const fastify = require('fastify')()

const AvroSchema = avsc.Type.forSchema({
  type: 'record',
  fields: [
    { name: 'kind', type: { type: 'enum', symbols: ['CAT', 'DOG'] } },
    { name: 'name', type: 'string' },
  ],
})

fastify.register(require('fastify-avro'), { schema: AvroSchema })

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
```

And you can consume this endpoint using Avro like this:

```bash
curl -H "Accept: application/x-avro" http://localhost:5000/animal
```

You can still continue having JSON responses if your `Accept` header is set to the JSON MIME type:

```bash
curl http://localhost:5000/animal
```

## Development

### Test

This project contains unit tests to make sure that the code works as expected. You can find the tests in the `tests`
folder.

The tests are using [mocha](https://github.com/mochajs/mocha) as the test framework.

You can execute the tests by running the following command:

```bash
npm run test
```

## License

Licensed under [MIT](/LICENSE)
