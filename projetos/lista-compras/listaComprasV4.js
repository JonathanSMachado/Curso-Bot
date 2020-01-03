const env = require('../../.env')
const Telegraf = require('telegraf')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const bot = new Telegraf(env.token)

let data = {}

bot.use((ctx, next) => {
    const chatID = ctx.chat.id
    if(!data.hasOwnProperty(chatID)) data[chatID] = []
    ctx.itens = data[chatID]
    next()
})

const buildButtons = list => Extra.markup(Markup.inlineKeyboard(
    list.map(item => Markup.callbackButton(item, `delete ${item}`)),
    { columns: 3 }
))

bot.start(async ctx => {
    const name = ctx.update.message.from.first_name
    await ctx.reply(`Seja bem vindo, ${name}`)
    ctx. reply('Informe os itens para a lista...')
})

bot.on('text', ctx => {
    const text = ctx.update.message.text
    if(text.startsWith('/')) text = text.substring(1)
    ctx.itens.push(text)
    ctx.reply(`${text} adicionado com sucesso!!!`, buildButtons(ctx.itens))
})

bot.action(/delete (.+)/, ctx => {
    const index = ctx.itens.indexOf(ctx.match[1])
    if(index >= 0) ctx.itens.splice(index, 1)
    ctx.reply(`${ctx.match[1]} removido com sucesso!!!`, buildButtons(ctx.itens))
})

bot.startPolling()