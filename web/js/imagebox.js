'use strict';


var Imagebox = (function($, Logger, Translator) {
    var module = {};

    var settings = {
        moduleName: 'Imagebox',
        debug: true
    };

    var logger;
    var t;

    var manager = [];

    var Obj = function($el, options) {
        options = options || {};

        this.$el = $el;

        this.options = {
            src: '',
            width: 0,
            height: 0
        };

        for (var pr in options) {
            this.options[pr] = options[pr];
        }

        this.initUI();
        this.redraw();
    };

    Obj.prototype.initUI = function() {
        this.$img = $('<img src="' + this.options.src + '" width="0" height="0" />').appendTo(this.$el);
    };

    Obj.prototype.redraw = function() {
        logger.log('redraw', this);

        var iW = this.options.width;
        var iH = this.options.height;
        var oW = this.$el.width();
        var oH = this.$el.height();

        var w = iW;
        var h = iH;

        if (iH > oH && iH * oW > iW * oH) { // Height ratio > width ratio > 1
            h = oH;
            w = Math.round(iW * h / iH);
        } else if (iW > oW) {
            w = oW;
            h = Math.round(iH * w / iW);
        }

        var marginLeft = Math.round((oW - w) / 2);
        var marginTop = Math.round((oH - h) / 2);

        this.$img.attr({
            width: w,
            height: h
        }).css({
            width: w,
            height: h,
            marginLeft: marginLeft,
            marginTop: marginTop
        });
    };

    Obj.prototype.destroy = function() {
        var idx = $.inArray(this, manager);
        if (idx != -1) {
            manager.splice(idx, 1);
        }
        this.$img.remove();
    };

    function redraw() {
        $(manager).each(function(i, obj) {
            obj.redraw();
        });
    }

    module.create = function($el, options) {
        options = options || {};

        var obj = new Obj($el, options);
        manager.push(obj);
        return obj;
    };

    
    module.destroy = function($el) {
        $(manager).each(function(i, obj) {
            obj.destroy();
        });
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
}(jQuery, Logger, Translator));
