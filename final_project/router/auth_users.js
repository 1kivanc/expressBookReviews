const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

regd_users.use(express.json());

let users = [];

const isValid = (username) => {
  // Write code to check if the username is valid
  // You can implement your validation logic here
  // For example, check if the username exists in the `users` array
  return users.some(user => user.username === username);
}

const authenticatedUser = (username, password) => {
  // Write code to check if username and password match the one we have in records.
  // You should implement your authentication logic here
  // For example, check if the provided username and password match a user in the `users` array
  const user = users.find(user => user.username === username && user.password === password);
  return user !== undefined;
}

// Endpoint for user login
regd_users.post("/login", (req,res) => {
  //Write your code here
  console.log("login: ", req.body);
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({message: "Error logging in"});
  }

  if (authenticatedUser(username,password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = {
            accessToken,username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({message: "Invalid Login. Check username and password"});
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
    const isbn = req.params.isbn;
    const review = req.body.review;
    const username = req.session.authorization.username;
    console.log("add review: ", req.params, req.body, req.session);
    if (books[isbn]) {
        let book = books[isbn];
        book.reviews[username] = review;
        return res.status(200).send("Review successfully posted");
    }
    else {
        return res.status(404).json({message: `ISBN ${isbn} not found`});
    }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  if (books[isbn]) {
    let book = books[isbn];
    if (book.reviews.hasOwnProperty(username)) {
      // Check if the review exists for the user
      delete book.reviews[username];
      return res.status(200).send("Review successfully deleted");
    } else {
      return res.status(404).json({ message: "Review not found for this user" });
    }
  } else {
    return res.status(404).json({ message: `ISBN ${isbn} not found` });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
