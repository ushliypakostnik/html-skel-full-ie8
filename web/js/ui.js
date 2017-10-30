'use strict';


var UI = (function($, Logger, Translator) {
    var module = {};

    var settings = {
        moduleName: 'UI',
        debug: true
    };

    var logger;
    var t;

    var manager = [];

    var STATE_DEFAULT = 'd';
    var STATE_ACTIVE = 'a';

    var blockers = {};

    var SwitchButton = function($el, opts) {
        this.$el = $el;
        this.defaultContent = $el.html();

        opts = opts || {};

        opts.idx = opts.idx || 0;
        opts.async = opts.async || false;  // асинхронный режим (без использования блокаторов)
        opts.defaultContent = opts.defaultContent || this.defaultContent;  // содержимое дефолтной кнопки (text или html)
        opts.activeContent = opts.activeContent || opts.defaultContent;  // содержимое активной кнопки (text или html)
        opts.onDefaultState = opts.onDefaultState || function(obj) {}; // обработчик смены состояния ACTIVE -> DEFAULT
        opts.onActiveState = opts.onActiveState || function(obj) {};  // обработчик смены состояния DEFAULT -> ACTIVE

        this.opts = opts;

        this.initUI();
        this.redraw();
    };

    SwitchButton.prototype.initUI = function() {
        this.defaultState(true);

        var _this = this;
        this.$el.on('click', function(evt) {
            evt.preventDefault();

            if (!_this.opts.async && blockers[_this.opts.idx]) {
                return;
            }
            blockers[_this.opts.idx] = true;

            switch (_this.$el.attr('data-state')) {
                case STATE_DEFAULT:
                    _this.activeState();
                    break;
                case STATE_ACTIVE:
                    _this.defaultState();
                    break;
                default:
                    break;
            }
        });
    };

    SwitchButton.prototype.redraw = function() {
    };

    SwitchButton.prototype.destroy = function() {
        var idx = $.inArray(this, manager);
        if (idx != -1) {
            manager.splice(idx, 1);
        }

        this.$el.html(this.defaultContent);
        this.$el.removeAttr('data-state');
        this.$el.off('click');
    };

    SwitchButton.prototype.isActive = function() {
        return this.$el.attr('data-state') == STATE_ACTIVE;
    };

    SwitchButton.prototype.clearBlocker = function() {
        blockers[this.opts.idx] = false;
    };

    SwitchButton.prototype.activeState = function(skipAction) {
        this.$el.html(this.opts.activeContent);
        this.$el.attr('data-state', STATE_ACTIVE);
        if (!skipAction) {
            this.opts.onActiveState(this);
        }
    };

    SwitchButton.prototype.defaultState = function(skipAction) {
        this.$el.html(this.opts.defaultContent);
        this.$el.attr('data-state', STATE_DEFAULT);
        if (!skipAction) {
            this.opts.onDefaultState(this);
        }
    };

    /**
     * Создание кнопки-переключателя.
     * @param {object} кнопка.
     * @param {object|null} настройки.
     */
    module.createSwitchButton = function($el, opts) {
        logger.log('switch button created', $el);

        opts = opts || {};
        opts.idx = manager.length;

        var obj = new SwitchButton($el, opts);
        manager.push(obj);
        return obj;
    };

    /**
     * Удаение кнопки-переключателя.
     * @param {object} кнопка.
     */
    module.destroySwitchButton = function($el) {
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

        logger.log('init');
    };

    return module;
}(jQuery, Logger, Translator));
