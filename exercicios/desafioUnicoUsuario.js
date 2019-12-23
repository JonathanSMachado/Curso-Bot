const env = require('../.env')
const Telegraf = require('telegraf')

const bot = new Telegraf(env.token)

bot.start(ctx => {
    ctx.reply(`Só falo com meu mestre. Por favor, qual a senha?`)
})

bot.on('text', ctx => {
    const pass = `JSM2019`
    const message = ctx.update.message.text

    if(pass === message) {
        ctx.reply(`Que bom ver voce mestre...`)
    } else {
        ctx.reply(`Voce nao e meu mestre`)
    }
    
})

bot.startPolling()