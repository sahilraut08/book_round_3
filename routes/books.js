const express = require('express');
const router = express.Router();
const Book = require('../models/book');
const User = require('../models/users');
const { session } = require('passport');
const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif']

//All Books
router.get('/allbooks', checkAuthenticated, async (req, res) => {
    let query = Book.find()
    if(req.query.title != null && req.query.title != '') {
        query = query.regex('title', new RegExp(req.query.title, 'i'))
    }
    try {
        const book = await query.exec()
        res.render('books/all.ejs', {
            book: book,
            searchOption: req.query
        });
    } catch(error) {
        console.log(error)
    }
});

//New Books
router.get('/add', checkAuthenticated,(req, res) => {
    res.render('books/add.ejs', { book: new Book()});
});

router.post('/add', async (req, res) => {
    // const name = req.user.name;
    // console.log(name)
    let book = new Book({
        name: req.body.name,
        title: req.body.title,
        createdAt: req.body.createdAt,
        genre: req.body.genre,
        description: req.body.description,
        pageCount: req.body.pageCount,
        bookType: req.body.bookType,
        price: req.body.price,
        content: req.body.content
    })
    saveCover(book, req.body.cover)
    try {
        book = await book.save();
        const user = await User.findById(req.user.id)
        user.createdBook.push(book._id);
        user.save();
        res.redirect('/books/mybooks')
    } catch (e) {
        console.log('error')
        res.render('books/add.ejs');
    }
});

//My Books
router.get('/mybooks',checkAuthenticated, async (req, res) => {
    // console.log(req.user.name);
    try {
          const book = await User.findById(req.user.id).populate('createdBook')
              res.render('books/mybooks.ejs', {
                  book: book.createdBook
           })          
    } catch (error) {
        console.log(error)
        res.redirect('/books/mybooks');
    }
});

//Purchased Books
router.post("/purchased/:id", async (req, res) => {
    console.log(req.params.id)
    try {
        const book = await Book.findById(req.params.id)
        const user = await User.findById(req.user.id)
        user.purchasedBook.push(book._id);
        user.save();
        res.redirect('/books/purchased')    
    } catch (error) {
        console.log(error)
    }
})

router.get("/purchased", async (req, res) => {
    console.log(req.user.id);
    console.log('hello')
    try {
          const book = await User.findById(req.user.id).populate('purchasedBook')
              res.render('books/purchased-books.ejs', {
                  book: book.purchasedBook
           })          
    } catch (error) {
        console.log(error)
        res.redirect('/books/dashboard');
    }
})

//Issued Books
router.post("/issue/:id", async (req, res) => {
    try {
        const book = await Book.findById(req.params.id)
        const user = await User.findById(req.user.id)
        user.issuedBook.push(book._id);
        user.save();
        res.redirect('/books/issued')    
    } catch (error) {
        console.log(error)
    }
})

router.get("/issued", async (req, res) => {
    try {
          const book = await User.findById(req.user.id).populate('issuedBook')
              res.render('books/issued-books.ejs', {
                  book: book.issuedBook
           })          
    } catch (error) {
        console.log(error)
        res.redirect('/books/dashboard');
    }
})

//Paid Books
router.get('/paid', async (req, res) => {
    try {
        const book = await Book.find({bookType: 'paid'})
        res.render('books/paid-books.ejs', {
            book : book
        })
    } catch (error) {
        console.log(error)
        res.redirect('/books/dashboard')
    }
})

//Free Books
router.get('/free', async (req, res) => {
    try {
        const book = await Book.find({bookType: 'free'})
        res.render('books/free-books.ejs', {
            book : book
        })
    } catch (error) {
        console.log(error)
        res.redirect('/books/dashboard')
    }
})

//getBooks
router.get('/getbook/:id', async (req,res)=>{
    try {
        const book = await Book.findById(req.params.id)
            res.render('books/getbook.ejs', {
                book: book
         })          
    } catch (error) {
      console.log(error)
      res.redirect('/books/mybooks');
    }
})


//DELETE
router.delete("/:id", checkAuthenticated, async (req, res) => {
    await Book.findOneAndDelete( {_id: req.params.id});
    res.redirect('/books/mybooks');
  });


//Edit Book
router.get('/edit/:id', checkAuthenticated, async (req, res) => {
    try {
        const book = await Book.findOne({_id: req.params.id});
        res.render('books/edit.ejs', {
            book: book
        });
    } catch (error) {
        res.redirect('/edit/:id')
    }
})

router.put('/:id', async (req, res, next) => {
    req.book = await Book.findOne({_id: req.params.id});
    next();
},
 saveBookAndRedirect('books/edit.ejs')
);

//Read
router.get('/read/:id', checkAuthenticated,async (req, res) => {
      try {
        const book = await Book.findById(req.params.id)
            res.render('books/read.ejs', {
                book: book
         })          
    } catch (error) {
      console.log(error)
      res.redirect('/books/mybooks');
    }
  }) 



function saveBookAndRedirect(path) {
    return async (req, res) => {
        let book = req.book;
        book.title = req.body.title;
        book.genre = req.body.genre;
        book.pageCount = req.body.pageCount;
        book.description = req.body.description;
        book.bookType = req.body.bookType,
        book.price = req.body.price,
        book.content = req.body.content,
        saveCover(book, req.body.cover)
        try {
            book = await book.save();
            res.redirect('/books/mybooks');
        } catch (error) {
            console.log(error)
            res.render(path, { book: book });
        }
    };
}

function saveCover(book, coverEncoded) {
    if (coverEncoded == null) return
    const cover = JSON.parse(coverEncoded)
    if (cover != null && imageMimeTypes.includes(cover.type)) {
      book.coverImage = new Buffer.from(cover.data, 'base64')
      book.coverImageType = cover.type
    }
  }

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
}

module.exports = router