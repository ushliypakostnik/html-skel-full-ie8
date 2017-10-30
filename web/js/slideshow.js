'use strict';


var Slideshow = (function($, Logger, Translator, Utils, AdaptiveImage) {
    var module = {};

    var settings = {
        moduleName: 'Slideshow',
        debug: 1
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

        this.offset = Math.floor(images.length / 2);
        this.offsetRem = images.length % 2;

        for (var k = 0; k < this.offset; k++) {
            var u = images.pop();
            images.unshift(u);
        }
        this.images = images;
        this.adaptiveImages = {};

        this.options = {
            imagePadding: 0,
            emptyImage: '',

            touchEventsEnabled: true,
            imageTouchThreshold: 0.2,  // realThresholdInPixels = screenWidth * imageTouchThreshold

            adaptiveImagesEnabled: false,
            adaptiveImagesThreshold: 100,

            isMobile: false,
            viewportHeight: 0,

            animationDuration: 0.3,

            isActive: true,

            onSlideEnd: false
        };

        for (var pr in options) {
            this.options[pr] = options[pr];
        }

        this.blocked = false;

        this.touchStartOffsetX = 0;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchEndX = 0;
        this.touchEndY = 0;
        this.imageTouch = false;

        this.initUI();
    };

    Obj.prototype.initUI = function() {
        var _this = this;

        this.$container = $('<div class="slideshow-container"></div>').prependTo(this.$el);

        this.$controlLeft = $('.left', this.$el);
        this.$controlRight = $('.right', this.$el);

        this.$controlLeft.on('click', function(evt) {
            evt.preventDefault();
            _this.moveImages(-1);
        });

        this.$controlRight.on('click', function(evt) {
            evt.preventDefault();
            _this.moveImages(1);
        });

        $(this.images).each(function(i, img) {
            var $a = $('<a href="#" data-idx="' + i + '" data-src="' + img.src + '"><img src="' + _this.options.emptyImage + '" /></a>').appendTo(_this.$container);

            $a.on('click', function(evt){
                evt.preventDefault();
            });

            if (_this.options.adaptiveImagesEnabled) {
                _this.adaptiveImages[img.src] = new AdaptiveImage($('img', $a), {
                    emptyImage: _this.options.emptyImage,
                    oriSrc: img.src,
                    oriWidth: _this.images[i].w,
                    oriHeight: _this.images[i].h,
                    threshold: _this.options.adaptiveImagesThreshold
                });
            }
        });

        if (this.options.touchEventsEnabled) {
            $(window).on('touchstart', function(evt) {
                if (!_this.blocked
                    && !getCallable(_this.options.isMobile)
                    && $(evt.target).closest(_this.$el).length) {
                    if (useCSS3Animation) {
                        var matches = _this.$container.css('transform').match(/(-*[0-9])+/g);
                        _this.touchStartOffsetX = parseInt(matches[4]);
                        Utils.css3(_this.$container, {
                            '%stransform': 'translate(' + _this.touchStartOffsetX + 'px, 0px)',
                            '%stransition': '%stransform 0s'
                        });
                    } else {
                        _this.touchStartOffsetX = parseInt(_this.$container.css('marginLeft'), 10);
                    }

                    var t = evt.originalEvent.targetTouches[0];
                    _this.touchStartX = t.clientX;
                    _this.touchStartY = t.clientY;

                    _this.imageTouch = true;
                }
            });

            $(window).on('touchmove', function(evt) {
                if (_this.imageTouch) {
                    var t = evt.originalEvent.targetTouches[0];
                    var offsetX = t.clientX - _this.touchStartX;
                    //var offsetY = t.clientY - _this.touchStartY;

                    var offset = _this.touchStartOffsetX + offsetX;
                    if (useCSS3Animation) {
                        Utils.css3(_this.$container, {
                            '%stransform': 'translate(' + offset + 'px, 0px)',
                            '%stransition': '%stransform 0s'
                        });
                    } else {
                        _this.$container.css('marginLeft', offset);
                    }
                }
            });

            $(window).on('touchend', function(evt) {
                if (_this.imageTouch) {
                    var t = evt.originalEvent.changedTouches[0];
                    _this.touchEndX = t.clientX;
                    _this.touchEndY = t.clientY;

                    var diffX = _this.touchEndX - _this.touchStartX;
                    //var diffY = _this.touchEndY - _this.touchStartY;

                    var imageTouchThreshold = _this.options.imageTouchThreshold * _this.$el.width();

                    if (diffX < 0 && Math.abs(diffX) > imageTouchThreshold) {
                        _this.movePixels(-diffX);
                    } else if (diffX > 0 && diffX > imageTouchThreshold) {
                        _this.movePixels(-diffX);
                    } else {
                        _this.moveImages(0, _this.options.animationDuration / 2, true);
                    }
                }
                _this.imageTouch = false;
            });
        }
    };

    Obj.prototype.initAdaptiveUI = function() {
        if (getCallable(this.options.isMobile)) {
            $('a', this.$container).css({
                paddingLeft: 0,
                paddingRight: 0,
                paddingTop: this.options.imagePadding,
                paddingBottom: this.options.imagePadding
            });

            $('a', this.$container).first().css('paddingTop', 0);
            $('a', this.$container).last().css('paddingBottom', 0);

            this.$controlLeft.hide();
            this.$controlRight.hide();
        } else {
            $('a', this.$container).css({
                paddingLeft: this.options.imagePadding,
                paddingRight: this.options.imagePadding,
                paddingTop: 0,
                paddingBottom: 0
            });

            this.$controlLeft.show();
            this.$controlRight.show();
        }
    };

    Obj.prototype.redraw = function() {
        if (!getCallable(this.options.isActive)) {
            return;
        }

        logger.log('redraw', this);

        if (getCallable(this.options.isMobile)) {
            this.redrawVertical();
        } else {
            this.redrawHorizontal();
        }
    };

    Obj.prototype.redrawHorizontal = function() {
        this.initAdaptiveUI();

        var maxScale = 0;
        for (var i = 0; i < this.images.length; i++) {
            var w = this.images[i].w;
            var h = this.images[i].h;
            maxScale = Math.max(w / h, maxScale);
        }

        var rowHeight;
        for (var i = 0; i < this.images.length; i++) {
            var h = this.images[i].h;
            if (!i) {
                rowHeight = h;
            } else {
                rowHeight = Math.min(rowHeight, h);
            }
        }

        var viewportHeight = getCallable(this.options.viewportHeight);
        if (viewportHeight) {
            rowHeight = viewportHeight;
        }

        this.$container.css('height', rowHeight);

        var viewportWidth = this.$el.width();

        // если явно не задан viewportHeight, высота slideshow определяется
        // исходя из того, что все картинки должны вмещаться по ширине
        if (!viewportHeight) {
            var maxImageWidth = Math.floor(rowHeight * maxScale);
            if (viewportWidth < maxImageWidth) {
                maxImageWidth = viewportWidth;
            }

            rowHeight = Math.floor(maxImageWidth / maxScale);
        }

        var containerWidth = 0;
        for (var i = 0; i < this.images.length; i++) {
            var w = this.images[i].w;
            var h = this.images[i].h;
            var itemWidth = Math.round(rowHeight * w / h);

            var iW = itemWidth;
            var iH = rowHeight;

            // для случаев, когда картинка не вмещается по ширине
            if (viewportWidth < itemWidth) {
                iH = Math.round(viewportWidth * iH / iW);
                iW = viewportWidth;
            }

            containerWidth += iW;

            $('a[data-idx="' + i + '"] img', this.$el).css({
                width: iW,
                height: iH,
                marginTop: (rowHeight - iH) / 2
            }).attr({
                width: iW,
                height: iH
            });
        }

        var paddingWidth = this.options.imagePadding * 2 * this.images.length;
        var offset = this.calculateContainerOffset();
        this.$container.css({
            width: containerWidth + paddingWidth,
            height: rowHeight
        });

        if (useCSS3Animation) {
            Utils.css3(this.$container, {
                '%stransform': 'translate(' + offset + 'px, 0px)',
                '%stransition': '%stransform 0s'
            });
        } else {
            this.$container.css({
                marginLeft: offset
            });
        }

        this.preloadHorizontalImages();
    };

    Obj.prototype.redrawVertical = function() {
        this.initAdaptiveUI();

        var containerWidth = this.$el.width();
        var containerHeight = 0;
        for (var i = 0; i < this.images.length; i++) {
            var w = this.images[i].w;
            var h = this.images[i].h;
            var itemHeight = Math.round(containerWidth * h / w);

            $('a[data-idx="' + i + '"] img', this.$el).css({
                width: containerWidth,
                height: itemHeight,
                marginTop: 0
            }).attr({
                width: containerWidth,
                height: itemHeight
            });

            containerHeight += itemHeight;
        }

        var paddingHeight = this.options.imagePadding * 2 * (this.images.length - 1);
        this.$container.css({
            width: containerWidth,
            height: containerHeight + paddingHeight
        });

        if (useCSS3Animation) {
            Utils.css3(this.$container, {
                '%stransform': 'translate(0px, 0px)',
                '%stransition': '%stransform 0s'
            });
        } else {
            this.$container.css('marginLeft', 0);
        }

        this.preloadVerticalImages();
    };

    Obj.prototype.calculateContainerOffset = function() {
        var viewportWidth = this.$el.width();
        var currentImageWidth = $('a:eq(' + this.offset + ')', this.$container).outerWidth();
        var imageOffset = Math.floor((viewportWidth - currentImageWidth) / 2);
        var containerOffset = 0;
        for (var i = 0; i < this.offset; i++) {
            containerOffset += $('a:eq(' + i + ')', this.$container).outerWidth();
        }

        return -(containerOffset - imageOffset);
    };

    Obj.prototype.preloadImage = function($a) {
        if (!$a.length) return;

        if (this.options.adaptiveImagesEnabled) {
            var $i = $('img', $a);
            this.adaptiveImages[$a.attr('data-src')].load(parseInt($i.attr('width'), 10),
                                                          parseInt($i.attr('height'), 10));
        } else {
            if (!$a.attr('data-image-loaded')) {
                $a.attr('data-image-loaded', 1);
                $('img', $a).attr('src', $a.attr('data-src'));
            }
        }
    };

    Obj.prototype.preloadHorizontalImages = function() {
        for (var i = this.offset - 3; i < this.offset + 4; i++) {
            var $a = $('a:eq(' + i + ')', this.$container);
            this.preloadImage($a);
        }
    };

    // TODO: optimize
    Obj.prototype.preloadVerticalImages = function() {
        var _this = this;
        $('a', this.$container).each(function() {
            _this.preloadImage($(this));
        });
    }

    Obj.prototype.moveImages = function(d, duration, async) {
        if (!this.blocked || async) {
            if (!async) {
                this.$container.stop();
                this.blocked = true;
            }

            var viewportWidth = this.$el.width();
            var imageOffset = 0;

            for (var i = 0; i < Math.abs(d); i++) {
                if (d > 0) {
                    imageOffset += this.appendImage();
                } else if (d < 0) {
                    imageOffset -= this.prependImage();
                }
            }

            if (typeof(duration) === 'undefined') {
                duration = this.options.animationDuration;
            }

            var _this = this;
            if (useCSS3Animation) {
                var matches = this.$container.css('transform').match(/(-*[0-9])+/g);
                var initialOffset = parseInt(matches[4]) + imageOffset;

                Utils.css3(this.$container, {
                    '%stransform': 'translate(' + initialOffset + 'px, 0px)',
                    '%stransition': '%stransform 0s'
                });

                Utils.css3(this.$container, {
                    '%stransform': 'translate(' + this.calculateContainerOffset() + 'px, 0px)',
                    '%stransition': '%stransform ' + duration + 's linear'
                });

                window.setTimeout(function() {
                    _this.blocked = false;
                    _this.onSlideEnd();
                }, duration * 1000);
            } else {
                var initialOffset = parseInt(this.$container.css('marginLeft')) + imageOffset;
                this.$container.css('marginLeft', initialOffset);

                this.$container.animate({
                    marginLeft: this.calculateContainerOffset()
                }, duration * 1000, function() {
                    _this.blocked = false;
                    _this.onSlideEnd();
                });
            }
        }

        this.preloadHorizontalImages();
    };

    Obj.prototype.onSlideEnd = function() {
        if (typeof(this.options.onSlideEnd) === 'function') {
            this.options.onSlideEnd($('a:eq(' + this.offset + ')', this.$container));
        }
    }

    Obj.prototype.movePixels = function(i) {
        if (!this.blocked) {
            var imageOffset = 0;
            var k = 0;
            while (Math.abs(imageOffset) < Math.abs(i)) {
                if (i > 0) {
                    imageOffset += this.appendImage();
                } else if (i < 0) {
                    imageOffset -= this.prependImage();
                }

                k += 1;
                if (k > 100) break;
            }

            var _this = this;
            if (useCSS3Animation) {
                var matches = this.$container.css('transform').match(/(-*[0-9])+/g);
                var initialOffset = parseInt(matches[4]) + imageOffset;

                Utils.css3(this.$container, {
                    '%stransform': 'translate(' + initialOffset + 'px, 0px)',
                    '%stransition': '%stransform 0s'
                });

                Utils.css3(this.$container, {
                    '%stransform': 'translate(' + this.calculateContainerOffset() + 'px, 0px)',
                    '%stransition': '%stransform ' + this.options.animationDuration + 's linear'
                });

                window.setTimeout(function() {
                    _this.blocked = false;
                }, this.options.animationDuration * 1000);
            } else {
                var initialOffset = parseInt(this.$container.css('marginLeft')) + imageOffset;
                this.$container.css('marginLeft', initialOffset);

                this.$container.animate({
                    marginLeft: this.calculateContainerOffset()
                }, this.options.animationDuration * 1000, 'linear', function() {
                    _this.blocked = false;
                });
            }
        }

        this.preloadHorizontalImages();
    }

    Obj.prototype.goto = function(i) {
        var currentIdx = parseInt($('a:eq(' + this.offset + ')', this.$container).attr('data-idx'), 10);
        var newIdx = i - this.offset - this.offsetRem;
        var k1 = (currentIdx > newIdx ? -1 : 1);
        var d0 = this.images.length;
        var d1 = Math.abs(currentIdx - newIdx);
        var d2 = d0 + k1 * (currentIdx - newIdx);
        var k2 = (d1 <= d2 ? 1 : -1);
        var k = k1 * k2;
        var d = Math.min(d1, d2);
        this.moveImages(k * d, 0);

        logger.log('goto', d, (k > 0 ? 'R' : 'L'));
    };

    Obj.prototype.appendImage = function() {
        var $im = $('a:first-child', this.$container);
        var offset = $im.width();
        $im.appendTo(this.$container);
        return offset;
    };

    Obj.prototype.prependImage = function() {
        var $im = $('a:last-child', this.$container);
        var offset = $im.width();
        $im.prependTo(this.$container);
        return offset;
    };

    Obj.prototype.destroy = function() {
        var idx = $.inArray(this, manager);
        if (idx != -1) {
            manager.splice(idx, 1);
        }

        this.$container.remove();  // remove DOM elements, data and event handlers
        this.$controlLeft.off('click');
        this.$controlRight.off('click');
    };

    var useCSS3Animation = false;

    function getCallable(v) {
        return typeof(v) === 'function' ? v() : v;
    }

    function redraw(i) {
        var items = i ? [manager[i]] : manager;

        $(items).each(function(i, obj) {
            obj.redraw();
        });
    }

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

        useCSS3Animation = Utils.supportsCSSProp('transition') 
                           && Utils.supportsCSSProp('transform');

        logger.log('init');
    };

    return module;
}(jQuery, Logger, Translator, Utils, AdaptiveImage));