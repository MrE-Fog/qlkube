const cors = require('cors');
require('dotenv').config();
const { ApolloServer, PubSub } = require('apollo-server-express');
const logger = require('pino')({ useLevelLabels: true });
const express = require('express');
const http = require('http');
const fs = require('fs').promises;
const nodeFs = require('fs');

const {
  createSchema,
  getWatchables,
  deleteDeprecatedWatchPaths,
  deleteWatchParameters,
} = require('./schema');
const utilities = require('./utilities');
const getOpenApiSpec = require('./oas');
const watch = require('./watch');
const path = require('path')
// TODO: remove the need for this
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

async function main() {
  const inCluster = process.env.IN_CLUSTER !== 'false';
  logger.info({ inCluster }, 'cluster mode configured');
  let kubeApiUrl;
  let schemaToken;
  if (inCluster) {
    kubeApiUrl = 'https://kubernetes.default.svc';
    schemaToken = await fs.readFile(
      '/var/run/secrets/kubernetes.io/serviceaccount/token',
      'utf8'
    );
  } else if (process.env.KUBE_API_URL && process.env.TOKEN) {
    kubeApiUrl = process.env.KUBE_API_URL;
    schemaToken = process.env.TOKEN;
  } else {
    kubeApiUrl = 'http://localhost:8001';
    schemaToken = '';
  }
  const pubsub = new PubSub();
  const bareContext = { pubsub };

  const oasRaw = await getOpenApiSpec(kubeApiUrl, schemaToken);
  const oasWatchable = deleteDeprecatedWatchPaths(oasRaw);
  const subs = await getWatchables(oasWatchable);
  const oas = deleteWatchParameters(oasWatchable);
  const graphQlSchemaMap = await utilities.mapGraphQlDefaultPaths(oas);
  const k8PathKeys = Object.keys(oas.paths);
  const mappedK8Paths = utilities.mapK8ApiPaths(
    oas,
    k8PathKeys,
    graphQlSchemaMap
  );
  const schema = await createSchema(
    oas,
    kubeApiUrl,
    mappedK8Paths,
    subs.mappedWatchPath,
    subs.mappedNamespacedPaths
  );

  const server = new ApolloServer({
    schema,
    context: async ({ req, connection }) => {
      if (connection) {
        return {
          ...bareContext,
          authorization: connection.context.authorization,
          clusterURL: connection.context.clusterURL,
          clientId: connection.context.clientId,
          subId: await watch.generateSubId(),
        };
      }
      const token = req.headers.authorization || '';
      const clusterURL = req.headers.apiserverurl || '';
      if (token === '') {
        throw new Error('Missing authorization header.');
      }
      if (clusterURL === '') {
        throw new Error('Missing apiserverurl header.');
      }
      return {
        ...req,
        authorization: token,
        clusterURL,
      };
    },
    subscriptions: {
      path: '/subscriptions',
      onConnect: async (connectionParams, webSocket, context) => {

        const token = connectionParams.authToken || null;
        const clusterURL = connectionParams.apiserverurl || null;
        const clientId = connectionParams.clientId || null;
        if (!token) {
          throw new Error('Missing authorization header.');
        }
        if (!clusterURL) {
          throw new Error('Missing apiserverurl header.');
        }
        if (!clientId) {
          throw new Error('Missing clientId header.');
        }
        return {
          ...context,
          authorization: token,
          clusterURL,
          subId: await watch.generateSubId(),
          clientId
        };
      },
      onDisconnect: (webSocket, context) => {
        logger.info('Client Disconnected', context.request.socket.remoteAddress);
      },
    },
  });

  var PORT = `${process.env.SERVER_PORT}`;
  if (!process.env.SERVER_PORT) {
    PORT = 4000;
  }
  const app = express();
  app.use(cors());
  const versionJSON = nodeFs.readFileSync(path.join(__dirname, '../public/health.json')).toString();
  app.get('/health', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(versionJSON);
  });

  server.applyMiddleware({ app });

  const httpServer = http.createServer(app);
  server.installSubscriptionHandlers(httpServer);

  httpServer.listen(PORT, () => {
    logger.info(
      `🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`
    );
    logger.info(
      `🚀 Subscriptions ready at ws://localhost:${PORT}${server.subscriptionsPath}`
    );
  });
}

main().catch((e) =>
  logger.error({ error: e.stack }, 'failed to start qlkube server')
);
