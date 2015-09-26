var fs = require('fs');
var _ = require('lodash');

var config = require('./config');
var utils = require('./utils');

utils.ensurePath(config.dataFolders.simpleData);

var simpleData = {
    write: function(req, res) {
        if (req.params.key) {
            var data = simpleData._read(req.params.key);
            _.extend(data, req.body);
            fs.writeFileSync(config.dataFolders.simpleData + req.params.key + '.json', JSON.stringify(data, null, '   '));
        }
        //console.log(data, 'data body'); //@test
        res.json('ok');
    },
    _read: function(key) {
        if (key) {
            try {
                var data = JSON.parse(fs.readFileSync(config.dataFolders.simpleData + key + '.json'));
            } catch (ex) {
                data = {};
            }
        }

        //console.log(data, key, 'read'); //@test
        return data || {};
    },
    read: function(req, res) {
        res.json(simpleData._read(req.params.key));
    }
};

module.exports = simpleData;