const http = require('http')
const avsc = require('avsc')

const schema = avsc.Type.forSchema({
  type: 'record',
  fields: [
    { name: 'kind', type: 'string' },
    { name: 'name', type: 'string' },
  ],
})

let data = ''
const postData = { kind: 'CAT', name: 'Manson' }
const encodedPostData = schema.toBuffer(postData)

const options = {
  hostname: 'localhost',
  port: 3000,
  headers: {
    Accept: 'application/x-avro',
    'Content-Type': 'application/x-avro',
  },
  method: 'POST',
  path: '/animal',
}

const req = http.request(options, (res) => {
  res.setEncoding('utf-8')
  console.log(`Status: ${res.statusCode}`)
  console.log(`Response content-type header: ${res.headers['content-type']}\n`)
  console.log('Connection started')

  res.on('data', (chunk) => {
    data += chunk
  })

  res.on('end', () => {
    const result = Buffer.from(data)
    const decodedData = schema.decode(result)
    const stringDecodedData = JSON.stringify(decodedData)

    console.log(`Received bytes: ${result.length}`)
    console.log(`Decoded data: ${stringDecodedData}`)
    console.log(`Decoded data size: ${stringDecodedData.length}`)

    console.log('\n\nConnection closed')
  })
})

req.write(encodedPostData)
req.end()
