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

        .on('keyup', '#page-filter', _.debounce(function() {
            filterPages($(this).val());
        }, 200))

        .on('click', '.expanding-status', function() {
            toggleExpandingStatus($(this).parent().parent());
        })

    ;

    $sidebar.on('scroll', _.debounce(function() {
        var scrollTop = $sidebar.scrollTop();
        $pageFilterContainer.toggleClass('fixed', scrollTop != 0);
    }, 200));


    $levels.each(function() {
        var $level = $(this),
            $title = $level.children('.title'),
            childrenLength = $level.children('.children').children().length;

        $level.attr('expanding-status', childrenLength > 0 ?
            'expanded' : 'collapsed');

        $level.toggleClass('no-child', childrenLength == 0);
    });

    $levels.filter('[level=2]').each(function() {
        toggleExpandingStatus($(this), false);
    });


    // expanding & collapsing
    function toggleExpandingStatus($level, expandingStatus) {

        if (typeof expandingStatus == 'undefined') {
            var currStatus = $level.attr('expanding-status') == 'expanded' ? 'collapsed' : 'expanded';
        } else {
            currStatus = expandingStatus ? 'expanded' : 'collapsed';
        }

        $level.attr('expanding-status', currStatus);

        if (currStatus == 'collapsed') {
            $level.children('.children').children().each(function() {
                toggleExpandingStatus($(this), false);
            });
        }
    }

    // filtering page titles
    function filterPages(termWords) {
        $levels.removeClass('filtered filtered-hit');

        var termLevels = termWords
            .toLowerCase()
            .split('>')
            .map(function(termWord) {
                return $.trim(termWord);
            })
            .filter(function(termWord) {
                return !!termWord;
            })
            .map(function(termWord) {
                return termWord.split(/\s+/g)
                    .filter(function(term) {
                        return !!term;
                    });
            });

        if (termLevels.length) {
            $levels.filter('[level=1]').each(function() {
                filterTitle($(this));
            });
        }

        $sidebarWrapper.toggleClass('filtering', !!termLevels.length);

        // matching the term - terms are splitted by blank char(s)
        function matchTerm(terms, titleText) {
            return terms.every(function(term) {
                if (titleText.indexOf(term) == -1) {
                    return false;
                }
                return true;
            });
        }

        // filter the current $title
        function filterTitle($level, termLevelIndex) {
            termLevelIndex = termLevelIndex || 0;

            var titleText = $level.children('.title').find('.title-content').text().toLowerCase();
            if (matchTerm(termLevels[termLevelIndex], titleText)) {
                if (termLevelIndex == termLevels.length - 1) {
                    markHit($level);
                } else {
                    termLevelIndex ++;
                }
            }

            $level.children('.children').children().each(function() {
                filterTitle($(this), termLevelIndex);
            });
        }

        // mark hit when a title is matched by the terms
        function markHit($level) {
            $level.addClass('filtered-hit');

            while ($level.length && !$level.hasClass('filtered')) {
                $level.addClass('filtered');
                toggleExpandingStatus($level, true);
                
                $level = $level.parent().parent('.level');
            }
        }
    }
});