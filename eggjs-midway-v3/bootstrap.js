const { Bootstrap } = require('@midwayjs/bootstrap');

// 显式以组件方式引入用户代码
Bootstrap.configure({
  globalConfig: {
    egg: {
      port: 9000,
    },
  },
}).run();
