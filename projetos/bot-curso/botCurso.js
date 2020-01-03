const env = require('../../.env')
const Telegraf = require('telegraf')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const axios = require('axios')

const bot = new Telegraf(env.token)

const optionsKeyboard = Markup.keyboard([
    ['O que são Bots?', 'O que verei no curso?'],
    ['Posso mesmo automatizar tarefas?'],
    ['Como comprar o curso?']
]).resize().extra()

const confirmationButtons = Extra.markup(Markup.inlineKeyboard([
    Markup.callbackButton('Sim', 'y'),
    Markup.callbackButton('Não', 'n')
], { columns : 2 }))

const locationButton = Markup.keyboard([
    Markup.locationRequestButton('Enviar minha localização')
]).resize().oneTime().extra()

bot.start(async ctx => {
    const name = ctx.update.message.from.first_name
    await ctx.replyWithMarkdown(`*Olá ${name}*\nSou o Bot do curso!`)
    await ctx.replyWithPhoto('http://files.cod3r.com.br/curso-bot/bot.png')
    await ctx.replyWithMarkdown(`_Posso te ajudar em algo?_`, optionsKeyboard)
})

bot.hears('O que são Bots?', ctx => {
    ctx.replyWithMarkdown(`Bot, diminutivo de robot, também conhecido como 
Internet bot ou web robot, é uma aplicação de 
software concebido para simular ações humanas 
repetidas vezes de maneira padrão, da mesma 
forma como faria um robô.

_Algo mais ?_`, optionsKeyboard)
})

bot.hears('O que verei no curso?', async ctx => {
    await ctx.replyWithMarkdown('No *curso*... tb vamos criar _3 projetos_:')
    await ctx.reply('1. Um bot que vai gerenciar sua lista de compras')
    await ctx.reply('2. Um bot que vai permitir cadastrar seus eventos')
    await ctx.reply('3. Você verá como fui criado. E poderá criar uma cópia minha!')
    await ctx.replyWithMarkdown('\n_Algo mais ?_', optionsKeyboard)
})

bot.hears('Posso mesmo automatizar tarefas?', async ctx => {
    ctx.replyWithMarkdown('Claro que sim, o Bot servirá...\nQuer uma palhinha?', confirmationButtons)
})

bot.hears('Como comprar o curso?', ctx => {
    ctx.replyWithMarkdown('Compre aqui [link](https://www.cod3r.com.br/)', optionsKeyboard)
})

bot.action('n', ctx => {
    ctx.reply('Ok. Não precisa ser grosso :(', optionsKeyboard)
})

bot.action('y', ctx => {
    ctx.reply('Que legal, me envie sua localização, ou escreva uma mensagem qualquer', locationButton)
})

bot.hears(/mensagem qualquer/i, ctx => {
    ctx.reply('Essa piada é velha, tente outra.', optionsKeyboard)
})

bot.on('text', async ctx => {
    let message = ctx.message.text
    message = message.split('').reverse().join('')
    await ctx.reply(`A sua mensagem ao contrário é: ${message}`)
    await ctx.reply(`Isso mostra que consigo ler e 
manipular o que me enviou!!!`, optionsKeyboard)
})

bot.on('location', async ctx => {
    try {
        const url = 'http://api.openweathermap.org/data/2.5/weather'
        const { latitude: lat, longitude: lon } = ctx.message.location
        const result = await axios.get(`${url}?lat=${lat}&lon=${lon}&APPID=6638e8f6fa0d78a20f9fdff76f6b700e&units=metric`)
        await ctx.reply(`Hummm... Você está em ${result.data.name}`)
        await ctx.reply(`A temperatura por aí está em ${result.data.main.temp}°C`, optionsKeyboard)
    } catch(e) {
        console.log(e)
        ctx.reply('Estou tendo problemas para obter a temperatura', optionsKeyboard)
    }
})

bot.startPolling()