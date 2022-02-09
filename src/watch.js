/* eslint-disable */
const k8s = require('@kubernetes/client-node');
const kc = new k8s.KubeConfig();
const { logger } = require('./log');
const cache = require('./cache/memoryCache')();
const https = require('https');
const urlParse = url = require('url');

var events = require('events');


const clientId_subId_map = 'clientId_subId_map';
const subId_watchObj_map = 'subId_watchObj_map';
const pathClientKey_subId_map = 'pathClientKey_subId_map';

function setupWatch(
  subscription,
  pubsub,
  authToken,
  clusterURL,
  namespace,
  pathUrl,
  subId,
  clientId,
  args
) {
  console.log('pathUrl---', pathUrl, clusterURL)
  if (subscription.k8sType === 'PodLogs') {
    logsWatch(
      subscription.k8sType,
      pathUrl,
      pubsub,
      authToken,
      clusterURL,
      subId,
      clientId,
      args
    )
  } else {
    _setupWatch(
      subscription.k8sType,
      pathUrl,
      pubsub,
      authToken,
      clusterURL,
      namespace,
      subId,
      clientId,
    )
  }
}

/**
* Creates and renews k8 subscriptions using @kubernetes/client-node
* @param {Object} kind from k8 spec, specifies resource type
* @param {Object} url from k8 spec, aka 'path' or 'url
* @param {Object} pubsub generated by apollo server
* @param {Object} authToken sent from frontend
* @param {Object} clusterURL sent from front end, specifies cluster to point to
* @param {Object} namespace sent from front end, specifies namespace to point to
* @param {Object} subId generated on qlkube server to differentiate subscriptions
* @param {Object} clientId generated on frontend to differentiate clients
*/
const _setupWatch = async function (
  kind,
  url,
  pubsub,
  authToken,
  clusterURL,
  namespace,
  subId,
  clientId,
) {
  const em = new events.EventEmitter();

  const authTokenSplit = authToken.split(' ');
  const token = authTokenSplit[authTokenSplit.length - 1];

  kc.loadFromOptions({
    clusters: [{ server: clusterURL }],
    users: [{ token: token }],
    contexts: [{ name: namespace, token }],
    currentContext: namespace,
  });
  console.log('clusterURL', clusterURL)
  console.log('token', token)
  console.log('namespace', namespace)
  console.log('clusterURL', clusterURL)
  const watch = new k8s.Watch(kc);

  const watchCallback = (type, obj, data) => {
    console.log('watchCallback.....', type)
    if (['ADDED', 'MODIFIED', 'DELETED'].includes(type)) {
      publishEvent(`${upperKind}_${type}`, obj);
    }
  };

  const publishEvent = (type, obj) => {
    logger.debug(
      `watcher event:  ${type}, namespace: ${obj.metadata.namespace} name: ${obj.metadata.name}`
    );
    // em.emit(pubsub, obj);

    pubsub.publish(type, { event: type, object: obj });
  };


  let timerId;

  const watchDone = (err) => {
    logger.debug('watch done', err, subId, clientId, url);

    if (timerId != null) { clearTimeout(timerId); }
    timerId = setTimeout(async () => {

      if (
        cache.get(clientId_subId_map)[clientId] &&
        cache.get(clientId_subId_map)[clientId].includes(subId)
      ) {
        setupWatch();
      }
    }, 5000);
  };

  const watchError = (err) => {
    logger.error('watch err!', err.message);
  };

  const queryParams = {
    allowWatchBookmarks: true,
    forever: false,
    timeout: 10000,
  };

  const setupWatch = async () => {
    return await watch
      .watch(
        url,
        queryParams,
        watchCallback,
        (err) => watchDone(err)
        ,
        watchError
      )
      .then((req) => {
        logger.debug('watch request: ', url, subId, clientId);
        return req;
      })
      .catch((err) => {
        logger.error('watch error: ', err.message);
      });
  };

  let upperKind = kind.toUpperCase();
  mapSubIdToClientId(clientId, subId);
  const returnedWatch = await setupWatch()
  mapWatchToSubId(subId, returnedWatch);
  mapPathClientKeyToSubId(url, clientId, subId);
}

