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

module.exports = {
    appName: 'acard',
    rgx: rgx,
    globalClass: 'acard',
    port: 7788
};