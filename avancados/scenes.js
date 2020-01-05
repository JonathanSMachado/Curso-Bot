const env = require('../.env')
const Telegraf = require('telegraf')
const session = require('telegraf/session')
const Scene = require('telegraf/scenes/base')
const Stage = require('telegraf/stage')
const { enter, leave } = Stage

const bot = new Telegraf(env.token)

bot.start(ctx => {
    const name = ctx.update.message.from.first_name
    ctx.reply(`Seja bem vindo, ${name}`)
    ctx.reply('Entre com o comando /echo ou /soma para iniciar...')
})

const echoScene = new Scene('echo')
echoScene.enter(ctx => ctx.reply('Entrando na Echo Scene'))
echoScene.leave(ctx => ctx.reply('Saindo da Echo Scene'))
echoScene.command('sair', leave())
echoScene.on('text', ctx => ctx.reply(ctx.update.message.text))
echoScene.on('message', ctx => ctx.reply('Apenas mensagens de texto, por favor...'))

let sum = 0
const sumScene = new Scene('sum')
sumScene.enter(ctx => ctx.reply('Entrando em Sum Scene'))
sumScene.leave(ctx => ctx.reply('Saindo de Sum Scene'))
sumScene.use(async (ctx, next) => {
    await ctx.reply('Voce está em Sum Scene, digite um número para somar...')
    await ctx.reply('Outros comandos: /zerar /sair')
    next()
})

sumScene.command('zerar', ctx => {
    sum = 0
    ctx.reply(`Valor ${sum}`)
})

sumScene.command('sair', leave())

sumScene.hears(/(\d+)/, ctx => {
    sum += parseInt(ctx.match[1])
    ctx.reply(`Valor ${sum}`)
})

sumScene.on('message', ctx => ctx.reply('Digite apenas números por favor...'))

const stage = new Stage([echoScene, sumScene])
bot.use(session())
bot.use(stage.middleware())

bot.command('echo', enter('echo'))
bot.command('soma', enter('sum'))
bot.on('message', ctx => ctx.reply('Entre com /echo ou /soma para iniciar...'))

bot.startPolling()
