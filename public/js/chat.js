const socket = io()

// Elements
const $messageForm = document.getElementById('msg-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.getElementById('send-location')
const $messages = document.getElementById('messages')

// Templates
const messageTemplate = document.getElementById('msg-template').innerHTML
const locationTemplate = document.getElementById('location-msg-template').innerHTML
const sidebarTemplate = document.getElementById('sidebar-template').innerHTML

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

// Autoscroll
const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }    
}

//recieve message
socket.on('message', (message) => {
    // console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('H:mm')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

//recieve location
socket.on('locationMessage', ({username, url, createdAt}) => {
    // console.log(url)
    const html = Mustache.render(locationTemplate, {
        username,
        url,
        createdAt: moment(createdAt).format('H:mm')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

// update room users list
socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.getElementById('sidebar').innerHTML = html
})
//send message
$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    $messageFormButton.setAttribute('disabled', 'disabled')
    const message = e.target.elements.message.value
    socket.emit('spreadMessage', message, (error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if (error) {
            return console.log(error)
        }
        // console.log('Message delivered!')
    })
})

//send location
$sendLocationButton.addEventListener('click', (e) => {
    if (!navigator.geolocation) {
        return alert('Gelocation is not supported by your browser')
    }
    $sendLocationButton.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position) => {
        const {latitude, longitude} = position.coords
        socket.emit('sendLocation', {latitude, longitude}, () => {
            $sendLocationButton.removeAttribute('disabled')
            // console.log('Location shared!')
        })

    })
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = "/"
    }
})