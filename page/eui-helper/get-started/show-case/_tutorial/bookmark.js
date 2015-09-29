define([], function() {
    return [{
        text: "As the list grows, you may find it harder to navigate to certain item.",
        textcn: "当list变大的时候，有时找个东西会很费劲。"
    }, {
        text: "Bookmark some items that interest you is very handy. The shortcut is [Z].",
        textcn: "所以这时候，Bookmark这个功能就横空出世来拯救你。快捷键为【Z】",
        image: "bookmark.png",
        width: 500
    }, {
        text: "Well, bookmark [ <em>item 3</em> ] now. GO!",
        textcn: "现在请bookmark 【item 3】，开始！",
        logic: {
            start: function(g, l, s) {
                var v = l._find('item 3');

                l._steps([function() {
                    l._once(v, 'item-bookmarked', function() {
                        console.log('hi');
                        s();
                    });
                }]);
            }
        }
    }, {
        text: "Well done! Remember that, you can press [Z] again to unbookmark it.",
        textcn: "非常好！记住，你可以再按一次【Z】来取消bookmark",
        complete: 1
    }]
})