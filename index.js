const mysql = require("mysql");
const inquirer = require("inquirer");
require("console.table");

// create the connection information for the sql database
const connection = mysql.createConnection({
    host: "localhost",
    // Your port; if not 3306
    port: 3306,
    // Your username
    user: "root",
    // Your password
    password: "password",
    database: "books_db",
});


const getBooksAndAuthorsData = () => {
    connection.query("SELECT title, firstName, lastName FROM books INNER JOIN authors ON books.authorId = authors.id", (err, results) => {
        console.table(results)
        setTimeout(mainMenu, 2000)
    })
}

const createAuthor = () => {
    inquirer.prompt([{
        name: "firstName",
        type: "text",
        message: "What is the author's first name?",
    }, {
        name: "lastName",
        type: "text",
        message: "What is the author's last name?",
    }]).then(({ firstName, lastName }) => {
        // const firstName = answers.firstName
        // const lastName = answers.lastName
        // const {firstName, lastName} = answers
        connection.query("INSERT INTO authors SET ?", {
            firstName: firstName,
            lastName: lastName
        }, (err, results) => {
            if (err) throw err
            console.log("======================")
            console.log("Author Added")
            console.log("======================")
        })



    })
}


const createBook = () => {
    connection.query("SELECT * FROM authors", (err, results) => {
        if (err) throw err
        // console.log('author results', results)
        inquirer.prompt([{
            type: "text",
            name: "bookName",
            message: "Please enter the name of the book:"
        }, {
            type: "rawlist",
            name: "bookAuthor",
            message: "Please select the book's author:",
            choices: function () {
                const choicesArray = []
                for (let i = 0; i < results.length; i++) {
                    choicesArray.push(results[i].firstName + " " + results[i].lastName)
                }
                return choicesArray
            }
        }]).then(({ bookName, bookAuthor }) => {
            const [firstName, lastName] = bookAuthor.split(" ")
            const [foundAuthor] = results.filter(author => author.firstName === firstName && author.lastName === lastName)

            connection.query("INSERT INTO books SET ?", {
                title: bookName,
                authorId: foundAuthor.id
            }, (err, results) => {
                if (err) throw err
                console.log("======================")
                console.log("Book Added")
                console.log("======================")
                setTimeout(mainMenu, 2000)
            })

        })
    })
}

const mainMenu = () => {
    inquirer.prompt([{
        name: "menuChoice",
        type: "rawlist",
        message: "What do you want to do?",
        choices: ["View Books and Authors", "Add a new author", "Add a new book", "Quit"]
    }]).then(({ menuChoice }) => {
        switch (menuChoice) {
            case "View Books and Authors":
                getBooksAndAuthorsData()
                break;
            case "Add a new author":
                createAuthor()
                break;
            case "Add a new book":
                createBook()
                break;
            case "Quit":
                connection.end()
                break;
            default:
                console.log("something went wrong")
                break;
        }
    })
}

mainMenu()