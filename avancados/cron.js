const env = require('../.env')
const Telegraf = require('telegraf')
const Telegram = require('telegraf/telegram')
const Markup = require('telegraf/markup')
const Extra = require('telegraf/extra')
const schedule = require('node-schedule')

const telegram = new Telegram(env.token)
const bot = new Telegraf(env.token)

let contador = 1

const buttons = Extra.markup(Markup.inlineKeyboard([
    Markup.callbackButton('Cancelar', 'cancel')
]))

const notify = () => {
    telegram.sendMessage(env.userID, `Mensagem de evento ${contador++}`, buttons)
}

const notification = new schedule.scheduleJob('*/5 * * * * *', notify)

bot.action('cancel', ctx => {
    notification.cancel()
    ctx.reply('OK, parei de enviar eventos!!!')
})

bot.startPolling()