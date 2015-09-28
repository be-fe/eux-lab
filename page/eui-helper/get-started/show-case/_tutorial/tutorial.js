define(['jquery', 'underscore', 'backbone', 'text!tpls/tutorial.tpl', 'utils',
    'ajax'],
    function($, _, Backbone, tutorialTplStr, utils,
    _undefined) {

        var tpls = utils.parseTpls(tutorialTplStr),
            CON_interval = 30,
            CON_appended = 80,
            CON_appear = 2,
            CON_flushing = 100,
            CON_last = 50,

            CON_lineHeight = 22,
            CON_padding = 15,
            CON_bottom_delta = 60;

        var avatars = {
            'eddard': {
                p: 80,
                right: 40,
                top: -350
            },
            'knight': {
                p: 700,
                right: 40,
                top: -350
            },
            'girl': {
                p: 5,
                right: 40,
                top: -385
            },
            'rage-comic': {
                p: 300,
                right: 50,
                top: -205
            },
            'lixiaoyao': {
                p: 500,
                right: 40,
                top: -390
            }
        };

        var getAvatar = function(id) {
            var avatar = avatars[id];
            if (!avatar) {
                return getAvatar('knight');
            }
            return _.extend({
                image: id
            }, avatar);
        }
        var randomAvatar = function() {
            var sum = _.reduce(avatars, function(sum, i) {
                return sum + i.p;
            }, 0);
            var rand = Math.random() * sum;
            var base = 0, picked = 'knight';
            _.some(avatars, function(i, id) {
                base += i.p;
                if (rand < base) {
                    picked = id;
                    return true;
                }
            });
            return getAvatar(picked);
        }
        var currentAvatar;

        var ConversationView = Backbone.View.extend({
            events: {
                'mousedown .dialog-content': 'flush',
                'mouseup .dialog-content': 'stopFlushing',
                'click .dialog-content': 'clickOnDialog',
                'click .quest-box li': 'startQuest',
                'click .dialog-avatar': 'changeAvatar'
            },
            initialize: function(opts) {
                var t = this;
                _.extend(t, opts);

                t.render();
                t.$control = t.$('.tutorial-control').appendTo($body);
                t.$dialogWrapper = t.$('.dialog-wrapper');
                t.$questBox = t.$('.quest-box');
                t.$avatar = t.$('.dialog-avatar');
                t.$popup = t.$('.popup-box');

                t.popup = new PopupView({
                    $el: t.$('.popup-box')
                });

                t.quests = new QuestBoxView({
                    $el: t.$('.quest-box')
                });

                var lang = utils.getItem('tutorial-lang');
                t._lang = lang.val || '';
                t.quests.setLang(lang.val);

                t.cacheAvatars();

                t.initEvents();
            },
            setQuestTitle: function() {
                var t = this;
                t.quests.setLang(t._lang);
            },
            initEvents: function() {
                var t = this;
                $(window).focus(function() {
                    t._isFlushing = false;
                });

                t.$control.on('click', '.collapse-expand', function() {
                    t.collapseExpand();
                }).on('click', '.exit', function() {
                    location = '/';
                })
            },
            render: function() {
                var t = this;

                t.$el.html(tpls.tutorialElements(currentAvatar));
                $hidden.append(t.$el);

                return t.$el;
            },
            collapseExpand: function() {
                var t = this, text;
                if (t.hidden) {
                    t.show();
                    text = 'Collapse';
                } else {
                    t.hide();
                    text = 'Expand';
                }
                t.$control.find('.collapse-expand').html(text);
            },
            interact: function(action) {
                var t = this;
                if (action) t._scripts.push(action);

                if (!t._interacting) {
                    var action = t._scripts.shift();
                    if (action) {
                        t._interact(action);
                    } else {
                        t.quest(t.quests.getNextQuest(t.questId));
                    }
                }
                return this;
            },
            cacheAvatars: function() {
                _.each(avatars, function(i, id) {
                    $hidden.append('<img src="' + CON_tutorial_base + '/avatars/' + id + '.png"/>');
                });
            },
            changeAvatar: function() {
                var t = this, avatar = randomAvatar();
                utils.setItem('tutorial-avatar', avatar);
                t.$avatar.css({
                    right: avatar.right,
                    marginTop: avatar.top
                })
                    .find('img')
                    .attr('src', CON_tutorial_base + '/avatars/' + avatar.image + '.png');
            },
            _scripts: [],
            _interacting: false,
            _interact: function(action) {
                var t = this;
                if (!action) return;

                // other types
                // image, form, questions, wait, text
                t._interacting = true;

                if (t.hidden) t.show();

                t.popup.hide();
                if ('text' in action) {
                    var text = t._lang && action['text' + t._lang] || action.text;
                    t._say(text, action.logic);
                }
                if ('image' in action) {
                    t.popup.showImage(t.questId + '/' + action.image);
                    if (action.width) {
                        action.imageInfo = _.extend({}, action.imageInfo, {maxWidth: action.width});
                    }
                    t.popup.setImageInfo(action.imageInfo);
                }
                if ('complete' in action) {
                    t.quests.complete(t.questId);
                }
            },
            _showTimer: null,
            hidden: true,
            show: function() {
                var t = this;
                clearTimeout(t._showTimer);
                t.$el.appendTo($body);
                t.hidden = false;

                t.hideShadow();

                setTimeout(function() {
                    t.$dialogWrapper.css('bottom', 0);
                    t.$control.css('bottom', 175);
                    t.$popup.css('left', 40);
                }, 20);

                setTimeout(function() {
                    t.showShadow();
                }, 800);

            },
            hideShadow: function() {
                this.$('.has-shadow').removeClass('has-shadow').addClass('no-shadow');
            },
            showShadow: function() {
                this.$('.no-shadow').addClass('has-shadow').removeClass('no-shadow');
            },
            hide: function() {
                var t = this;
                clearTimeout(t._showTimer);
                t.hidden = true;

                t.hideShadow();
                setTimeout(function() {
                    t.$dialogWrapper.css('bottom', -600);
                    t.$control.css('bottom', 20);
                    t.$popup.css('left', '-100%');
                }, 20);

                setTimeout(function() {
                    t.showShadow();
                    $hidden.append(t.$el);
                }, 800);
            },
            close: function() {},
            _say: function(message, logic) {
                var t = this;
                t._saying = true;

                var chars = message.split(''), charsLen = chars.length;
                var idx = 0;
                var $cont = t.$('.dialog-content'), $inner = $cont.find('.inner');
                var checkScroll = 0;

                $inner.html(message);

                var $inss = [];

                var parseContent = function($target) {
                    $target.contents().each(function() {
                        if (this.nodeType == document.TEXT_NODE) {
                            var $t = $(this);
                            var html = $t.text();
                            var chs = html.split('');
                            _.each(chs, function(ch) {
                                var $ins = $('<ins/>').text(ch).data('ch', ch);
                                $inss.push($ins);
                                $t.before($ins);
                            })
                            $t.remove();
                        } else {
                            parseContent($(this));
                        }
                    });
                }
                parseContent($inner);

                var contHeight = $cont.height();
                t.timer = setInterval(function() {
                    for (var i = 0; i < CON_appear || t._isFlushing && i < CON_flushing; i++) {
                        (function($ins) {
                            if ($ins) {
                                t._charAppended ++;
                                $ins.after($ins.data('ch'));

                                if (checkScroll ++ > 10) {
                                    var contScrolled = $cont.scrollTop();
                                    var insPos = contScrolled + $ins.position().top + CON_lineHeight + CON_padding;
                                    var scrolled = contScrolled + contHeight + CON_padding + CON_bottom_delta;
                                    if (scrolled >= insPos || t._isFlushing) {
                                        $cont.scrollTop(insPos - contHeight);
                                    }
                                    checkScroll = 0;
                                }

                                $ins.remove();

                                if (!$inss.length && t.timer) {
                                    clearInterval(t.timer);
                                    t.timer = null;

                                    t.feedback(function() {
                                        t._interacting = false;
                                        t.interact();
                                    }, logic);
                                }
                            } else {
                                clearInterval(t.timer);
                            }
                        })($inss.shift())
                    }
                }, CON_interval);
            },

            /**
             * '' => english
             * 'cn' => chinese
             */
            _lang: '',

            createLogicObj: function() {
                var t = this;
                var logic = {
                    _find: function(content) {
                        var found;
                        _.some(g.list.itemViews, function(v) {
                            if (v.item.content == content) {
                                found = v;
                                return true;
                            }
                        });
                        return found;
                    },
                    _steps: function(steps) {
                        var idx = 0;

                        var doStep = function() {
                            var step = steps[idx];
                            step(function() {
                                idx ++;
                                doStep();
                            }, function() {
                                idx = 0;
                                doStep();
                            })
                        }
                        doStep();
                    },
                    _stopWaiting: function() {
                        while (logic._waits.length) {
                            clearInterval(logic._waits.shift());
                        }
                    },
                    _waits: [],
                    _waitFor: function(fn) {
                        var done = function() {
                            clearInterval(wait);
                        }
                        var wait = setInterval(function() {
                            fn(done)
                        }, CON_interval * 30);
                        this._waits.push(wait);
                    },
                    _off: function() {
                        while (logic._offFns.length) {
                            var off = logic._offFns.shift();
                            off.obj.off(null, off.fn);
                        }
                    },
                    _offFns: [],
                    _once: function(obj, event, fn) {
                        obj.once(event, fn);
                        logic._offFns.push({obj: obj, fn: fn})
                    },
                    _setLang: function(lang) {
                        t._lang = lang || '';
                        t.quests.setLang(lang);
                        utils.setItem('tutorial-lang', {val: lang});
                    },
                    _choiceChosen: function(choice) {
                        logic._choiceObj[choice]();
                    },
                    _choiceObj: {},
                    _choice: function(choiceObj) {
                        logic._choiceObj = choiceObj;
                    }
                }
                return logic;
            },
            _stopFeedback: null,
            stopFeedback: function() {
                var t = this;
                clearInterval(t.checkFeedback);
                t._stopFeedback && t._stopFeedback();
                t._stopFeedback = null;
                t._questLogics = {};
                t._lastLogic = null;
                t._preventReset = false;
            },
            _lastLogic: null,
            _preventReset: false,
            feedback: function(callback, logic) {
                var t = this;
                t._clickOnDialog = t._isFlushing ? -1 : 0;
                t._isFlushing = false;

                var logicDelay = 0;
                if (logic) {
                    if (!t._preventReset) {
                        g.resetList(JSON.parse(itemData));
                    }

                    if (typeof logic == 'function') {
                        t.checkFeedback = setInterval(function() {
                            logic(g, function () {
                                callback();
                                clearInterval(t.checkFeedback);
                            })
                        }, CON_interval * 30);
                    } else {

                        if (t._lastLogic) var logicObj = t._lastLogic;
                        else logicObj = t.createLogicObj();

                        t.$dialogWrapper
                            .on('click.dialog-choice', '[data-choice]', function() {
                                var $t = $(this);
                                var choice = $t.data('choice');
                                logicObj._choiceChosen(choice);
                            });

                        if (logic.more) {
                            t._lastLogic = logicObj;
                            t._preventReset = true;
                        } else {
                            t._preventReset = false;
                        }
                        t._stopFeedback = function() {
                            logicObj.stop && logicObj.stop();
                            logicObj._off();
                            logicObj._stopWaiting();
                            t.$dialogWrapper.off('.dialog-choice')
                        }
                        logic.start(g, logicObj, function() {
                            t._stopFeedback();
                            callback();
                        });
                    }
                } else {
                    t.checkFeedback = setInterval(function () {
                        if (t._clickOnDialog > 0) {
                            callback();
                            clearInterval(t.checkFeedback);
                        }
                    }, CON_interval * 5);
                }
            },
            _clickOnDialog: false,
            clickOnDialog: function() {
                this._clickOnDialog ++;
            },
            timer: null,
            _charAppended: CON_appended,
            random: function(min, max) {
                return Math.floor(Math.random() * (max - min)) + min;
            },
            _isFlushing: false,
            flush: function() {
                this._isFlushing = true;
            },
            stopFlushing: function() {
                this._isFlushing = false;
            },
            stopQuest: function() {
                var t = this;
                t._charAppended = CON_appended;
                clearTimeout(t.timer);
                t.stopFeedback();
                t.timer = null;
                t._scripts = [];
                t._interacting = false;
            },

            startQuest: function(e) {
                var $t = $(e.currentTarget);
                var id = $t.data('id');
                this.quest(id);
            },
            quest: function(id) {
                var t = this;
                t.$questBox
                    .find('.current').removeClass('current').end()
                    .find('[data-id=' + id + ']').addClass('current');

                this.questId = id;
                var script = scripts[id];
                var quest = t.quests.get(id);

                var start = function(script) {
                    t.stopQuest();
                    _.each(script, function(action) {
                        t.interact(action);
                    });
                }

                t.stopQuest();
                if (!quest) return;

                if (quest.status == 'building') {
                    t.interact({
                        text: 'The quest "<em>' + quest.title + '</em>" is not yet open. Please contact <a href="mailto:jspopisno1@gmail.com">this guy</a> for more information.'
                    })
                } else if (!script) {
                    t.interact({
                        text: '... loading quest ...'
                    });

                    require(['tutorial/' + id], function (script) {
                        scripts[id] = script;
                        start(script);
                    });
                } else {
                    start(script);
                }
            }
        });

        var QuestBoxView = Backbone.View.extend({
            initialize: function(opts) {
                var t = this;
                _.extend(t, opts);

                t.render();
            },
            setLang: function(lang) {
                this.$('[data-title]').each(function() {
                    var $t = $(this);
                    $t.html($t.data('title' + (lang || '')) || $t.data('title'));
                })
            },
            render: function() {
                var t = this;

                t.$('.quest-inner').html(tpls.questBox({
                    questGroups: questGroups
                }));

                t.quests = [];
                t.$quests = t.$('li[data-id]').each(function() {
                    t.quests.push($(this).data('id'));
                });

                t.questHash = {};
                _.each(questGroups, function(group) {
                    _.each(group.quests, function(q) {
                        t.questHash[q.id] = q;
                    })
                })

                return t.$el;
            },
            get: function(id) {
                return this.questHash[id];
            },
            getNextQuest: function(currId) {
                var t = this, idx = t.quests.indexOf(currId);
                var quest = t.quests[idx+1];

                if (!quest) return false;
                if (!t.$quests.filter('[data-id=' + quest + ']').is('.completed')) {
                    return quest;
                } else {
                    return t.getNextQuest(quest);
                }
            },
            complete: function(questId) {
                var t = this;
                t.$quests.filter('[data-id=' + questId + ']').addClass('completed');
            },
            completeAll: function(questsStr) {
                var t =this, quests = questsStr && questsStr.split('|') || [];
                _.each(quests, function(id) {
                    t.complete(id)
                });
            }
        });

        var CON_tutorial_base = '/js/tutorial/';
        var PopupView = Backbone.View.extend({
            initialize: function(opts) {
                var t = this;
                _.extend(t, opts);

            },
            _showTimer: null,
            show: function() {
                var t = this, $t = this.$el.show();
//                clearTimeout(t._showTimer);
//                t._showTimer = setTimeout(function() {
//                    $t.css('opacity', 1);
//                }, 0);
            },
            hide: function() {
                var t = this, $t = t.$el;
                $t.hide();

//                setTimeout(function() { t.$el.css('opacity', 0); }, 0);
//                clearTimeout(t._showTimer);
//                t._showTimer = setTimeout(function() {
//                    $t.hide();
//                }, 800)
            },
            showImage: function(img) {
                var t = this;
                t.show();
                t.$('img').attr('src', CON_tutorial_base + img);
            },
            setImageInfo: function(info) {
                info = info || {maxWidth: 650};
                var t = this, css = {};
                css.maxWidth = info.maxWidth ? info.maxWidth : false;

                t.$('img').css(css)
            }
        });

        var questGroups = [
            {
                title: 'Basic operations',
                titlecn: '基础操作',
                quests: [{
                    id: 'open',
                    title: 'Introduction',
                    titlecn: '介绍'
                }, {
                    id: 'theFirstEdit',
                    title: 'The first edit in the world!',
                    titlecn: '第一次编辑'
                }, {
                    id: 'firstNewItem',
                    title: 'Create your first item',
                    titlecn: '新建第一个item'
                }, {
                    id: 'keyboard',
                    title: 'Learn the shortcuts',
                    titlecn: '学习快捷键'
                }, {
                    id: 'removeAnItem',
                    title: 'Remove an item',
                    titlecn: '删除掉item'
                }, {
                    id: 'focus',
                    title: 'Focus on an item',
                    titlecn: '专注暴走模式'
                }, {
                    id: 'bookmark',
                    title: 'Bookmark an item',
                    titlecn: 'Bookmark一个item'
                }, {
                    id: 'search',
                    title: 'Search in the list',
                    titlecn: '在list中寻觅'
                }, {
                    id: 'toggleTag',
                    title: 'Add and toggle the tag status of an item',
                    titlecn: '添加并切换item的tag'
                }, {
                    id: 'investTime',
                    title: 'Invest your time wisely',
                    titlecn: '时间投资'
                }]
            }, {
                title: 'Control your view',
                titlecn: '玩转你的视图',
                quests: [{
                    id: 'toggleItem',
                    status: 'building',
                    title: 'Toggle current item',
                    titlecn: '收展当前item'
                }, {
                    id: 'toggleChild',
                    status: 'building',
                    title: 'Toggle child item',
                    titlecn: '收展子item'
                }]
            }, {
                title: 'More about tagging',
                titlecn: '玩转tagging',
                quests: [{
                    id: 'building',
                    status: 'building',
                    title: 'Coming soon',
                    titlecn: '即将开启'
                }]
            }, {
                title: 'More quests',
                titlecn: '更多的任务',
                quests: [{
                    id: 'building',
                    status: 'building',
                    title: 'Coming soon',
                    titlecn: '即将开启'
                }]
            }
        ];

        var scripts = {};

        var g, itemData,
            $hidden = $('#hidden-zone'), $body = $('body');

        var tutorial = {
            setup: function(global, _items) {
                g = global;
                itemData = _items;

                currentAvatar = utils.getItem('tutorial-avatar');
                if (!currentAvatar.image) {
                    currentAvatar = getAvatar();
                }
                var conversation = new ConversationView();

                scripts.open = [{
                    text: "Would you like me to <a data-choice='english'>speak English</a>, or " +
                        "<a data-choice='chinese'>讲普通话</a>.",
                    logic: {
                        start: function(g,l,s) {
                            l._choice({
                                english: function() {
                                    l._setLang(); s();
                                },
                                chinese: function() {
                                    l._setLang('cn'); s();
                                }
                            });
                        }
                    }
                }, {
                    text: 'Hello, ' + g.username + '. Welcome to the world of Tree Outliner. I am your guide throughout this dangerous journey.',
                    textcn: 'Hello, ' + g.username + '，欢迎来试用Tree Outliner。世道艰险，我作为你得力的指导员将会为你保驾护航。'
                }, {
                    text: 'Here are a number of quests you are going to conquer. Take them down and you will be the master of this tool. ',
                    textcn: "我将为你指派一系列的任务，有容易的掉渣的，也有充满挑战的，希望通过这一系列教程之后，你就能熟练掌握这个小工具。前进吧，少年！"
                }, {
                    image: 'tutorial-menu.png',
                    imageInfo: {
                        maxWidth: 500
                    },
                    text: 'Whenever you want to play the tutorial quests, you may just visit me from the action menu at the top right corner.',
                    textcn: "你可以随时停止教程，随时回来。如果想我了，就去Action菜单那召唤我。"
                }, {
                    image: 'quests.png',
                    text: 'All the available quests are at my left hand side. When a quest is achieved, I will give you the next available ' +
                        'one. Of course, you are free to choose any quest you\'d like to take.',
                    textcn: "所有的任务都可以在左手边的任务栏里找到。当你完成一个任务时，我会马不停蹄的给你找下一个。当然，" +
                        "如果你不爽，那么可以去选择你感兴趣的任务做。",
                    imageInfo: {
                        maxWidth: 550
                    }
                }, {
                    image: 'completed.png',
                    text: 'If any quest is completed, you can see that the style of the quest will be changed like this.',
                    textcn: "当你破了某个任务，我会奖励你个小勾勾。",
                    imageInfo: {
                        maxWidth: 550
                    }
                }, {
                    text: "Note that once you complete a quest, all changes will be reverted. As this is a tutorial list, any change won't " +
                        "be persisted as well.",
                    textcn: "注意，每次你在做任务时，发现list刷的一下被重置了，别担心，这是为了让你每次任务都能顺利完成。同时记得，这是一个教程专用" +
                        "的list，任何改动都不会被保存，每次刷新它都会原地满血复活。"
                }, {
                    text: "Also, at any time, you can collapse this conversation by clicking on 'Collapse'. Clicking 'Expand' " +
                        "will bring up the conversation again. Or go back to your lists " +
                        "by clicking on 'Exit'",
                    textcn: "同时，如果这个对话框挡你视线了，请分分钟通过Collapse这个按钮把我隐藏掉。" +
                        "如果你要开始尝试用这个工具，请点击Exit，我将把你带到你的list页面那里去。",
                    width: 400,
                    image: 'collapse.png'
                },{
                    text: "OK. Congratulation! You just finished the first quest.",
                    textcn: "好！恭喜恭喜！你现在已经完成了第一个任务，给你个小勾勾。",
                    complete: 1
                }];

                conversation.quests.completeAll(pv.quests);
                conversation.quest('open');
            }
        }
        return tutorial;
});