var path = require('path');

module.exports = {
    parser: 'sugarss',
    plugins: [
        require('postcss-easy-import')({
            'extensions': ['.sss']
        }),
        require('postcss-simple-vars'),
        require('postcss-nested'),
        require('postcss-calc'),
        require('cssnano')({
            preset: 'default',
        })
    ]
};
