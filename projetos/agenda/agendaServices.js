const moment = require('moment')
const axios = require('axios')

const baseUrl = 'http://localhost:3001/tarefas'

const getSchedule = async date => {
    const url = `${baseUrl}?_sort=dt_prevista,descricao&_order=asc`
    const res = await axios.get(url)
    const pendente = item => item.dt_conclusao === null && 
                                    moment(item.dt_prevista).isSameOrBefore(date)
    return res.data.filter(pendente)
}

const getTask = async id => {
    const res = await axios.get(`${baseUrl}/${id}`)
    return res.data
}

const getTasksWithoutForecast = async () => {
    const res = await axios.get(`${baseUrl}?_sort=descricao&_order=asc`)
    return res.data.filter(item => item.dt_prevista === null && item.dt_conclusao === null)
}

const getCompletedTasks = async () => {
    const res = await axios.get(`${baseUrl}?_sort=dt_prevista, descricao&_order=asc`)
    return res.data.filter(item => item.dt_conclusao !== null)
}

const insertTask = async desc => {
    const res = await axios.post(`${baseUrl}`, {descricao: desc, dt_prevista: null, dt_conclusao: null, observacao: null})
    return res.data
}

const completeTask = async id => {
    const task = await getTask(id)
    const res = await axios.put(`${baseUrl}/${id}`, {...task, dt_conclusao: moment().format('YYYY-MM-DD')})
    return res.data
}

const deleteTask = async id => {
    await axios.delete(`${baseUrl}/${id}`)
}

const updateTaskDate = async (id, date) => {
    const task = await getTask(id)
    const res = await axios.put(`${baseUrl}/${id}`, 
        {...task, dt_prevista: date.format('YYYY-MM-DD')})
    return res.data
}

const updateTaskObs = async (id, obs) => {
    const task = await getTask(id)
    const res = await axios.put(`${baseUrl}/${id}`,
        {...task, observacao: obs})
    return res.data
}

module.exports = {
    getSchedule,
    getTask,
    getTasksWithoutForecast,
    getCompletedTasks,
    insertTask,
    completeTask,
    deleteTask,
    updateTaskDate,
    updateTaskObs
}