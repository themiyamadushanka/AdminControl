const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 86400, checkperiod: 43200 });


function setData(key, value) {
    cache.set(key, value);
    console.log(`Data cached: ${key}`);
}


function getData(key) {
    const value = cache.get(key);
    if (value) {
        console.log(`Cache hit: ${key}`);
    } else {
        console.log(`Cache miss: ${key}`);
    }
    return value;
}


function delData(key) {
    const deleted = cache.del(key);
    if (deleted) {
        console.log(`Cache deleted: ${key}`);
    } else {
        console.log(`No cache to delete: ${key}`);
    }
    return deleted;
}


module.exports = { setData, getData, delData };
