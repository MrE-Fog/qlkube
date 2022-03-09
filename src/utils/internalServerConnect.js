const Crypto = require('crypto');
var events = require('events');
const { createClient } = require('graphql-ws');
const ws = require('ws'); // yarn add ws


const connectSub = (
    internalServerUrl, 
    emitterId, 
    clientId, 
    query, 
    connectionParams,
    pairSubToClient
) => {
    try {
      // console.log('CONECTING TO', internalServerUrl, query);
      const em = new events.EventEmitter();
      const client = createClient({
        url: internalServerUrl,
        webSocketImpl: ws,
        /**
         * Generates a v4 UUID to be used as the ID.
         * Reference: https://gist.github.com/jed/982883
         */
        generateID: () =>
          ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
            (c ^ (Crypto.randomBytes(1)[0] & (15 >> (c / 4)))).toString(16),
          ),
          connectionParams
      });
  
      (async () => {
        const onNext = (val) => {
          // console.log('recieved', val)
          em.emit(emitterId, val);
        };
        await client.subscribe(
          {
            query: query,
          },
          {
            next: onNext,
            error: (er) => console.log('Subscription error!' ,er),
            complete: (er) => console.log('Subscription complete!', connectionParams.clientSubId),
            onclose: () => console.log('onclose '),
            
          },
        );
        const internalSubId = Date.now().toString(36) + Math.random().toString(36).substr(2);
        pairSubToClient(clientId, client, internalSubId, connectionParams.clientSubId)
      })();
  
      return em;
    } catch (error) {
      console.log('Connection failed...', error)
    }
}

const connectQuery = async(internalServerUrl, query, connectionParams) => {
    const client = createClient({
      url: internalServerUrl,
      webSocketImpl: ws,
      /**
       * Generates a v4 UUID to be used as the ID.
       * Reference: https://gist.github.com/jed/982883
       */
      generateID: () =>
        ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
          (c ^ (Crypto.randomBytes(1)[0] & (15 >> (c / 4)))).toString(16),
        ),
        connectionParams
    });
    let wow = await (async () => {
      return result = await new Promise((resolve, reject) => {
        let result
        client.subscribe(
          {
            query: query
          },
          {
            next: (data) => {
              result = data
              console.log('QUERY DATA next', data)
            },
            error: (err) => console.log('QUERY ERROR', err),
            complete: () => resolve(result)
          }
        )
      })
    })()
    return wow;
  }


  exports.connectSub = connectSub;
  exports.connectQuery = connectQuery;
