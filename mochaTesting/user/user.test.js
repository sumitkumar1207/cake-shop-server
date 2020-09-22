const assert = require('chai').assert;
const axios = require('axios');
let jwt_token = require('../token');
jwt_token = jwt_token.jwt_token;
let data = []

function makeid(length) {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

let params = {
    login: {
        url: `http://localhost:3800/userslogin`,
        method: 'POST',
        data: data[0]
    },
    userslist: {
        url: `http://localhost:3800/users`,
        method: 'GET',
        headers: { 'Authorization': jwt_token }
    },
    adduser: {
        url: `http://localhost:3800/users`,
        method: 'POST',
        headers: { 'Authorization': jwt_token },
        data: data[1],
    },
    edituser: {
        url: `http://localhost:3800/users/${data[2].user_id}`,
        method: 'PUT',
        headers: { 'Authorization': jwt_token },
        data: data[2],
    },
}

describe('In user controller', function () {
    this.timeout(200000);
    describe('userlogin', function () {
        it('should return the correct value', async function () {
            await axios(params.login)
                .then(res => {
                    assert.isObject(res.data)
                    assert.equal(res.data.status, true);
                }).catch(err => { console.log(err); assert.fail("Request Failed"); })
        })
    })
    describe('userslist', function () {
        it('should return the correct value', async function () {
            await axios(params.userslist)
                .then(res => {
                    assert.isObject(res.data)
                    assert.equal(res.data.status, true);
                }).catch(err => { console.log(err); assert.fail("Request Failed"); })
        })
    })
    describe('adduser', function () {
        it('should return the correct value', async function () {
            await axios(params.adduser)
                .then(res => {
                    assert.isObject(res.data)
                    assert.equal(res.data.status, true);
                }).catch(err => { console.log(err); assert.fail("Request Failed"); })
        })
    })
    describe('edituser', function () {
        it('should return the correct value', async function () {
            await axios(params.edituser)
                .then(res => {
                    assert.isObject(res.data)
                    assert.equal(res.data.status, true);
                }).catch(err => { console.log(err); assert.fail("Request Failed"); })
        })
    })
})