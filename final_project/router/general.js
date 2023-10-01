const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.use(express.json());

public_users.post('/register', function (req, res) {
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }

  // Check if the username already exists
  if (users.find(user => user.username === username)) {
    return res.status(400).json({ error: "Username already exists." });
  }

  // If username is unique, add the new user to the users array
  users.push({ username, password });

  res.status(201).json({ message: "User registered successfully." });
});


// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  return res.status(200).json({ books });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;

  // Check if the book with the provided ISBN exists in the books database
  if (books[isbn]) {
    // Book found, send its details as a JSON response
    res.json(books[isbn]);
  } else {
    // Book not found, send a 404 response
    res.status(404).json({ error: 'Book not found' });
  }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;

  // Create an array to store books by the matching author
  const matchingBooks = [];

  // Iterate through the keys (ISBNs) of the books database
  for (const isbn in books) {
    if (books[isbn].author === author) {
      matchingBooks.push({ isbn, ...books[isbn] });
    }
  }

  // Check if any books by the author were found
  if (matchingBooks.length > 0) {
    // Send the matching books as a JSON response
    res.json(matchingBooks);
  } else {
    // No books by the author found, send a 404 response
    res.status(404).json({ error: 'Books by the author not found' });
  }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  const title = req.params.title;

  // Create an array to store books by the matching author
  const matchingBooks = [];

  // Iterate through the books database to find books with the provided title
  for (const isbn in books) {
    if (books[isbn].title === title) {
      matchingBooks.push({ isbn, ...books[isbn] });
    }
  }

  // Check if any books by the author were found
  if (matchingBooks.length > 0) {
    // Send the matching books as a JSON response
    res.json(matchingBooks);
  } else {
    // No books by the author found, send a 404 response
    res.status(404).json({ error: 'Books by the author not found' });
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;

  // Check if the book with the provided ISBN exists in the books database
  if (books[isbn]) {
    // Check if there are reviews for the book
    const bookReviews = books[isbn].reviews;

    if (Object.keys(bookReviews).length > 0) {
      // Send the book reviews as a JSON response
      res.json(bookReviews);
    } else {
      // No reviews for the book, send a message
      res.json({ message: 'No reviews available for this book' });
    }
  } else {
    // Book not found, send a 404 response
    res.status(404).json({ error: 'Book not found' });
  }
});

function getBookList(){
  return new Promise((resolve,reject)=>{
    resolve(books);
  })
}


public_users.get('/',function (req, res) {
  getBookList().then(
    (bk)=>res.send(JSON.stringify(bk, null, 4)),
    (error) => res.send("denied")
  );  
});

function getFromTitle(title){
  let output = [];
  return new Promise((resolve,reject)=>{
    for (var isbn in books) {
      let book_ = books[isbn];
      if (book_.title === title){
        output.push(book_);
      }
    }
    resolve(output);  
  })
}

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  getFromTitle(title)
  .then(
    result =>res.send(JSON.stringify(result, null, 4))
  );
});

function getFromISBN(isbn) {
  return new Promise((resolve, reject) => {
    const book = books[isbn];
    if (book) {
      resolve(book);
    } else {
      reject("Unable to find book!");
    }
  });
}

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
  const isbn = req.params.isbn;
  try {
    const book = await getFromISBN(isbn);
    res.send(JSON.stringify(book, null, 4));
  } catch (error) {
    res.send(error);
  }
});


function getFromAuthor(author) {
  return new Promise((resolve, reject) => {
    const booksByAuthor = Object.values(books).filter((book) => book.author === author);
    resolve(booksByAuthor);
  });
}


public_users.get('/author/:author', async (req, res) => {
  const author = req.params.author;
  try {
    const booksByAuthor = await getFromAuthor(author);
    res.send(JSON.stringify(booksByAuthor, null, 4));
  } catch (error) {
    res.send(error);
  }
});


function getFromTitle(title) {
  return new Promise((resolve, reject) => {
    const booksWithTitle = Object.values(books).filter((book) => book.title === title);
    resolve(booksWithTitle);
  });
}


public_users.get('/title/:title', async (req, res) => {
  const title = req.params.title;
  try {
    const booksWithTitle = await getFromTitle(title);
    res.send(JSON.stringify(booksWithTitle, null, 4));
  } catch (error) {
    res.send(error);
  }
});



module.exports.general = public_users;
