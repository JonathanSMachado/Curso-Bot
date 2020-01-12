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

bot.on('text', async ctx => {
    try {
        const task = await insertTask(ctx.update.message.text)
        await showTask(ctx, task.id, true)
    } catch (e) {
        console.log(e)
    }
})

bot.startPolling()
