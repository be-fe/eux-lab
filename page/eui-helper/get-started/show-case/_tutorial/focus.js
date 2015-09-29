define([], function() {
    return [{
        text: "As the list grows, it could become messy. But you can focus on an item like this.",
        textcn: "如果list变大，整个页面可能会很多信息噪音，不过你可以像这样专注于某一个item。",
        image: 'focus.png'
    }, {
        text: "To focus on the item, you simply need to press [`] (this key is besides the number 1 on your left hand side)",
        textcn: "使用快捷键【`】来专注吧少年。（以防你不知道【`】是啥，这货在你左手边的数字1旁边。）"
    }, {
        text: "OK. Let's focus on [ <em>item 2</em> ]. GO!",
        textcn: "接下来，请专注于【item 2】。开始！",
        logic: {
            start: function(g, logic, success) {
                var v = logic._find('item 2');

                logic._steps([function() {
                    logic._once(v, 'item-focused', function() {
                        success();
                    });
                }])
            }
        }
    }, {
        text: "Nice!",
        textcn: "很好！"
    }, {
        text: "Now press [`] again to exit the focus mode. GO!",
        textcn: "然后，再按一次【`】退出专注模式。开始！",
        logic: {
            start: function(g, logic, success) {
                logic._steps([function() {
                    logic._once(g.list, 'focus-cancelled', function() {
                        success();
                    });
                }])
            }
        }
    }, {
        text: "Great!",
        textcn: "不错，给你奖个小勾勾。",
        complete: 1
    }]
});