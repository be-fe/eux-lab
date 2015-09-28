define([], function() {
    return [{
        text: "OK, let's create our first new item.",
        textcn: "现在，让我们来创建你第一个item。"
    }, {
        text: "There are a number of ways to create a new item. These can be categorised by what's " +
            "the relation between the new item and the current item.",
        textcn: "创建一个新的item有很多的途径，这些途径的区别在于你创建的item跟你现在的item的相对位置如何。"
    }, {
        text: "For example, you can quickly create a new item just beneath the current item. The keyboard " +
            " shortcut is [Enter]. Or use [Meta+D] or [Ctrl+D]. ",
        textcn: "比如说，你可以快速的新建一个item，让它位于现在item的下方。快捷键有三个，最常用的是【Enter】，另外两个" +
            "【Meta+D】或者【Ctrl+D】也可以达到相效果。",
        image: "new-item-next.png",
        imageInfo: {
            maxWidth: 680
        }
    }, {
        text: "Now, try to create and save a new item as a next sibling item to the item [ <em>item 2.1</em> ]. GO!",
        textcn: "好，现在在【item 2.1】下面新建一个item。开始！",
        logic: {
            start: function(g, logic, success) {
                logic.v = logic._find('item 2.1');

                logic.stop = function() {
                    logic.v.off(null, logic.newNextItem);
                    if (logic.newItem) {
                        logic.newItem.off(null, logic.isSaved);
                        logic.newItem.off(null, logic.isRemoved);
                    }
                }


                logic._steps([
                    function init(next, rollback) {
                        logic.newNextItem = function() {
                            logic.newItem = logic.v.$el.next().data('view');
                            next();
                        };

                        logic.v.once('new-item-next', logic.newNextItem);
                    },
                    function checkSaved(next, rollback) {
                        logic.isSaved = function() {
                            logic.stop();
                            if (logic.newItem.$el.prev().data('view') == logic.v) {
                                success();
                            } else {
                                rollback();
                            }
                        }
                        logic.isRemoved = function() {
                            logic.stop();
                            rollback();
                        }

                        logic.newItem.once('item-saved', logic.isSaved);
                        logic.newItem.once('remove-item', logic.isRemoved);
                    }
                ]);
            }
        }
    }, {
        text: "Well done! You have created a new item next to [ <em>item 2.1</em> ].",
        textcn: "非常聪明。",
        complete: 1
    }, {
        text: "You can quickly create a item above the current item. The keyboard shortcut is [Shift+Enter]. Or alternatively, " +
            " [Meta+E] or [Ctrl+E].",
        textcn: "一样的，你也可以很容易的在一个item上方新建一个item。快捷键是【Shift+Enter】，或者是【Meta+E】或【CTRL+E】。"
    }, {
        text: "Next, try to create and save a new item as a previous sibling item, also to the item [ <em>item 2.1</em> ]. GO!",
        textcn: "来，让我们凶残的在【item 2.1】上方新建一个item，开始！",
        logic: {
            start: function(g, logic, success) {
                logic.v = logic._find('item 2.1');

                var off = logic.stop = function() {
                    logic.v.off(null, newPrev);
                    if (newItem) {
                        newItem.off(null, saveItem);
                        newItem.off(null, removeItem);
                    }
                }

                var newPrev, newItem, saveItem, removeItem;
                logic._steps([function(next) {
                    logic.v.once('new-item-prev', newPrev = function() {
                        newItem = logic.v.$el.prev().data('view');
                        next();
                    });
                }, function(next, rollback) {
                    newItem.once('item-saved', saveItem = function() {
                        off();
                        if (newItem.$el.next().data('view') == logic.v) {
                            success();
                        } else {
                            rollback();
                        }
                    })
                        .once('remove-item', removeItem = function() {
                            off();
                            rollback();
                        })
                }]);
            }
        }
    }, {
        text: "Great! You have created a new item above [ <em>item 2.1</em> ].",
        textcn: "果然厉害！给你一个小勾勾。"
    }]
})