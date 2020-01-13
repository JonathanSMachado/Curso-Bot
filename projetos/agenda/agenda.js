const env = require('../../.env')
const Telegraf = require('telegraf')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const moment = require('moment')
const session = require('telegraf/session')
const Stage = require('telegraf/stage')
const Scene = require('telegraf/scenes/base')

const { 
    getSchedule, 
    getTask, 
    getCompletedTasks, 
    getTasksWithoutForecast, 
    completeTask, 
    deleteTask, 
    insertTask, 
    updateTaskDate, 
    updateTaskObs 
} = require('./agendaServices')

const bot = new Telegraf(env.token)

bot.start(ctx => {
    const name = ctx.update.message.from.first_name
    ctx.reply(`Seja bem vindo, ${name}!`)
})

const formatDate = date => date ? moment(date).format('DD/MM/YYYY') : ''

const showTask = async (ctx, taskId, newMsg = false) => {
    const task = await getTask(taskId)
    const conclusion = task.dt_conclusao ? 
        `\n<b>Concluída em:</b> ${formatDate(task.dt_conclusao)}` : ''
    const msg = `
        <b>${task.descricao}</b>
        <b>Previsão:</b> ${formatDate(task.dt_prevista)}${conclusion}
        <b>Observações:</b>  
        ${task.observacao || ''}
    `

    newMsg ? ctx.reply(msg, taskButtons(taskId)) : 
        ctx.editMessageText(msg, taskButtons(taskId))
}

const agendaButtons = tasks => {
    const buttons = tasks.map(item => {
        const date = item.dt_prevista ? `${moment(item.dt_prevista).format('DD/MM/YYYY')} - ` : ''
        return [Markup.callbackButton(`${date}${item.descricao}`, `show ${item.id}`)]
    })

    return Extra.markup(Markup.inlineKeyboard(buttons, { columns: 1 }))
}

const taskButtons = taskId => Extra.HTML().markup(Markup.inlineKeyboard([
    Markup.callbackButton('✅', `conclude ${taskId}`),
    Markup.callbackButton('📅', `setDate ${taskId}`),
    Markup.callbackButton('🗒️', `addNote ${taskId}`),
    Markup.callbackButton('🗑️', `delete ${taskId}`),
], { columns : 4 }))

bot.command('day', async ctx => {
    const tasks = await getSchedule(moment())
    ctx.reply('Aqui está sua agenda do dia', agendaButtons(tasks))
})

bot.command('tomorrow', async ctx => {
    const tasks = await getSchedule(moment().add({ day: 1 }))
    ctx.reply('Aqui está sua agenda até amanhã', agendaButtons(tasks))
})

bot.command('week', async ctx => {
    const tasks = await getSchedule(moment().add({ week: 1 }))
    ctx.reply('Aqui está sua agenda da semana', agendaButtons(tasks))
})

bot.command('completed', async ctx => {
    const tasks = await getCompletedTasks()
    ctx.reply('Estas são as tarefas que você já concluiu', agendaButtons(tasks))
})

bot.command('tasks', async ctx => {
    const tasks = await getTasksWithoutForecast()
    ctx.reply('Esta é sua lista de tarefas não agendadas', agendaButtons(tasks))
})

bot.action(/show (.+)/, async ctx => {
    await showTask(ctx, ctx.match[1])
})

bot.action(/conclude (.+)/, async ctx => {
    await completeTask(ctx.match[1])
    await showTask(ctx, ctx.match[1])
    await ctx.reply('Tarefa Concluída')
})

bot.action(/delete (.+)/, async ctx => {
    await deleteTask(ctx.match[1])
    await ctx.editMessageText('Tarefa Excluída')
})

const dateKeyboardShortcut = Markup.keyboard([
    ['Hoje', 'Amanhã'],
    ['1 Semana', '1 Mês']
]).resize().oneTime().extra()

let taskId = null

/*--------- Date Scene ----------*/
const dateScene = new Scene('date')

dateScene.enter(ctx => {
    taskId = ctx.match[1]
    ctx.reply('Gostaria de definir alguma data?', dateKeyboardShortcut)
})

dateScene.leave(ctx => taskId = null)

dateScene.hears(/hoje/gi, async ctx => {
    const date = moment()
    handleDate(ctx, date)
})

dateScene.hears(/(Amanh[ãa])/gi, async ctx => {
    const date = moment().add({ days: 1 })
    handleDate(ctx, date)
})

dateScene.hears(/ˆ(\d+) dias?/gi, async ctx => {
    const date = moment().add({ days: ctx.match[1] })
    handleDate(ctx, date)
})

dateScene.hears(/ˆ(\d+) semanas?/gi, async ctx => {
    const date = moment().add({ week: ctx.match[1]})
    handleDate(ctx, date)
})

dateScene.hears(/ˆ(\d+) m[êe]s(es)?/gi, async ctx => {
    const date = moment().add({ months: ctx.match[1]})
    handleDate(ctx, date)
})

dateScene.hears(/(\d{2}\/\d{2}\/\d{4})/g, async ctx => {
    const date = moment(ctx.match[1], 'DD/MM/YYYY')
    handleDate(ctx, date)
})

const handleDate = async (ctx, date) => {
    await updateTaskDate(taskId, date)
    await ctx.reply('Data atualizada')
    await showTask(ctx, taskId, true)
    ctx.scene.leave()
}

dateScene.on('message', ctx => {
    ctx.reply('Padrões aceitos\ndd/MM/YYYY\nX dias\nX semanas\nX meses')
})

/*------- Obs Scene -------*/

const obsScene = new Scene('obs')

obsScene.enter(ctx => {
    taskId = ctx.match[1]
    ctx.reply('Já pode adicionar suas anotações')
})

obsScene.leave(ctx => taskId = null)

obsScene.on('text', async ctx => {
    const task = await getTask(taskId)
    const obs = task.observacao ? task.observacao + '\n---\n' + ctx.update.message.text : ctx.update.message.text
    const res = await updateTaskObs(taskId, obs)
    await ctx.reply('Observação adicionada')
    await showTask(ctx, taskId, true)
    ctx.scene.leave()
})

obsScene.on('message', ctx => {
    ctx.reply('Apenas OBS em texto são aceitas')
})

const stage = new Stage([dateScene, obsScene])
bot.use(session())
bot.use(stage.middleware())

bot.action(/setDate (.+)/, Stage.enter('date'))
bot.action(/addNote (.+)/, Stage.enter('obs'))

bot.on('text', async ctx => {
    try {
        const task = await insertTask(ctx.update.message.text)
        await showTask(ctx, task.id, true)
    } catch (e) {
        console.log(e)
    }
})

bot.startPolling()
