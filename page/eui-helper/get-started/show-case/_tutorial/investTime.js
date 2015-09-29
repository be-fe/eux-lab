define(['jquery'], function($) {
    return [{
        text: "The last but not least thing to learn in this section, is investing your time.",
        textcn: "最后，很重要的一个功能，就是【投资时间】。"
    }, {
        text: "As a human being, the time you have per day is fixed. Use them wisely can help you achieve your goal" +
            "effectively, and maybe even efficiently.",
        textcn: "任何一个银，时间都是固定的。只有当你能合理的利用它，才能真正做到事半功倍。"
    }, {
        text: 'Tree Outliner will help you use your time wisely, or you may call it investing time.',
        textcn: "Tree Outliner希望帮助你了解和掌握时间支配，或者用一个酷炫的说法，帮你做时间投资。"
    }, {
        text: "Everything starts from planning your time on the tasks. Pressing the number keys over an item, " +
            "will assign a certain amount of time on it.",
        textcn: "那么，一切将从你计划你的时间开始。悬浮在某个item上时按数字键可以给它分配一定的时间。"
    }, {
        text: "Try plan 1 hour on [ <em>item 3.1.2</em> ]. GO!",
        textcn: "先试试给【item 3.1.2】分配1小时，开始！",
        logic: {
            start: function(g,l,s) {
                var v = l.v = l._find('item 3.1.2');

                l._steps([function() {
                    l._waitFor(function(done) {
                        if (v.item.task_points == 6) {
                            done(); s();
                        }
                    });
                }]);
            },
            more: 1
        }
    }, { text: "Great! By the way, to clear the planned time, you can press [0] over an item.",
        textcn: "非常好！记住，你可以随时用【0】来清除掉时间计划。"
    }, {
        text: "Now clear the time planned on the previous item. GO!",
        textcn: "好，现在把刚才的时间分配消除掉，开始！",
        logic: {
            start: function(g, l, s) {
                l._steps([function() {
                    l._waitFor(function(done) {
                        if (l.v.item.task_points == 0) {
                            done(); s();
                        }
                    })
                }])
            }
        }
    }, {
        text: "Well done! Sometimes you want to assign specific time on an item, you can press [=] to do so.",
        textcn: "灰常不错。那么有时候，如果你想分配特定的时间，应该怎么办呢？这时候，你需要【＝】这个快捷键。"
    }, {
        text: "Now, plan 2 hour and 50 minutes on [ <em>item 3.1</em> ]. GO!",
        textcn: "好，分配2小时50分给【item 3.1】，开始！",
        logic: {
            start: function(g,l,s) {
                var v = l.v = l._find('item 3.1');

                l._steps([function() {
                    l._waitFor(function(done) {
                        if (v.item.task_points == 17) {
                            done(); s();
                        }
                    })
                }])
            },
            more: 1
        }
    }, {
        text: "Very good! <strong>NOTE</strong>: You don't need to plan if you don't get used to it.",
        textcn: "表现不错！记得，Tree Outline里你能分配时间，不等于你就一定得这么做。如果你不习惯预估时间，那么可以跳过这个环节。"
    }, {
        text: "OK, let's start working on an item. You can now invest time over an item. When investing time " +
            "You will see something like this. ",
        image: "timer.png",
        width: 420
    }, {
        text: "However, browser will stop popup from being shown by default. You need to allow your browser to " +
            "popup the window. Here is how you unblock it in Chrome. Other browsers may have different procedures.",
        image: "unblock.jpg",
        width: 320
    }, {
        text: "Investing time on item, you could press [T W], this will invest 10 minutes on the item. Likewise, " +
            "[T Q] = 5 minutes, [T E] = 20 minutes, [T R] = 30 minutes, [T T] = 1 hour etc. (there are also " +
            "[T Y], [T U], [T I])"
    }, {
        text: "Now invest 10 minutes on the previous item [ <em>item 3.1</em> ]. Wait for more than 30 seconds " +
            "and click on [Finish] on the popup dialog. GO!",
        logic: {
            start: function(g,l,s) {
                l._steps([function() {
                    l._waitFor(function(done) {
                        if (l.v.item.task_spent > 0) {
                            done(); s();
                        }
                    })
                }])
            }
        }
    }, {
        text: "Nice job! Now you know how to use this tool as a timer.",
        complete: 1
    }]
})