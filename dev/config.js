var fs = require('fs');

var rgx = {
    orderTxt: /order\.txt$/,
    index: /\/index$/,

    nonSpecial: /\/[._]/,

    leadingTilt: /^.*~/,

    md: /\.md$/,
    less: /\.less$/,
    demo: /\.demo\.html$/,
    share: /\.share\.html$/,
    demoLess: /\.demo\.less$/,
    demoJs: /\.demo\.js$/,
    publicLess: /\.public\.less$/,
    privateLess: /\.private\.less$/,
    commonLess: /\.common\.less$/,

    demoPage: /\.demo$/,

    demoTag: /@(inline|iframe|page)(![^:.]+)?(\.[^:]+)?:([^@]+)@/g,

    indexMarkerSingle: /@#([^:]*):(\{[^}]+\})#@/,
    indexMarkerRepeat: /@#([^:]*):(\{[^}]+\})#@/g,

    _empty_: ''
};

var dataFolders = {
    eux: __dirname + '/../../__eux-lab-data/'
};

dataFolders.simpleData = dataFolders.eux + 'simple-data/';

module.exports = {
    appName: 'eux-lab',
    rgx: rgx,
    globalClass: 'eux-lab-demo-page',
    port: 7788,

    backendBase: '/backend',

    dataFolders: dataFolders
};