'use strict';


var Gallery = (function($, Logger, Translator, AdaptiveImage) {
    var module = {};

    var settings = {
        moduleName: 'Gallery',
        debug: true,
    };

    var logger;
    var t;

    var manager = [];

    var Obj = function($el, images, options) {
        options = options || {};

        this.$el = $el;

        images = $.map(images, function(n, i) {
            return {w: n[1][0], h: n[1][1], src: n[0]};
        });
        this.images = images;

        this.options = {
            width: 1000,
            rowHeight: 200,
            margin: 5,
            isActive: true,
            onClick: null
        };

        for (var pr in options) {
            this.options[pr] = options[pr];
        }

        this.initUI();
    };

    Obj.prototype.initUI = function() {
        var _this = this;
        $(this.images).each(function(i, img) {
            var $a = $('<a href="' + img.src + '" style="display:none" data-idx="' + i + '"><img src="' + img.src + '" /></a>').appendTo(_this.$el);

            if (typeof(_this.options.onClick) === 'function') {
                $a.on('click', function(evt) {
                    evt.preventDefault();
                    var idx = parseInt($(this).attr('data-idx'), 10);
                    _this.options.onClick(idx, img);
                });
            }
        });
    };

    Obj.prototype.calc = function() {
        var result = [];
        var i = 0;
        var loop = true;
        while (loop) {
            for (var k = 1; k < 100; k++) {
                var row = this.images.slice(i, i + k);

                if (row.length < k) {
                    for (var l = 0; l < k - row.length; l++) {
                        row.push({
                            w: this.images[0].w,
                            h: this.images[0].h
                        });
                    }
                }

                var data = this.calcRow(row);

                var rowHeight = getCallable(this.options.rowHeight);

                if (data.h <= rowHeight){
                    i = i + k;
                    for (var m = 0; m < data.images.length; m++) {
                        var img = data.images[m];
                        if (typeof(img.src) != 'undefined') {
                            result.push(img);
                        }
                    }

                    if (i >= this.images.length) {
                        loop = false;
                    }

                    break;
                }

            }
        }

        return result;
    };

    Obj.prototype.calcRow = function(row) {
        var width = getCallable(this.options.width);
        var margin = getCallable(this.options.margin);

        var rowWidth = width - margin * 2 * row.length;
        var kList = [];
        var kSum = 0;
        for (var i = 0; i < row.length; i++) {
            var img = row[i];
            var d = img.w / img.h;
            kList.push(d);
            kSum += d;
        }
        var h = Math.round(rowWidth / kSum);

        var wList = [];
        var wSum = 0;
        for (var i = 0; i < row.length; i++) {
            var d = Math.round(h * kList[i]);
            wList.push(d);
            wSum += d;
        }

        var result = [];
        for (var i = 0; i < row.length; i++) {
            var img = row[i];
            var _img = {
                w: parseInt(wList[i]),
                h: parseInt(h)
            };
            if (typeof(img.src) != 'undefined') {
                _img.src = img.src;
            }
            result.push(_img);
        }

        if (wSum != rowWidth){
            var diff = parseInt(rowWidth - wSum);

            for (var i = 1; i < Math.abs(diff) + 1; i++) {
                var x = (diff < 0) ? -1 : 1;
                if (result[result.length - i]) {
                    result[result.length - i].w += x;
                } else {
                    result[0].w += x;
                }
            }
        }

        return {
            h: parseInt(h),
            images: result
        };
    };

    Obj.prototype.destroy = function() {
        var idx = $.inArray(this, manager);
        if (idx != -1) {
            manager.splice(idx, 1);
        }
        this.$el.empty();  // remove DOM elements, data and event handlers
    };

    function getCallable(v) {
        return typeof(v) === 'function' ? v() : v;
    }

    function redraw(i, repeatFlag) {
        var items = i ? [manager[i]] : manager;

        var repeat = false;

        if (!repeatFlag) {
            $('body').css('height', 'auto');
        }

        $(items).each(function(i, obj) {
            if (!getCallable(obj.options.isActive)) {
                return;
            }

            logger.log('redraw', obj);

            var images = obj.calc();

            // ширина до перерисовки
            var w1 = getCallable(obj.options.width);

            var margin = getCallable(obj.options.margin);

            $(images).each(function(i, img) {
                var $a = $('a[data-idx="' + i + '"]', obj.$el);
                if ($a.length) {
                    $([$a, $('img', $a)]).each(function(k, el) {
                        $(el).css({
                            width: img.w,
                            height: img.h
                        });
                    });
                    $a.css({
                        margin: margin,
                        display: 'inline-block'
                    });
                }
            });

            // ширина после перерисовки
            var w2 = getCallable(obj.options.width);

            if (w1 > w2) {
                repeat = true;
            }
        });

        // в случае перерисовки необходимо искусственно добавить полосу
        // прокрутки, так как её может не быть
        var bodyHeight = 'auto';
        if (repeatFlag) {
            bodyHeight = document.documentElement.clientHeight + 1;
        } 
        $('body').css('height', bodyHeight);

        // если после отрисовки меняется ширина контейнера (из-за
        // появления полосы прокрутки) необходимо перерисовать галерею заново
        if (repeat && typeof(repeatFlag) === 'undefined') {
            logger.log('repeat redraw');
            redraw(i, true);
        }
    }

    module.redraw  = redraw;

    module.destroy = function($el, options) {
        $(manager).each(function(i, obj) {
            obj.destroy();
        });
    };

    module.create = function($el, images, options) {
        images = images || [];
        options = options || {};

        var obj = new Obj($el, images, options);
        manager.push(obj);
        redraw();
        return obj;
    };

    module.init = function(_settings, _translations) {
        _settings = _settings || {};
        _translations = _translations || {};

        for (var pr in _settings) {
            settings[pr] = _settings[pr];
        }

        logger = new Logger(settings);
        t = new Translator(_translations);

        $(window).resize(function() {
            redraw();
        });

        logger.log('init');
    };

    return module;
}(jQuery, Logger, Translator, AdaptiveImage));
