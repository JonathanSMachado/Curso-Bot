const env = require('../.env')
const Telegraf = require('telegraf')

const bot = new Telegraf(env.token)

let mestreID = false

bot.start(ctx => {
    const from = ctx.update.message.from
    
    if(isMestre(ctx)) {
        ctx.reply(`Olá mestre legal...`)
    } else {
        ctx.reply(`Desculpe, só falo com o meu mestre!!!`)
    }
})

bot.on('text', ctx => {
    const pass = `JSM2019`
    const message = ctx.update.message.text

    if(pass === message) {
        mestreID = ctx.update.message.from.id
        ctx.reply(`Que bom ver voce mestre...`)
    } else {
        ctx.reply(`Voce nao e meu mestre`)
    }
    
})

bot.startPolling()

const isMestre = (ctx) => mestreID === ctx.update.message.from.id