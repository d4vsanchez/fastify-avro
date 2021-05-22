const http = require('http')
const avsc = require('avsc')

const schema = avsc.Type.forSchema({
  type: 'record',
  fields: [
    { name: 'kind', type: 'string' },
    { name: 'name', type: 'string' },
  ],
})

let data = []

const options = {
  hostname: 'localhost',
  port: 3000,
  headers: {
    Accept: 'application/x-avro',
  },
  method: 'GET',
  path: '/animal',
}

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`)
  console.log(`Response content-type header: ${res.headers['content-type']}\n`)
  console.log('Connection started')

  res.on('data', (chunk) => {
    data.push(chunk)
  })

  res.on('end', () => {
    const result = Buffer.concat(data)
    const decodedData = schema.decode(result)
    const stringDecodedData = JSON.stringify(decodedData)

    console.log(`Received bytes: ${result.length}`)
    console.log(`Decoded data: ${stringDecodedData}`)
    console.log(`Decoded data size: ${stringDecodedData.length}`)

    console.log('\n\nConnection closed')
  })
})

req.end()
