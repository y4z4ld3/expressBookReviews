const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (username && password) {
        // Check if the user does not already exist
        if (!doesExist(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user."});
});

const doesExist = (username) => {
    // Filter the users array for any user with the same username
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

// Función que retorna libros como promesa
const getBookReview = (isbn) => {
    return new Promise((resolve, reject) => {
        const book = books[isbn];
        if (book && book.reviews) {
            resolve(book.reviews);
        } else {
            reject("No se encontraron reseñas para ese ISBN.");
        }
    });
};

// Get the book list available in the shop
const getBooks = () => {
    return new Promise((resolve, reject) => {
        resolve(books);
    });
};
public_users.get('/',function (req, res) {
    getBooks()
    .then(data => res.status(200).json(data))
    .catch(err => res.status(500).json({ message: err }));    
});

// Get book details based on ISBN
const getBookByISBN = (isbn) => {
    return new Promise((resolve, reject) => {
        const book = books[isbn];
        if (book) {
            resolve(book);
        } else {
            reject("Libro no encontrado");
        }
    });
};
public_users.get('/isbn/:isbn',function (req, res) {
    getBookByISBN(req.params.isbn)
    .then(data => res.status(200).json(data))
    .catch(err => res.status(404).json({ message: err }));
 });
  
// Get book details based on author
const getBooksByAuthor = (author) => {
    return new Promise((resolve) => {
        const result = Object.entries(books)
            .filter(([id, libro]) => libro.author.toLowerCase().includes(author.toLowerCase()))
            .map(([id, libro]) => ({ id, ...libro }));
        resolve(result);
    });
};
public_users.get('/author/:author',function (req, res) {
    getBooksByAuthor(req.params.author)
        .then(data => res.status(200).json(data))
        .catch(err => res.status(500).json({ message: err }));
});

// Get all books based on title
const getBooksByTitle = (title) => {
    return new Promise((resolve) => {
        const result = Object.entries(books)
            .filter(([id, libro]) => libro.title.toLowerCase().includes(title.toLowerCase()))
            .map(([id, libro]) => ({ id, ...libro }));
        resolve(result);
    });
};
public_users.get('/title/:title',function (req, res) {
    getBooksByTitle(req.params.title)
        .then(data => res.status(200).json(data))
        .catch(err => res.status(500).json({ message: err }));    
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    getBookReview(req.params.isbn)
        .then(data => res.status(200).json(data))
        .catch(err => res.status(404).json({ message: err }));    
});

module.exports.general = public_users;
