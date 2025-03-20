const axios = require('axios');
const bcrypt = require('bcrypt');

const users = [];
const reviews = {
  '9780140328721': [
      { username: 'user1', review: 'Amazing book!' },
      { username: 'user2', review: 'Loved the story.' }
  ]
};

// Fetch Books List
async function getBooksList() {
    try {
        const response = await axios.get('https://www.googleapis.com/books/v1/volumes?q=harry+potter');
        console.log(response.data);
    } catch (error) {
        console.error("Error fetching books list:", error);
    }
}

// Fetch Book by ISBN
async function getBookByISBN(isbn) {
    try {
        const response = await axios.get(`https://openlibrary.org/api/volumes/brief/json/${isbn}`);
        console.log(response.data);
    } catch (error) {
        console.error("Error fetching book by ISBN:", error);
    }
}

// Fetch Books by Author
async function getBooksByAuthor(author) {
    try {
        const response = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=inauthor:${author}`);
        console.log(response.data.items);
    } catch (error) {
        console.error("Error fetching books by author:", error);
    }
}

// Fetch Books by Title
async function getBooksByTitle(title) {
    try {
        const response = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=intitle:${title}`);
        const books = response.data.items;
        if (books) {
            books.forEach((book, index) => {
                console.log(`Book ${index + 1}: ${book.volumeInfo.title}`);
            });
        } else {
            console.log("No books found with the given title.");
        }
    } catch (error) {
        console.error("Error fetching books by title:", error);
    }
}

// Fetch Book Reviews
function getBookReview(isbn) {
    const bookReviews = reviews[isbn];
    if (bookReviews) {
        console.log(`Reviews for ISBN ${isbn}:`);
        bookReviews.forEach((r, index) => {
            console.log(`Review ${index + 1}: ${r.review} (by ${r.username})`);
        });
    } else {
        console.log(`No reviews found for ISBN ${isbn}.`);
    }
}

// Register User
async function registerUser(username, password) {
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        users.push({ username, password: hashedPassword });
        console.log(`User registered successfully: ${username}`);
    } catch (error) {
        console.error("Error registering user:", error);
    }
}

// Login User
async function loginUser(username, password) {
    try {
        const user = users.find((u) => u.username === username);
        if (!user) {
            console.log("User not found!");
            return;
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        console.log(isPasswordValid ? "Login successful!" : "Invalid password!");
    } catch (error) {
        console.error("Error logging in:", error);
    }
}

// Add or Modify Review
async function addOrModifyReview(username, isbn, reviewText) {
    try {
        const user = users.find((u) => u.username === username);
        if (!user) {
            console.log("User not found. Please register first.");
            return;
        }

        if (!reviews[isbn]) {
            reviews[isbn] = [];
        }

        const existingReview = reviews[isbn].find((r) => r.username === username);
        if (existingReview) {
            existingReview.review = reviewText;
            console.log(`Review updated for ${username}: ${reviewText}`);
        } else {
            reviews[isbn].push({ username, review: reviewText });
            console.log(`Review added for ${username}: ${reviewText}`);
        }
    } catch (error) {
        console.error("Error adding or modifying review:", error);
    }
}

// Delete Review
async function deleteReview(username, isbn) {
    try {
        const user = users.find((u) => u.username === username);
        if (!user) {
            console.log("User not found. Please register first.");
            return;
        }

        if (!reviews[isbn]) {
            console.log("No reviews found for the given ISBN.");
            return;
        }

        const reviewIndex = reviews[isbn].findIndex((r) => r.username === username);
        if (reviewIndex > -1) {
            reviews[isbn].splice(reviewIndex, 1);
            console.log(`Review deleted for ${username}.`);
        } else {
            console.log("Review not found for this user.");
        }
    } catch (error) {
        console.error("Error deleting review:", error);
    }
}

// Fetch All Books
async function getAllBooks() {
    try {
        const response = await axios.get('https://www.googleapis.com/books/v1/volumes?q=fiction');
        console.log("All books:", response.data.items.map((book) => book.volumeInfo.title));
    } catch (error) {
        console.error("Error fetching all books:", error);
    }
}

// Search Books
async function searchByISBN(isbn) {
    try {
        const response = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
        if (response.data.items && response.data.items.length > 0) {
            console.log(`Book found by ISBN (${isbn}): ${response.data.items[0].volumeInfo.title}`);
        } else {
            console.log(`No books found for ISBN: ${isbn}`);
        }
    } catch (error) {
        console.error("Error searching by ISBN:", error.message);
    }
}

async function searchByAuthor(author) {
    try {
        const response = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=inauthor:${author}`);
        console.log("Books by author:", response.data.items.map((book) => book.volumeInfo.title));
    } catch (error) {
        console.error("Error searching by author:", error);
    }
}

// Example Usage
(async () => {
    await getBooksList();
    await getBookByISBN('9780140328721');
    await getBooksByAuthor('J.K. Rowling');
    await getBooksByTitle('Goblet of Fire');
    await registerUser('testUser', 'testPass123');
    await loginUser('testUser', 'testPass123');
    await addOrModifyReview('testUser', '9780140328721', 'Loved this book!');
    await deleteReview('testUser', '9780140328721');
    await getAllBooks();
    await searchByISBN('9780140328721');
    await searchByAuthor('J.K. Rowling');
})();
