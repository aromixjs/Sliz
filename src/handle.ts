import Stream from "stream";

export function handleActiveSocket(socket: Stream.Duplex, head: Buffer) {


socket.on('data',(chunk)=>{
   console.log(chunk);

socket.push('data')
   
})



socket.on('close',()=>{
   console.log('closed');
   
})

socket.on('error',(e)=>{

console.log(e);


})






}