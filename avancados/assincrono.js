const env = require('../.env')
const Telegram = require('telegraf/telegram')
const Markup = require('telegraf/markup')
const axios = require('axios')


const sendMessage = msg => {
    axios.get(`${env.apiUrl}/sendMessage?chat_id=${env.userID}&text=${encodeURI(msg)}`)
        .catch(e => console.log(e))
}

sendMessage('Mensagem enviada pelo Bot para o usuário!!!')

const keyboard = Markup.keyboard([
    'OK', 'Cancelar'
]).resize().oneTime().extra()

const telegram = new Telegram(env.token)
telegram.sendMessage(env.userID, 'Sou uma mensagem enviada pelo Bot.', keyboard)