const env = require('../.env')
const Telegraf = require('telegraf')

const bot = new Telegraf(env.token)

bot.command('ajuda', ctx => {
    ctx.reply(`Vou te mostrar as opçoes:
        /op1 - Ajuda um
        /op2 - Ajuda 2    
    `)
})

bot.hears(/\/op\d+/, ctx => {
    ctx.reply('Voce usou um comando de ajuda')
})



bot.startPolling()