class Interceptor {
  constructor() {
    this.aspects = [];
  }

  use(functor) {
    this.aspects.push(functor);
    return this;
  }

  async run(context) {
    const aspects = this.aspects;

    const proc = aspects.reduceRight(
      function (a, b) {
        return async () => {
          await b(context, a);
        };
      },
      () => Promise.resolve()
    );

    try {
      await proc();
    } catch (ex) {
      console.error(ex.message);
    }

    return context;
  }
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const inter = new Interceptor();

const task = function (id) {
  return async (ctx, next) => {
    console.log(`task ${id} begin`);
    ctx.count++;
    await wait(1000);
    console.log(`count: ${ctx.count}`);
    await next();
    console.log(`task ${id} end`);
  };
};

inter.use(task(0));
inter.use(task(1));
inter.use(task(2));
inter.use(task(3));
inter.use(task(4));

inter.run({ count: 0 });
