define([], function() {
    return [{
        text: "Another basic operation is removing an item."
    }, {
        text: "The shortcut is [Del]. NOTE that in Macbook, you may need to use the combinatino of [Fn+Delete]. " +
            "Instead, [A G] is another shortcut you can use. It means you press [A] and then [G]."
    }, {
        text: "Now, remove the item [ <em>item 2.2</em> ]. GO!",
        logic: {
            start: function(g, logic, success) {
                var v = logic._find('item 2.2'), removeItem;

                logic.stop = function() {
                    v.off(null, removeItem);
                }

                logic._steps([function() {
                    v.once('remove-item', removeItem = function() {
                        success();
                    });
                }]);
            }
        }
    }, {
        text: "Great! You have successfully removed the item.",
        complete: 1
    }]
})