const env = require('../../.env')
const Telegraf = require('telegraf')
const Markup = require('telegraf/markup')
const Extra = require('telegraf/extra')
const bot = new Telegraf(env.token)

let items = []

const buildButtons = () => Extra.markup(Markup.inlineKeyboard(
    items.map(item => Markup.callbackButton(item, `delete ${item}`)),
    { columns: 3 }   
))

bot.start(async ctx => {
    const name = ctx.update.message.from.first_name
    await ctx.reply(`Seja bem vindo, ${name}`)
    await ctx.reply('Para adicionar itens na lista, basta digitar...')
})

bot.on('text', ctx => {
    items.push(ctx.update.message.text)
    ctx.reply(`${ctx.update.message.text} adicionado na lista!`, buildButtons())
})

bot.action(/delete (.+)/, ctx => {
    items = items.filter(item => item !== ctx.match[1])
    ctx.reply(`${ctx.match[1]} removido da lista!`, buildButtons())
    !items.length && ctx.reply('Parabens, voce zerou sua lista!!!')
})


bot.startPolling()