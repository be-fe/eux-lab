$(function() {

    var DATA_KEY = {
        wiki: '/simple-data/wiki-status'
    };

    var $content = $('iframe');
    var $sidebar = $('.sidebar');
    var $sidebarWrapper = $('.sidebar-wrapper');
    var $pageFilterContainer = $('.page-filter-container');
    var $levels = $('.sidebar .level');
    var $titles = $('.sidebar .title');
    var $readStatus = $('#read-status');

    var readStatus = {};

    var urlChanged = function() {
        console.log('hash changed : ', location.hash);

        var urlRaw = location.hash.substr(1);
        if (!urlRaw) {
            location.hash = 'page/eui-helper/index';
        }
        var url = decodeURIComponent(urlRaw);
        readStatus[url] = 1;
        saveReadStatus();

        // hash changed
        $titles
            .removeClass('selected')
            .filter('[url="' + urlRaw.split('"').join('\\"') + '"]')
            .addClass('selected')
            .children('.read-status')
            .addClass('read');

        $content.attr('src', url);
    };

    $sidebarWrapper
        .on('click', '.title-content', function clickTitleContent() {
            var $t = $(this).parent();
            console.log('url clicked : ', $t.attr('url'));

            var url = location.hash = $t.attr('url');

            $t.children('.read-status').addClass('read');
        })

        .on('focus', '#page-filter', function focusOnPageFilter() {
            var $t = $(this);

            $t.parent().addClass('focused');
        })
        .on('blur', '#page-filter', function blurFromPageFilter() {
            var $t = $(this);

            $t.parent().removeClass('focused');
        })

        .on('keyup', '#page-filter', _.debounce(function keyupForFiltering() {
            var $t = $(this);
            var oldValue = $t.data('old-value'), currValue = $t.val();
            if (oldValue != currValue) {
                $t.data('old-value', currValue);
                filterPages(currValue);

                scrollToLevel();
            }
        }, 200))
        .on('keydown', '#page-filter', function checkEscapeButton(e) {
            if (e.keyCode == 27) {
                $(this).val('');
            }
        })
        .on('mouseup', '#page-filter', function mouseUpToClear() {
            $(this).select();
        })

        .on('click', '.expanding-status', function clickOnExpandingTwix() {
            toggleExpandingStatus($(this).parent().parent());
            saveExpandingStatus();
        })
    ;

    $sidebar.on('scroll', _.debounce(function onSidebarScroll() {
        var scrollTop = $sidebar.scrollTop();
        $pageFilterContainer.toggleClass('fixed', scrollTop != 0);

        var scrollLeft = $sidebar.scrollLeft();

        $readStatus.html('.read-status.fa { right: ' + (-scrollLeft) + 'px}');
    }, 200));

    $levels.each(function() {
        var $level = $(this),
            $title = $level.children('.title'),
            childrenLength = $level.children('.children').children().length;

        $level.attr('expanding-status', childrenLength > 0 ?
            'expanded' : 'collapsed');

        $level.toggleClass('no-child', childrenLength == 0);
    });

    $.get(DATA_KEY.wiki)
        .done(function(data) {

            // use expanding status to revert the expanding status
            if (data.expanded) {
                $levels.filter('[level=1]').each(function() {
                    toggleExpandingStatus($(this), false);
                });

                $levels.each(function() {
                    var $level = $(this), url = $level.children('.title').attr('url');

                    if (url in data.expanded) {
                        toggleExpandingStatus($level, true);
                    }
                });

                scrollToLevel();
            } else {
                $levels.filter('[level=2]').each(function() {
                    toggleExpandingStatus($(this), false);
                });
            }

            // use read status
            if (data.read) {
                $titles.each(function() {
                    var $title = $(this), url = $title.attr('url');

                    if (url in data.read) {
                        $title.find('.read-status').addClass('read');
                    }
                });

                readStatus = data.read;
            }
        });

    var scrollToLevel = function _scrollToLevel($level) {
        $level = $level || $titles.filter('.selected').parent();
        if (!$level.is(':visible')) {
            $level.parents('.level').each(function() {
                toggleExpandingStatus($(this), true);
            });
        }

        var scrollTop = $level.offset().top + $sidebar.scrollTop();

        $sidebar.animate({
            scrollTop: scrollTop - 100
        }, 200);
    };

    var saveExpandingStatus = _.debounce(function _saveExpandingStatus() {
        $.post(DATA_KEY.wiki, {
            expanded: _.invert(
                _.map($levels.filter('[expanding-status=expanded]'), function(level) {
                    return $(level).children('.title').attr('url');
                })
                    .filter(function(url) {
                        return !!url;
                    })
            )
        });
    }, 500);

    var saveReadStatus = _.debounce(function _saveReadStatus() {
        $.post(DATA_KEY.wiki, {
            read: readStatus
        });
    }, 500);

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

    $(window).on('hashchange', urlChanged);
    urlChanged();
});