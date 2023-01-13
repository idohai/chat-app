// Elements
const $loginForm = document.getElementById('login-form')
const $emailInput = document.getElementById('email-input')
const $passwordInput = document.getElementById('pass-input')
// const $roomInput = document.getElementById('room-input')


$loginForm.addEventListener('submit', (e) => {
    e.preventDefault()
    const body = {
        email: $emailInput.value,
        password: $passwordInput.value
    }
    fetch('/users/login', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
        })
        .then(response => response.json())
        .then(response => {
            localStorage.setItem('token', response.token )
            window.open('../chat.html', '_self')
        })
        .catch(err => {
            alert('bad login')

        })
    })
