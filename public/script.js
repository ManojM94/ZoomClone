const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {
  host: '/',
  port: '3001'
})
const myVideo = document.createElement('video')
myVideo.muted = true
const peers = {}
myPeer.on('open', id => {

navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
    socket.on('user-connected', userId => {
        connectToNewUser(userId, stream)
      })
      socket.on('user-disconnected', userId => {
        if (peers[userId]) peers[userId].close()
      })
  addVideoStream(myVideo, stream)
})


myPeer.on('call', call => {
    console.log("answering")
    peers[call.peer] = call
    navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      }).then(stream => {
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        console.log("streaming")
      addVideoStream(video, userVideoStream)
    })
    call.on('close', () => {
        video.remove()
      })
})
  })


socket.emit('join-room', ROOM_ID, id)
})


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
function connectToNewUser(userId, stream) {
    console.log(userId)
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    console.log("streaming")
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call
}

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}