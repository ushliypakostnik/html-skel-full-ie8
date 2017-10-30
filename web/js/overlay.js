'use strict';


var Overlay = (function($, Logger, Translator) {
    var module = {};

    var settings = {
        moduleName: 'Overlay',
        debug: true,

        closeBtn: '<a class="btn-close" href="#">&times;</a>'
    };

    var logger;
    var t;

    var manager = [];

    var Obj = function($el, options) {
        options = options || {};

        this.$el = $el;

        this.options = {};

        for (var pr in options) {
            this.options[pr] = options[pr];
        }

        this.onShowCallback = function() {};
        this.onHideCallback = function() {};

        this.visible = false;

        this.initUI();
    };

    Obj.prototype.initUI = function() {
        var _this = this;

        var $closeBtn = $(settings.closeBtn).appendTo(this.$el);
        $closeBtn.on('click', function(evt) {
            evt.preventDefault();
            _this.hide();
        });
    };

    Obj.prototype.show = function() {
        this.visible = true;
        this.$el.show();
        this.onShowCallback();
    };

    Obj.prototype.hide = function() {
        this.visible = false;
        this.$el.hide();
        this.onHideCallback();
    };

    Obj.prototype.isActive = function() {
        return this.visible;
    };

    Obj.prototype.getContentWidth = function() {
        return this.$el.width();
    };

    Obj.prototype.getContentHeight = function() {
        return this.$el.height();
    };

    Obj.prototype.onShow = function(cb) {
        this.onShowCallback = cb;
    };

    Obj.prototype.onHide = function(cb) {
        this.onHideCallback = cb;
    };

    module.isActive = function() {
        var result = false;
        $(manager).each(function(i, obj) {
            if (obj.isActive()) {
                result = true;
            }
        });
        return result;
    };

    module.create = function($el, options) {
        options = options || {};

        var obj = new Obj($el, options);
        manager.push(obj);
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

        logger.log('init');
    };

    return module;
}(jQuery, Logger, Translator));
