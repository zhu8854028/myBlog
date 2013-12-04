/**
 * Created by fancy on 13-12-2.
 */
var settings = require('../settings');
var Db = require('MongoDb').Db;
var Connection = require('MongoDb').Connection;
var Server = require('MongoDb').Server;
module.exports = new Db(settings.db, new Server(settings.host, Connection.DEFAULT_PORT, {}));