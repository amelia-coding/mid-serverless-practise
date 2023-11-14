const { asyncWrapper, start } = require('@midwayjs/serverless-fc-starter');
const SimpleLock  = require('@midwayjs/simple-lock').default;
const lock = new SimpleLock();
const layers = [];

try {
  const layer_npm_eggLayer = require('@midwayjs/egg-layer');
  layers.push(layer_npm_eggLayer);
} catch(e) { }


let runtime;
let initStatus = 'uninitialized';
let initError;

const initializeMethod = async (initializeContext = {}) => {
  initStatus = 'initialing';
  return lock.sureOnce(async () => {
    runtime = await start({
      layers: layers,
      isAppMode: true,
      initContext: initializeContext,
      runtimeConfig: {"service":{"name":"midway-http"},"provider":{"name":"aliyun","initTimeout":10},"deployType":"egg","custom":{"customDomain":{"domainName":"auto"}},"functions":{"app_index":{"handler":"index.handler","events":[{"http":{"path":"/*"}}]}},"package":{"include":["dist"]},"layers":{"eggLayer":{"path":"npm:@midwayjs/egg-layer"}},"globalDependencies":{"@midwayjs/simple-lock":"*","@midwayjs/serverless-fc-starter":"2"}},
    });
    initStatus = 'initialized';
  }, 'APP_START_LOCK_KEY');
};

exports.initializer = asyncWrapper(async (...args) => {
  console.log(`initializer: process uptime: ${process.uptime()}, initStatus: ${initStatus}`);
  if (initStatus === 'initializationError') {
    console.error('init failed due to init status is error, and that error is: ' + initError);
    console.error('FATAL: duplicated init! Will exit with code 121.');
    process.exit(121);
  }
  if (initStatus === 'initialized') {
    console.warn('skip init due to init status is initialized');
    return;
  }
  if (initStatus !== 'uninitialized') {
    throw new Error('init failed due to init status is ' + initStatus);
  }
  try {
    if (initStatus !== 'initialized') {
      await initializeMethod();
    }
  } catch (e) {
    initStatus = 'initializationError';
    initError = e;
    throw e;
  }
});



  exports.handler = asyncWrapper(async (...args) => {
    
    if (initStatus !== 'initialized') {
      throw new Error('invoke failed due to init status is ' + initStatus);
    }
    return runtime.asyncEvent()(...args);
  });

