var fs = require('fs');

var config = require('./config');
var utils = require('./utils');

utils.ensurePath(config.dataFolders.simpleData);

module.exports = {
    write: function(req, res) {
        if (req.params.key) {
            fs.writeFileSync(config.dataFolders.simpleData + req.params.key + '.json', JSON.stringify(req.body, null, '   '));
        }
        res.json('ok');
    },
    read: function(req, res) {
        if (req.params.key) {
            try {
                var data = JSON.parse(fs.readFileSync(config.dataFolders.simpleData + req.params.key + '.json'));
            } catch (ex) {
                data = {};
            }
        }

        res.json(data || {});
    }
};