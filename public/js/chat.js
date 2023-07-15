const socket = io();

//Elements
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector("#messages");
const $sidebar = document.querySelector("#sidebar");

//Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-message-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

//Options
// console.log("QS - ", Qs.parse(location.search, {ignoreQueryPrefix: true}))
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

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

    // if (containerHeight - newMessageHeight <= scrollOffset + scrolledToTheBottomZone) {
    //     $messages.scrollTop = $messages.scrollHeight
    // }

    if(Math.round(containerHeight - newMessageHeight - 1) <= Math.round(scrollOffset)){
        messages.scrollTop = messages.scrollHeight;
    }
}

socket.on("locationMessage", (message) => {
    console.log(message);

    const html = Mustache.render(locationTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format("h:mm a")
    });
    $messages.insertAdjacentHTML("beforeend", html);

    autoscroll();
})

socket.on("message", (message) => {//Listen from server
    console.log(message);

    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format("h:mm a")
    });
    $messages.insertAdjacentHTML("beforeend", html);

    autoscroll();
})

socket.on("roomData", ({ room, users }) => {
    console.log("Room - ", room);
    console.log("Users - ", users);

    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    });
    $sidebar.innerHTML = html;
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    $messageFormButton.setAttribute('disabled', 'disabled');

    const message = e.target.elements.message.value;
    // if(message){
    socket.emit("sendMessage", message, (error) => {
        $messageFormButton.removeAttribute('disabled');

        $messageFormInput.value = '';
        $messageFormInput.focus();

        if (error) {
            return console.log(error);
        }

        console.log("Message has been delivered!");
    }); //Send event to server 
    // }
})

$sendLocationButton.addEventListener('click', (e) => {
    e.preventDefault();
    if (!navigator.geolocation) {
        return console.log("Geolocation is not supported by your browser!");
    }

    $sendLocationButton.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition((position) => {
        // console.log(position.coords);
        // socket.emit("sendLocation", {latitude: position.coords.latitude, longitude: position.coords.longitude})
        socket.emit("sendLocation", `https://google.com/maps?q=${position.coords.latitude},${position.coords.longitude}`, () => {
            console.log("Location Shared !");
            $sendLocationButton.removeAttribute('disabled');
        })
    })
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})