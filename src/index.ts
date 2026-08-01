import uWS from 'uWebSockets.js'







const app = uWS.App()

app.post('/sa',(res,req)=>{

})

app.ws('/ws', {
  maxPayloadLength: 16 * 1024,
  idleTimeout: 30,

  open: (ws) => {
    console.log('Client connected!')
    ws.subscribe('global-room')

  },

  message: (ws, message, isBinary) => {

    const view = new DataView(message)

    
    const payload = Buffer.from(message).toString('utf-8')

    app.publish('global-room', JSON.stringify({
      type: 'PATCH',
      html: `<div>Updated: ${payload}</div>`
    }))
  },

  close: (ws) => {
    console.log('Client disconnected')
  }
})

app.listen(3000, (token) => {
  if (token) {
    console.log('Server running on http://localhost:3000')
    console.log('WebSocket running on ws://localhost:3000/ws')
  }
})