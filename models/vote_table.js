var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var voteTableSchema = new Schema({
	optionId:{type:Number, unique: true},
	optionName:{type:String},
	votes: {type: Number, default: 0}
});

var voteTable = mongoose.model('voteTable',voteTableSchema);

module.exports = voteTable;