const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username,password)=>{ //returns boolean
    // Filter the users array for any user with the same username and password
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn:  60 * 60 });

        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.body.review;  // review enviada como parámetro de consulta
    const username = req.session.authorization?.username;

    if (!username) {
        return res.status(401).json({ message: "Usuario no autenticado." });
    }

    if (!review) {
        return res.status(400).json({ message: "Debe incluir una reseña en la consulta." });
    }

    // Verificar si el libro existe
    const book = books[isbn];
    if (!book) {
        return res.status(404).json({ message: `No se encontró el libro con ISBN ${isbn}.` });
    }

    // Inicializar el objeto reviews si no existe
    if (!book.reviews) {
        book.reviews = {};
    }

    // Agregar o actualizar la reseña del usuario
    book.reviews[username] = review;

    return res.status(200).json({ 
        message: "Reseña agregada/modificada exitosamente.",
        reviews: book.reviews 
    });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization?.username;

    // Verifica si el usuario está autenticado
    if (!username) {
        return res.status(401).json({ message: "Usuario no autenticado." });
    }

    // Verifica si el libro existe
    const book = books[isbn];
    if (!book) {
        return res.status(404).json({ message: `No se encontró el libro con ISBN ${isbn}.` });
    }

    // Verifica si el libro tiene reseñas y si la del usuario existe
    if (!book.reviews || !book.reviews[username]) {
        return res.status(404).json({ message: `No se encontró una reseña de '${username}' para este libro.` });
    }

    // Elimina la reseña del usuario
    delete book.reviews[username];

    return res.status(200).json({ 
        message: `La reseña del usuario '${username}' fue eliminada exitosamente.`,
        reviews: book.reviews
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
