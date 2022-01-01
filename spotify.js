const https = require('https')
const fs = require('fs')
const readline = require('readline-sync')

let data = {};
let accessToken;


fs.readFile('src/creds.json', (err, fileData) => {
    data = JSON.parse(fileData);

    var expires = parseInt(data.expires)
    var now = new Date();

    if(expires < (now.getTime() / 1000)){
        console.log('Token expired, refreshing');
        authorise();
    }else{
        accessToken = data.access_token;
        run();
    }

});


function authorise(){

    const clientId = '25bd8e32d0f6414cbcbdf3f0d411128b';
    const clientSecret = '218ea737be674c6f8555890474d30e85';

    let options = {
        hostname: 'accounts.spotify.com',
        path: '/api/token',
        port: 443,
        method: 'POST',
        headers: {
            'Authorization' : 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
            'Content-Type' : 'application/x-www-form-urlencoded'
        }
    };

    const req = https.request(options, res => {

        res.on('data', d => {
            var now = new Date();
            let creds = JSON.parse(d);
            let data = {
                access_token: creds.access_token,
                expires: (Math.round(now.getTime() / 1000) + creds.expires_in)
            };

            fs.writeFileSync('src/creds.json', JSON.stringify(data))

            accessToken = creds.access_token;
            run();

        });

    });

    req.on('error', (e) => {
        console.error(e);
    });

    let params = new URLSearchParams();
    params.append('grant_type', 'client_credentials')

    req.write(params.toString());
    req.end();

}

function run(){

    fs.readFile('src/data.json', (err, fileData) => {
        data = JSON.parse(fileData);

        Object.keys(data).forEach(year => {
            console.log('\x1b[33m', year);

            let promises = [];

            data[year].forEach((album, index) => {
                if(album.link === undefined){
                    console.log('\x1b[32m%s\x1b[0m', `#${index + 1} ${album.title} - ${album.artist}`);
                    promises.push(findAlbum(album, year, index));
                }
            });

            Promise.allSettled(promises).then(results => {
                results.forEach(result => {
                    if(result.status == 'fulfilled' && result.value.data){
                        data[result.value.year][result.value.index] = result.value.data;
                    }
                });
                fs.writeFileSync('src/data.json', JSON.stringify(data, null, 4))
                console.log(data);
            });

        });
    });
}

async function findAlbum(album, year, index){

    var parts = []; 
    parts.push('q=' + encodeURIComponent(`${album.title}`));
    parts.push('type=album');

    let options = {
        hostname: 'api.spotify.com',
        port: 443,
        method: 'GET',
        path: `/v1/search?${parts.join('&')}`,
        headers: { 
            'Authorization': `Bearer ${accessToken}`,
            'Cache-Control' : 'max-age=0'
        }
    }

    return new Promise((resolve) => {
        https.get(options, res => {
            let body = '';

            res.on('data', chunk => {
                body += chunk;
            });

            res.on('end', () => {
                try {
                    let json = JSON.parse(body)
                    let chosen = 0;
                    
                    if(json.albums.items.length > 1){

                        json.albums.items.forEach((item, index) => {
                            let artists = item.artists.map(artist => {
                                return artist.name
                            }).join(', ');
                            console.log(`${index + 1}. ${item.name} / ${artists} / ${item.type}`);
                        });
                        console.log(`0. None`);

                        let choice = readline.question('Choose option: ');
                        chosen = parseInt(choice) - 1;
                    }

                    if(chosen == -1 || json.albums.items.length == 0){

                        resolve({
                            year: year,
                            index: index,
                            data: null
                        });

                    }else{

                        let result = json.albums.items[chosen];

                        let returnData = {
                            title: result.name,
                            artist: result.artists.map(artist => {
                                return artist.name
                            }).join(', '),
                            artwork: result.images[0].url,
                            link: result.external_urls.spotify
                        };

                        resolve({
                            year: year,
                            index: index,
                            data: returnData
                        });
                    }

                } catch (error) {
                    console.error(error.message);
                };
            });
        }).on('error', error => {
            console.error(error.message);
        });

    })
}