define([], function() {
    return [{
        text: "Let's start by editing your first item!"
    }, {
        text: "Editing an item is easy. TreeOutliner use a similar concept like vim. " +
            "There are two modes for our content 'edit' mode and 'view' mode. " +
            "Your items are by default in 'view' mode. If you want to edit an item, turn into 'edit' mode then.",
        image: 'view-mode.png'
    }, {
        text: "Using the keyboard shortcut [E] or [F2] to toggle to 'edit' mode.",
        image: 'edit-mode.png'
    }, {
        text: "Now, please change the content of any item to 'hello world'. After that, you can " +
            "press [Alt+Enter] to save or [ESC] to cancel. Or, you can click on the tick or cross item besides " +
            "the textbox.",
        image: 'edit-mode.png'
    }, {
        text: "Edit and change any item to 'hello world'. GO!",
        logic: function(g, success) {
            _.each(g.list.itemViews, function(v) {
                if ($.trim(v.item.content) == 'hello world') {
                    success();
                }
            })
        }
    }, {
        text: "Congratulation! You have successfully changed an item as 'hello world'.",
        complete: 1
    }];
});