/**
* Creates and renews k8 subscriptions using @kubernetes/client-node
* @param {Object} kind from k8 spec, specifies resource type
* @param {Object} url from k8 spec, aka 'path' or 'url
* @param {Object} pubsub generated by apollo server
* @param {Object} authToken auth token sent from frontend
* @param {Object} clusterURL sent from front end, specifies cluster to point to
* @param {Object} subId generated on qlkube server to differentiate subscriptions
* @param {Object} clientId generated on frontend to differentiate clients
* @param {Object} args args containing namespace, container, podname
*/
const logsWatch = async function (
  kind,
  url,
  pubsub,
  authToken,
  clusterURL,
  subId,
  clientId,
  args
) {

  try {
    process.on('uncaughtException', function (err) {
      logger.error('unknown exception:', err, clientId)
    });

    let upperKind = kind.toUpperCase();
    let logWatchUrl = `${clusterURL}${url}`
    let innerLogWatch;

    const logWatch = async () => {

      function reConnect() {
        if (
          cache.get(clientId_subId_map)[clientId] &&
          cache.get(clientId_subId_map)[clientId].includes(subId) &&
          innerLogWatch === null
        ) {
          logWatchUrl = `${clusterURL}${args.secondaryUrl}`
          logWatch();
        }
      }
      console.log('logWatchUrl', logWatchUrl)
      const opts = urlParse.parse(logWatchUrl)
      // console.log('opts', opts)
      const authTokenSplit = authToken.split(' ');
      const token = authTokenSplit[authTokenSplit.length - 1];

      opts.headers = {};
      opts.headers['Authorization'] = token;
      opts.headers['Content-Type'] = 'application/json';
      opts['timeout'] = 500000;

      innerLogWatch = await https.request(opts, function (res) {
        res.setEncoding('utf8');
        res.on('data', function (body) {
          watchCallback(body)
        });
        res.on('error', (err) => { logger.error('Logger socket error:', clientId) });
        res.on('close', (msg) => {
          logger.debug('Logger socket closed:', clientId)
          innerLogWatch = null;
          setTimeout(() => {
            reConnect()
          }, 5000)
        });
      }).end(() => logger.debug('socket init', clientId));
      innerLogWatch['connectionType'] = 'stream';
      mapWatchToSubId(subId, innerLogWatch)
    };

    const watchCallback = (logString) => {
      if (
        cache.get(clientId_subId_map)[clientId] &&
        cache.get(clientId_subId_map)[clientId].includes(subId)
      ) {
        publishEvent(`${upperKind}_LOGGER`, logString);
      } else {
        if (innerLogWatch !== null) {
          innerLogWatch.destroy();
          innerLogWatch = null;
        }
      }
    };

    const publishEvent = (type, obj) => {
      // pubsub.publish(type, { object: { log: obj, container: args.container, pod: args.name } });
    };

    await logWatch();
    mapSubIdToClientId(clientId, subId);

  } catch (error) {
    logger.error('Logger error:', error)
  }
}

/**
 * Maps subscription id's to their respective client id's
 * This enables us to keep track of all subscriptions on a websocket
 * @param {Object} clientId generated on frontend to differentiate clients
 * @param {Object} subId generated on qlkube server to differentiate subscriptions
 */
function mapSubIdToClientId(clientId, subId) {
  let clientId_subId_map_cacheClone = deepClone(cache.get(clientId_subId_map));
  if (clientId_subId_map_cacheClone[clientId]) {
    let newSubClientMap = [...clientId_subId_map_cacheClone[clientId], subId];
    clientId_subId_map_cacheClone[clientId] = newSubClientMap;
  } else {
    clientId_subId_map_cacheClone[clientId] = [subId];
  }
  cache.set(clientId_subId_map, clientId_subId_map_cacheClone);
}

/**
 * Maps watch objects to subscription ids
 * This enables us quickly back reference specific subscriptions for abort() calls
 * @param {Object} watchObj generated within setupWatch, contains our watch subscription
 * @param {Object} subId generated on qlkube server to differentiate subscriptions
 */
function mapWatchToSubId(subId, watchObj) {
  let subId_watchObj_map_cache = cache.get(subId_watchObj_map);
  subId_watchObj_map_cache[subId] = watchObj;
  cache.set(subId_watchObj_map, subId_watchObj_map_cache);
}

/**
 * Maps client id and path to sub ids -> <path><clientId> : subid, should automatically end duplicated path subs
 * This lets us back reference subscription ids during event callbacks
 * @param {Object} path from k8 api spec
 * @param {Object} clientId generated on frontend to differentiate clients
 * @param {Object} subId generated on qlkube server to differentiate subscriptions
 */
async function mapPathClientKeyToSubId(path, clientId, subId) {
  let pathClientKey_subId_map_cacheClone = deepClone(cache.get(pathClientKey_subId_map));
  const pathClientKey = getPathClientKey(path, clientId);
  if (pathClientKey_subId_map_cacheClone[pathClientKey]) {
    // await endSpecifiedWatch(clientId, path); //##look into
  }
  pathClientKey_subId_map_cacheClone[pathClientKey] = subId;
  cache.set(pathClientKey_subId_map, pathClientKey_subId_map_cacheClone);
}

/**
 * Lets us end a specific watch
 * @param {Object} path from k8 api spec
 * @param {Object} clientId generated on frontend to differentiate clients
 */
