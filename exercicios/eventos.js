const env = require('../.env')
const Telegraf = require('telegraf')

const bot = new Telegraf(env.token)

bot.start(ctx => {
    ctx.reply(`Olá ${ctx.update.message.from.first_name}`)
})

bot.on('text', ctx => {
    ctx.reply(`Texto '${ctx.update.message.text}' recebido com sucesso`)
})

bot.on('location', ctx => {
    const location = ctx.update.message.location
    ctx.reply(`Você está em:
        LAT: ${location.latitude}, 
        LON: ${location.longitude}`)
})

bot.startPolling()