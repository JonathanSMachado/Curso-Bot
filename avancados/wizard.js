const env = require('../.env')
const Telegraf = require('telegraf')
const Composer = require('telegraf/composer')
const session = require('telegraf/session')
const WizardScene = require('telegraf/scenes/wizard')
const Stage = require('telegraf/stage')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')

const bot = new Telegraf(env.token)

let description = ''
let price = 0
let date = null

const confirmationKeyboard = Extra.markup(Markup.inlineKeyboard([
    Markup.callbackButton('Sim', 's'),
    Markup.callbackButton('Não', 'n')
]))

const priceHandler = new Composer()
priceHandler.hears(/(\d+)/, ctx => {
    price = ctx.match[1]
    ctx.reply('É para pagar que dia?')
    ctx.wizard.next()
})

priceHandler.use(ctx => ctx.reply('Apenas números, por favor...'))

const dateHandler = new Composer()
dateHandler.hears(/(\d{2}\/\d{2}\/\d{4})/, ctx => {
    date = ctx.match[1]
    ctx.reply(`Aqui está um resumo de sua compra:
        Descrição: ${description}
        Preço: ${price}
        Data: ${date}    
    Confirma?`, confirmationKeyboard)
    ctx.wizard.next()
})

dateHandler.use(ctx => ctx.reply('A data deve estar no formato dd/MM/AAAA...'))

const confirmationHandler = new Composer()
confirmationHandler.action('s', ctx => {
    ctx.reply('Compra confirmada!!!')
    ctx.scene.leave()
})

confirmationHandler.action('n', ctx => {
    ctx.reply('Compra cancelada!!!')
    ctx.scene.leave()
})

confirmationHandler.use(ctx => ctx.reply('Apenas confirme, por favor...', confirmationKeyboard))

const wizardBuy = new WizardScene('buy',
    ctx => {
        ctx.reply('O que voce comprou?')
        ctx.wizard.next()
    },
    ctx => {
        description = ctx.update.message.text
        ctx.reply('Quanto foi?')
        ctx.wizard.next()
    },
    priceHandler,
    dateHandler,
    confirmationHandler
)

const stage = new Stage([wizardBuy], { default: 'buy'})

bot.use(session())
bot.use(stage.middleware())

bot.startPolling()