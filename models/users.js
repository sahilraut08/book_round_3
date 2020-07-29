const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name : {
        type: String,
        required: true
    },
    email : {
        type: String,
        required: true
    },
    password : {
        type: String,
        required: true
    },
    createdBook : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
    purchasedBook : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
    issuedBook : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }]
});

module.exports = mongoose.model('User',userSchema)