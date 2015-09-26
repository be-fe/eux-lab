var fs = require('fs');

var rgx = {
    orderTxt: /order\.txt$/,
    index: /\/index$/,

    nonSpecial: /^[._]/,

    leadingTilt: /^.*~/,

    md: /\.md$/,
    less: /\.less$/,
    demo: /\.demo\.html$/,
    share: /\.share\.html$/,
    demoLess: /\.demo\.less$/,
    publicLess: /\.public\.less$/,
    privateLess: /\.private\.less$/,
    commonLess: /\.common\.less$/,

    demoPage: /\.demo$/,

    demoTag: /@(inline|iframe|page)(![^:]+)?:([^@]+)@/g,

    _empty_: ''
};

var dataFolders = {
    eux: __dirname + '/../../__eux-lab-data/'
};

dataFolders.simpleData = dataFolders.eux + 'simple-data/';

module.exports = {
    appName: 'acard',
    rgx: rgx,
    globalClass: 'acard',
    port: 7788,

    dataFolders: dataFolders
};