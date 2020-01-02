const env = require('../../.env')
const Telegraf = require('telegraf')
const Markup = require('telegraf/markup')
const Extra = require('telegraf/extra')
const session = require('telegraf/session')
const bot = new Telegraf(env.token)

const buildButtons = items => Extra.markup(Markup.inlineKeyboard(
    items.map(item => Markup.callbackButton(item, `delete ${item}`)),
    { columns: 3 }   
))

bot.use(session())

bot.start(async ctx => {
    const name = ctx.update.message.from.first_name
    await ctx.reply(`Seja bem vindo, ${name}`)
    await ctx.reply('Para adicionar itens na lista, basta digitar...')
    ctx.session.items = []
})

bot.on('text', ctx => {
    ctx.session.items.push(ctx.update.message.text)
    ctx.reply(`${ctx.update.message.text} adicionado na lista!`, buildButtons(ctx.session.items))
})

bot.action(/delete (.+)/, async ctx => {
    ctx.session.items = ctx.session.items.filter(item => item !== ctx.match[1])
    await ctx.reply(`${ctx.match[1]} removido da lista!`, buildButtons(ctx.session.items))
    !ctx.session.items.length && ctx.reply('Parabens, voce zerou sua lista!!!')
})


bot.startPolling()