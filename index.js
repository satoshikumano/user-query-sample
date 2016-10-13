let popsicle = require('popsicle');
let Promise = require('bluebird');
let config = require('./config.js');

function getUsers(paginationKey) {
    return new Promise(function(resolve, reject) {
        popsicle.request({
                method: 'POST',
                url: 'https://' + config.appHost + '/api/apps/' + config.appID + '/users/query',
                body: {
                    userQuery: {
                        clause: {
                            type: 'all'
                        },
                        orderBy: 'loginName',
                        descending: false,
                    },
                    bestEffortLimit: 10,
                    paginationKey: paginationKey
                },
                headers: {
                    'Content-Type': 'application/vnd.kii.userqueryrequest+json',
                    'Authorization': 'Bearer ' + config.adminToken
                }
        }).use(popsicle.plugins.parse('json'))
        .then(function(res) {
                if (res.statusType() != 2) {
                    reject(new Error(res.body));
                }
                //console.log(res);
                let users = res.body.results;
                users.forEach(function(u) {
                        // ここでは例としてユーザー名を表示していますが
                        // 各ユーザーのデータにアクセスして必要な処理を行ってください。
                        console.log(u.loginName);
                });
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
                            resolve();
                        }
                }).catch(function(error) {
                        reject(error);
                });
            }
            proc(promise);
    });
}

loop(getUsers()).then(function() {
        console.log('operation succeeded');
}).catch(function(error) {
        console.log('operation failed.');
        console.log(error);
});
