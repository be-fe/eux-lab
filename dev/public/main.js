$(function() {

    var $content = $('iframe');
    var $titles = $('.sidebar .title');

    var urlChanged = function() {
        console.log('hash changed : ', location.hash);

        var urlRaw = location.hash.substr(1);
        if (!urlRaw) {
            location.hash = 'page/eui-helper/index';
        }
        var url = decodeURIComponent(urlRaw);
        // hash changed
        $titles
            .removeClass('selected')
            .filter('[url="' + urlRaw.split('"').join('\\"') + '"]')
            .addClass('selected');

        $content.attr('src', url);
    };
    $(window).on('hashchange', urlChanged);
    urlChanged();

    $('.sidebar')
        .on('click', '.title', function() {
            var t = $(this);
            console.log('url clicked : ', t.attr('url'));
            location.hash = t.attr('url');
        });


});