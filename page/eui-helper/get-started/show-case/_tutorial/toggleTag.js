define(['jquery'], function($) {


    return [{
        text: "One of the important features of Tree Outliner is tagging an item. We are not " +
            "going too deep this time. If you are interested, you can go to the following quest section " +
            "[More about tagging] to learn more. In this quest, we will only have a look at some of the preset tags."
    }, {
        text: "There are several tags preset in the tool to make your life easier. And some of them are " +
            "even actionable, e.g. task.todo or task.done etc.",
        image: 'preset-tags.png',
        width: 350
    }, {
        text: "We will look at the task tags first. "
    }, {
        text: "If you want to tag an item to indicate that it's a task item. You can simply press [Space] when " +
            "hovering on the item."
    }, {
        text: "OK. Try to tag [ <em>item 1</em> ] as a task item. GO!",
        logic: {
            start: function(g, l, s) {
                var v = l.v = l._find('item 1');

                l._steps([function() {
                    l._waitFor(function(done) {
                        if (v.item.content.indexOf('#task.todo:r2') != -1) {
                            done; s();
                        }
                    })
                }])
            },
            more: 1
        }
    }, {
        text: "Yes! "
    }, {
        text: "Now you may want to toggle the status from todo to done. You can use the [Space] again."
    }, {
        text: "OK. Try to toggle the status from todo to done for [ <em>item 1</em> ].",
        logic: {
            start: function(g, l, s) {
                l._steps([function() {
                    l._waitFor(function(done) {
                        if (l.v.item.content.indexOf('#task.done:g2') != -1) {
                            done(); s();
                        }
                    })
                }])
            }
        }
    }, {
        text: "Well done!"
    }, {
        text: "Sometimes, you may have some question in your mind, but you want to quickly dump it from " +
            "your mind and keep doing your task on hand. In such case, you can quickly mark an item as " +
            "a question by pressing [Shift+/]. Yes, this key combination is in fact [?]."
    }, {
        text: "Try to tag [ <em>item 3</em> ] as a question. GO!",
        logic: {
            start: function(g, l, s) {
                l.v = l._find('item 3');

                l._steps([function() {
                    l._waitFor(function(done) {
                        if (l.v.item.content.indexOf('#question.open:r2') != -1) {
                            done(); s();
                        }
                    })
                }])
            },
            more: 1
        }
    }, {
        text: "Lovely! Now again, tag it as a question that is answered. GO!",
        logic: {
            start: function(g,l,s) {
                l._steps([function() {
                    l._waitFor(function(done) {
                        if (l.v.item.content.indexOf('#question.closed:g2') != -1) {
                            done(); s();
                        }
                    })
                }])
            }
        }
    }, {
        text: "Fantastic!"
    }, {
        text: "You may wonder how this could be useful? Here is a hint, tagging can work with saved search!"
    }, {
        text: "Now, a more complicated task for you. Set up a saved search to monitor the open questions. " +
            "Add a new question and see the search result changed. GO!",
        logic: {
            start: function(g,l,s) {
                var $sidebar = $('#sidebar'), $search, $questions;

                l._steps([function(next) {
                    l._waitFor(function(done) {
                        $sidebar.find('.saved-search').each(function() {
                            var $t = $(this);
                            if ($t.find('.saved-search-title span').html().indexOf('question.open') != -1) {
                                $questions = $t.find('li');
                                $search = $t;
                                done();
                                next();
                                return true;
                            }
                        });
                    });
                }, function(next, rollback) {
                    l._waitFor(function(done) {
                        if (!$search.is(':visible')) {
                            done();
                            rollback();
                        } else if($search.find('li').length > $questions.length) {
                            done();
                            s();
                        }
                    });
                }]);
            }
        }
    }, {
        text: "Great! You know how to use a saved search now!",
        complete: 1
    }]
})