const mongoose = require('mongoose')

const bookSchema = new mongoose.Schema({
    name : {
        type: String,
        required: true
    },
    title : {
        type: String,
        required: true
    },
    description : {
        type: String,
        required : true
    },
    genre : {
        type: String,
        required: true
    },
    // pageCount : {
    //     type: Number,
    //     required: true
    // },
    bookType : {
        type: String
    },
    price : {
        type: Number,
        default: 0
    },
    createdAt : {
        type: Date,
        required: true,
        default: Date.now
    },
    content : {
        type: String,
        required: true
    },
    coverImage: {
       type: Buffer,
       required: true
   },
     coverImageType: {
       type: String,
       required: true
     }
});

bookSchema.virtual('coverImagePath').get(function() {
    if (this.coverImage != null && this.coverImageType != null) {
      return `data:${this.coverImageType};charset=utf-8;base64,${this.coverImage.toString('base64')}`
    }
  })

module.exports = mongoose.model('Book',bookSchema)