var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var voteTableSchema = new Schema({
	options:[String]
});

var voteTable = mongoose.model('voteTable',voteTableSchema);

module.exports = voteTable;