function endSpecifiedWatch(clientId, path) {
  let pathClientKey_subId_map_cacheClone = deepClone(cache.get(pathClientKey_subId_map));
  let subId_watchObj_map_cacheClone = deepClone(cache.get(subId_watchObj_map));
  let clientId_subId_map_cacheClone = deepClone(cache.get(clientId_subId_map));
  const pathClientKey = getPathClientKey(path, clientId);
  if (pathClientKey_subId_map_cacheClone[pathClientKey]) {
    const watchSubId = pathClientKey_subId_map_cacheClone[pathClientKey];
    const watchObj = cache.get(subId_watchObj_map)[watchSubId];
    const clientSubMapIndex = clientId_subId_map_cacheClone[clientId].indexOf(watchSubId);
    if (watchObj) {
      watchObj.abort();
      delete subId_watchObj_map_cacheClone[watchSubId];
      delete pathClientKey_subId_map_cacheClone[pathClientKey];
      if (clientSubMapIndex !== -1) {
        let updatedClientSubMap = clientId_subId_map_cacheClone[clientId].filter(subId => {
          return subId !== watchSubId
        })
        clientId_subId_map_cacheClone[clientId] = updatedClientSubMap;
      }
      cache.set(clientId_subId_map, clientId_subId_map_cacheClone);
      cache.set(subId_watchObj_map, subId_watchObj_map_cacheClone);
      cache.set(pathClientKey_subId_map, pathClientKey_subId_map_cacheClone);
    }
  }
}

/**
 * Simple return for pathClientKey_subId_map, key
 * @param {Object} clientId generated on frontend to differentiate clients
 * @param {Object} path from k8 api spec
 */
function getPathClientKey(path, clientId) {
  return `${path}${clientId}`
}

/**
 * Discontinue all watchables for specified client
 * @param {Object} clientId generated on frontend to differentiate clients
 */
function disconnectWatchable(clientId) {
  let pathClientKey_subId_map_cacheClone = deepClone(cache.get(pathClientKey_subId_map));
  let subId_watchObj_map_cacheReference = cache.get(subId_watchObj_map);
  let clientId_subId_map_cacheClone = deepClone(cache.get(clientId_subId_map));
  if (clientId_subId_map_cacheClone[clientId]) {
    let allSubs = clientId_subId_map_cacheClone[clientId];
    const pathClientKey_subId_map_CLONE = deepClone(pathClientKey_subId_map_cacheClone);
    const subId_watchObj_map_CLONE = deepClone(subId_watchObj_map_cacheReference);

    for (const [clientPathKey, subId] of Object.entries(pathClientKey_subId_map_CLONE)) {
      if (allSubs.includes(subId)) {
        delete pathClientKey_subId_map_cacheClone[clientPathKey]
      }
    }
    for (const [subKey, wtchObj] of Object.entries(subId_watchObj_map_CLONE)) {
      if (allSubs.includes(subKey)) {
        let subToAbort = cache.get(subId_watchObj_map)[subKey];
        subToAbort.abort();
        delete subId_watchObj_map_cacheReference[subKey];
      }
    }
    delete clientId_subId_map_cacheClone[clientId]
    cache.set(clientId_subId_map, clientId_subId_map_cacheClone);
    cache.set(subId_watchObj_map, subId_watchObj_map_cacheReference);
    cache.set(pathClientKey_subId_map, pathClientKey_subId_map_cacheClone);
  }
}

/**
 * Discontinue targeted subscription for specified client
 * @param {Object} clientId generated on frontend to differentiate clients
 * @param {Object} _subId generated on qlkube, differentiates watch/stream sockets per client
 */
function disconnectSpecificSocket(clientId, _subId) {
  let pathClientKey_subId_map_cacheClone = deepClone(cache.get(pathClientKey_subId_map));
  let subId_watchObj_map_cacheReference = cache.get(subId_watchObj_map);
  let clientId_subId_map_cacheClone = deepClone(cache.get(clientId_subId_map));
  if (clientId_subId_map_cacheClone[clientId]) {
    let allSubsForClient = clientId_subId_map_cacheClone[clientId];
    const pathClientKey_subId_map_CLONE = deepClone(pathClientKey_subId_map_cacheClone);
    const subId_watchObj_map_CLONE = { ...subId_watchObj_map_cacheReference }
    for (const [clientPathKey, subId] of Object.entries(pathClientKey_subId_map_CLONE)) {
      if (subId === _subId) {
        delete pathClientKey_subId_map_cacheClone[clientPathKey]
      }
    }
    let updatedSubsForClient = []
    if (
      subId_watchObj_map_CLONE[_subId] &&
      allSubsForClient.includes(_subId)
    ) {
      let subToAbort = cache.get(subId_watchObj_map)[_subId];
      subToAbort.abort();
      delete subId_watchObj_map_cacheReference[_subId];
      updatedSubsForClient = allSubsForClient.filter(cachedSubId => cachedSubId !== _subId)

      if (!updatedSubsForClient || updatedSubsForClient.length === 0) {
        delete clientId_subId_map_cacheClone[clientId]
      } else {
        clientId_subId_map_cacheClone[clientId] = updatedSubsForClient
      }
    }
    cache.set(clientId_subId_map, clientId_subId_map_cacheClone);
    cache.set(subId_watchObj_map, subId_watchObj_map_cacheReference);
    cache.set(pathClientKey_subId_map, pathClientKey_subId_map_cacheClone);
  }
}

function getWatchMap() {
  return '';
}

function deepClone(objet) {
  return JSON.parse(JSON.stringify(objet))
}

function generateSubId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

exports.setupWatch = setupWatch;
exports.disconnectWatchable = disconnectWatchable;
exports.getWatchMap = getWatchMap;
exports.generateSubId = generateSubId;
exports.disconnectSpecificSocket = disconnectSpecificSocket;
