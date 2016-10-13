let popsicle = require('popsicle');
let Promise = require('bluebird');

// Replace it with your app id.
let appID = '__APP_ID__';
// Replace it with your app key.
let appKey = '__APP_KEY__';

let appHost = 'api-jp.kii.com'

// Replace it with Obtained admin token.
let adminToken = '__ADMIN_TOKEN__';

let userCount = 0;

function getUsers(paginationKey) {
    return new Promise(function(resolve, reject) {
        popsicle.request({
                method: 'POST',
                url: 'https://' + appHost + '/api/apps/' + appID + '/users/query',
                body: {
                    userQuery: {
                        clause: {
                            type: 'all'
                        }
                    },
                    bestEffortLimit: 10,
                    paginationKey: paginationKey
                },
                headers: {
                    'Content-Type': 'application/vnd.kii.userqueryrequest+json',
                    'Authorization': 'Bearer ' + adminToken
                }
        }).use(popsicle.plugins.parse('json'))
        .then(function(res) {
                //console.log(res);
                let users = res.body.results;
                users.forEach(function(u) {
                        // ここでは例としてユーザーをカウントしていますが
                        // 各ユーザーのデータにアクセスして必要な処理を行ってください。
                        userCount++;
                });
                console.log('count:' + userCount);
                let nextPaginationKey = res.body.nextPaginationKey;
                resolve(nextPaginationKey);
        })
        .catch(function(error) {
                reject(error);
        });
    });
}

function loop(promise) {
    return new Promise(function(resolve, reject) {
            let proc = function(promise) {
                promise.then(function(paginationKey) {
                        if (paginationKey) {
                            proc(getUsers(paginationKey));
                        } else {
                            resolve(userCount);
                        }
                }).catch(function(error) {
                        reject(error);
                });
            }
            proc(promise);
    });
}

loop(getUsers()).then(function(userCount) {
        console.log('operation succeeded');
        console.log('user count: ' + userCount);
}).catch(function(error) {
        console.log('operation failed.');
        console.log(error);
});
