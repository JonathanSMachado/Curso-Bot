const env = require('../.env')
const Telegraf = require('telegraf')
const Markup = require('telegraf/markup')

const bot = new Telegraf(env.token)

const tecladoCarnes = Markup.keyboard([
    ['Vaca', 'Boi', 'Porco'],
    ['Peixe', 'Frango'],
    ['Nenhum']
]).resize().extra()

bot.start(async ctx => {
    await ctx.reply(`Olá ${ctx.update.message.from.first_name}!!!`)
    await ctx.reply('Qual sua bebida favorita?', 
        Markup.keyboard(['Coca', 'Pepsi']).oneTime().resize().extra())
})

bot.hears(['Coca', 'Pepsi'], async ctx => {
    await ctx.reply(`Eu tambem gosto de ${ctx.match}`)
    await ctx.reply('E qual sua carne predileta?', tecladoCarnes)
})

bot.hears([/vaca/i, /boi/i, /porco/i], ctx => {
    ctx.reply('Percebo que gostas de carne vermelha')
})

bot.hears([/peixe/i, /frango/i], ctx => {
    ctx.reply('Preferes carnes brancas então')
})

bot.on('text', ctx => ctx.reply('Não comes carne... Hum...'))

bot.startPolling()
