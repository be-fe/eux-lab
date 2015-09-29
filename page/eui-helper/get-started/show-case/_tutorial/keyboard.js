define(['jquery'], function($){
    return [{
        text: "Keyboard shortcuts play a very important role in this tool. Learning them is the key."
    }, {
        text: "You can open the help dialog showing all the shortcuts by press [F1], or click on " +
            "the [Keyboard shortcuts] from the action menu.",
        image: "keyboard-menu.png",
        width: 500
    }, {
        text: "The dialog looks like this.",
        image: "dialog.png",
        width: 600
    }, {
        text: "OK. Let's bring the help dialog up. GO!",
        logic: function(g, success) {
            if ($('body').children('.vex.help-dialog').length) success();
        }
    }, {
        text: "Excellent! Now you have see a full list of shortcuts for this tool.",
        complete: 1
    }]
})