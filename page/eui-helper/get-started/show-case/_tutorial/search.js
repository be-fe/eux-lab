define(['jquery'], function($) {
    var $search = $('.search-box input'), $sidebar = $('#sidebar-content');

    return [{
        text: "Searching is always handy, when you want to navigate between items."
    }, {
        text: "The search box locates at the top left corner.",
        image: 'search-box.png',
        width: 300
    }, {
        text: "The shortcut to focus on the search box is [/]. Note that meta+f or ctrl+f are all taken by " +
            "this tool, so native search of the browser is no longer available."
    }, {
        text: "However, the search box is good enough. As it can help you do some fuzzy search as well."
    }, {
        text: "Now, try to type '3. item' on the search box. GO!",
        logic: function(g, s) {
            if ($.trim($search.val()) == '3. item') {
                s();
            }
        }
    }, {
        text: "Lovely! You can hover over the search result to navigate to the item quickly. Or use [Up] or [Down] to " +
            "navigate."
    }, {
        text: "You may notice that, the keywords you typed are not restricted to the actual position on the item content."
    }, {
        text: "Also, another interesting usage is the <em> &gt; </em>"
    }, {
        text: "Try search '3.1 &gt; .2'. GO!",
        logic: function(g, s) {
            if ($.trim($search.val()) == '3.1 > .2') {
                s();
            }
        }
    }, {
        text: "Excellent! Here, <em> &gt; </em> is just like a separater which defines the scope you search. As in this case, you are " +
            "searching items against '.2' under another item containing the keyword '3.2'."
    }, {
        text: "Now you know how to do a search. But you may want to save your search result so that you don't need to " +
            "type the keywords every time."
    }, {
        text: "Let's create a saved search! It looks like this.",
        image: "saved-search.png",
        width: 300
    }, {
        text: "The shortcut is [Meta+Enter] or [Ctrl+Enter] when you focus on the search box. Or instead, simple click " +
            "on the [Save] button besides the search box."
    }, {
        text: "Now search 'todo:' and save.",
        logic: function(g, s) {
            $sidebar.find('.saved-search-title span').each(function() {
                if ($.trim($(this).html()) == 'todo:') {
                    s();
                }
            })
        }
    }, {
        text: "Well done! You should be able to see some todo items. And one more good tip here, if you update the list " +
            "the saved search result will also be refreshed shortly.",
        complete: 1
    }]
})