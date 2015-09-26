var npath = require('path');
var fs = require('fs');

// any utils function should come here
module.exports = {
    ensurePath: function(path) {
        console.log(path, 'path');
        if (!fs.existsSync(path)) {
            this.ensurePath(npath.dirname(path));

            fs.mkdirSync(path);
        }
    }
};