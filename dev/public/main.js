$(function() {

    var $content = $('iframe');
    var $sidebar = $('.sidebar');
    var $sidebarWrapper = $('.sidebar-wrapper');
    var $pageFilterContainer = $('.page-filter-container');
    var $levels = $('.sidebar .level');
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

    $sidebarWrapper
        .on('click', '.title-content', function() {
            var $t = $(this).parent();
            console.log('url clicked : ', $t.attr('url'));
            location.hash = $t.attr('url');
        })
        .on('focus', '#page-filter', function() {
            var $t = $(this);

            $t.parent().addClass('focused');
        })
        .on('blur', '#page-filter', function() {
            var $t = $(this);

            $t.parent().removeClass('focused');
        })
    ;

    $sidebar.on('scroll', _.debounce(function() {
        var scrollTop = $sidebar.scrollTop();
        $pageFilterContainer.toggleClass('fixed', scrollTop != 0);
    }, 200));


    $levels.each(function() {
        var $level = $(this);
    });

});