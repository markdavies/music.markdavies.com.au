const fs = require('fs')
const mergeImages = require('merge-images');
const { Canvas, Image } = require('node-canvas');
const readline = require('readline-sync');

let year = readline.question('Year: ');
let pages = readline.question('Max Pages: ');

fs.readFile('src/data.json', (err, fileData) => {

    let data = JSON.parse(fileData);
    let images = data[year].map(album => {
        return album.artwork;
    }).filter(image => {
        return image !== undefined;
    }).slice(0, pages * 9);

    images = sliceIntoChunks(images, 9);
    
    images.forEach((page, pageIndex) => {
        let pageImages = page.map((image, index) => {
            return { src: image, x: (index % 3) * 640, y: Math.floor(index / 3) * 640 };
        });

        mergeImages(pageImages, {
            width: 1920,
            height: 1920,
            Canvas: Canvas,
            Image: Image
        }).then(b64 => {
            var imageBuffer = decodeBase64Image(b64);
            fs.writeFile(`src/img/${year}-${pageIndex + 1}.jpg`, imageBuffer.data, err => {
                if(err) console.log(err);
            });
        });
    });

});

function sliceIntoChunks(arr, chunkSize) {
    const res = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
        const chunk = arr.slice(i, i + chunkSize);
        res.push(chunk);
    }
    return res;
}

function decodeBase64Image(dataString) {
    var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
    response = {};

    if (matches.length !== 3) {
        return new Error('Invalid input string');
    }

    response.type = matches[1];
    response.data = new Buffer(matches[2], 'base64');

    return response;
}