const exec = (ctx, ...middlewares) => {
    const run = index => {
        middlewares && index < middlewares.length &&
            middlewares[index](ctx, () => run(index + 1))
    }

    run(0)
}

const mid1 = (ctx, next) => {
    ctx.info1 = 'mid1'
    next()
}

const mid2 = (ctx, next) => {
    ctx.info2 = 'info2'
    next()
}

const mid3 = ctx => ctx.info3 = 'info3'

const ctx = {}
exec(ctx, mid1, mid2, mid3)
console.log(ctx)