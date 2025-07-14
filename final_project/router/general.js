const express = require('express');
const  axios = require('axios');
let books = require("./booksdb.js");
const parse = require('nodemon/lib/cli/parse.js');
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password; 

  if (!username || !password) {
    return res.status(400).json({message: "Username and password are required"});
  }

  if (isValid(username)) {
    return res.status(400).json({message: "User already exists"});
  }

  users.push({ "username": username, "password": password });
  return res.status(201).json({message: "User registered successfully"});
});

// Async function to get books
const getBooks = () => {
  return new Promise((resolve, reject) => {
    resolve(books);
  });
};

// Get the book list available in the shop
public_users.get('/',async function (req, res) {
  try {
    const bookList = await getBooks();
    res.status(200).json(bookList);
  } catch (error) {
    return res.status(500).json({message: "Error fetching books"});
  }
});

const getBookByISBN = (isbn) => {
  return new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject({message: "Book not found"});
    }
  });
};

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
 try {
    const isbn = req.params.isbn;
    const bookIsbn = parseInt(isbn);
    const book = await getBookByISBN(bookIsbn);

    res.status(200).json(book);
  } catch (error) {
    return res.status(404).json(error);
  }
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  const booksByAuthor = Object.values(books).filter(book => book.author.toLowerCase() === author.toLowerCase());

  if (booksByAuthor.length > 0) {
    return res.status(200).json(booksByAuthor);   
  }
  return res.status(404).json({message: "No books found for this author"});
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  const booksByTitle = Object.values(books).filter(book => book.title.toLowerCase() === title.toLowerCase());

  if (booksByTitle.length > 0) {
    return res.status(200).json(booksByTitle);
  }
  return res.status(404).json({message: "No books found with this title"});
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book && book.reviews && Object.keys(book.reviews).length > 0) {
    return res.status(200).json(book.reviews);
  }

  return res.status(404).json({message: "No reviews added to this book"});
});

module.exports.general = public_users;
