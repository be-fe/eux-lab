define([],
    function() {

	var utils = {
        setItem: function (key, val) {
            localStorage.setItem(key, JSON.stringify(val));
        },
        getItem: function (key, defaultValue) {
            var itemString = localStorage.getItem(key);
            if (itemString) {
                try {
                    var item = JSON.parse(itemString);
                } catch (ex) {
                    item = null;
                }
            }
            if (!item) item = defaultValue || {};
            return item;
        }
    };

	return utils;
});