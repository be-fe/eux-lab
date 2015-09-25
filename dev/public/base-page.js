$(function() {
    $(document).on('click', 'a', function(e) {
        var t = $(this);

        var url = t.attr('href');
        var path = this.pathname;
        path = path.replace(/^\//, '').replace(/\/$/, '');
        if (url) {
            if (/^\w+\:\/\//.exec(url) || t.hasClass('-demo-page-link') || t.hasClass('-demo-img-link')) {
                t.attr('target', '_blank');
            } else {
                window.top.location.hash = path;
                e.preventDefault();
            }
        }
    });

    $('img').each(function() {
        var t = $(this)
        var a = $('<a/>')
            .attr({
            href: t.attr('src'),
            target: '_blank',
            'class': '-demo-img-link'
        });
        t.after(a).appendTo(a);
    });
});