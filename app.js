const path = require('path');
const { exec } = require('child_process');
const express = require('express');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const app = express();

app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: path.join(__dirname, 'uploads/tmp')
}));

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.use('/public', express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.post('/', (req, res) => {
    const file = req.files.file;
    if (!file) {
        return res.status(500).send('Error');
    }

    const newFileName = path.join(__dirname, 'uploads/original/' + file.name);
    file.mv(newFileName, err => {
        if (err) {
            return res.status(500).send(err);
        }

        const securedFileName = path.join(__dirname, 'uploads/secured/' + file.name);
        exec('cat "' + newFileName + '" | secure-spreadsheet --password "' + req.body.password + '" --input-format xlsx > "' + securedFileName  + '"', (err, stdout, stderr) => {
            if (err) {
                return res.status(500).send(err);
            }

            res.download(securedFileName);
        });
    });
});

app.listen(3000, () => {
    console.warn('Server started on port 3000');
});