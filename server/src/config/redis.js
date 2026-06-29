const {createClient} = require("redis");
async function handleRedisCaching(){
    const client = createClient({url : 'redis://127.0.0.1:6379'});

    client.on('error', err => console.log('Redis Setup Error', err));
    client.on('connect', () => console.log('Connected to Redis successfully!'));
    await client.connect();
    
}


module.exports = handleRedisCaching;