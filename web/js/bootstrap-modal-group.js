'use strict';

/*
Для корректной работы модуля необходимо добавить в стили страницы что то типа:

    <style>
        body.modal-open-multiple .modal-backdrop {
            .transition(opacity 0s linear);
        }
    </style>

*/

var BootstrapModalGroup = (function($, Logger) {
    var module = {};

    var settings = {
        moduleName: 'BootstrapModalGroup',
        debug: true
    };

    var logger;

    var manager = [];

    var TYPE_QUEUE = 1;
    var TYPE_STACK = 2;

    // дефолтный класс Bootstrap для backdrop
    var classNameModalBackdrop = 'modal-backdrop';

    // дефолтный класс Bootstrap для body для открытого модального окна
    var classNameModalOpen = 'modal-open';

    // дополнительный класс для body для нескольких открытых модальных окон
    var classNameModalOpenMultiple = 'modal-open-multiple';

    var Obj = function(modals, options) {
        options = options || {};

        this.modals = modals;

        this.options = {
            type: TYPE_QUEUE
        };

        for (var pr in options) {
            this.options[pr] = options[pr];
        }

        this.scrollbarWidth = 0;
        this.initialScrollbarWidth = 0;

        var _this = this;
        $(this.modals).each(function(i, $modal) {
            _this.init($modal);
        });

        logger.log('created', this);
    };

    // проверка есть открытые окна помимо текущего или нет
    Obj.prototype.isActive = function($modal) {
        var result = false;

        for (var i = 0; i < this.modals.length; i++) {
            var $obj = this.modals[i];

            if ($modal != $obj && $obj.data('active')) {
                result = true;
                break;
            }
        }

        return result;
    };

    // определение текущей ширины scrollbar на основе того, как это сделано в
    // модуле Bootstrap - modal.js
    Obj.prototype.getScrollbarWidth = function() {
        return parseInt($(document.body).css('paddingRight'), 10);
    };

    Obj.prototype.setScrollbarWidth = function(val) {
        $(document.body).css('paddingRight', val);
    };

    Obj.prototype.init = function($modal) {
         var _this = this;

        // Случай "последовательного модального интерфейса",
        // когда модальные окна открываются "одно за другим".
        // Перед открытием любого окна закрывается предыдущее окно.
        if (this.options.type == TYPE_QUEUE) {
            $modal.on('show.bs.modal', function() {
                $modal.data('active', true);

                if (_this.isActive($modal)) {
                    // убираем transition эффект для всех backdrop
                    $(document.body).addClass(classNameModalOpenMultiple);

                    // прячем предшествующие backdrops, чтобы они не накладывались
                    // на backdrop, созданный для текущего модального окна
                    $('.' + classNameModalBackdrop).hide();

                    // запускаем закрытие предыдущего модального окна
                    var index = $.inArray($modal, _this.modals);
                    _this.modals[index - 1].modal('hide');
                } else {
                    _this.initialScrollbarWidth = _this.getScrollbarWidth();
                }
            });


            $modal.on('shown.bs.modal', function() {
                _this.scrollbarWidth = _this.getScrollbarWidth();
            });

            $modal.on('hide.bs.modal', function() {
                $modal.data('active', false);

                if (!_this.isActive($modal)) {
                    $(document.body).removeClass(classNameModalOpenMultiple);
                }
            });

            $modal.on('hidden.bs.modal', function() {
                if (_this.isActive($modal)) {
                    _this.setScrollbarWidth(_this.scrollbarWidth);
                    $(document.body).addClass(classNameModalOpen);
                } else {
                    _this.setScrollbarWidth(_this.initialScrollbarWidth);
                }
            });
        }

        // Случай "многослойного модального интерфейса",
        // когда модальные окна открываются и закрываются "одно над другим".
        // Например, после закрытия окна №2, снова откроется окно №1
        else if (this.options.type == TYPE_STACK) {
            $modal.on('show.bs.modal', function() {
                $modal.data('active', true);

                if (_this.isActive($modal)) {
                    // убираем transition эффект для всех backdrop
                    $(document.body).addClass(classNameModalOpenMultiple);

                    // прячем предшествующие backdrops, чтобы они не накладывались
                    // на backdrop, созданный для текущего модального окна
                    $('.' + classNameModalBackdrop).hide();

                    // прячем предшествующее модальное окно
                    var index = $.inArray($modal, _this.modals);
                    _this.modals[index - 1].hide();
                }
            });

            $modal.on('hide.bs.modal', function() {
                $modal.data('active', false);

                if (_this.isActive($modal)) {
                    var index = $.inArray($modal, _this.modals);

                    // прячем текущий backdrop и показываем предшествующий -
                    // для пользователя эта смена останется незамеченной
                    $('.' + classNameModalBackdrop).eq(index).hide();
                    $('.' + classNameModalBackdrop).eq(index - 1).show();
                } else {
                    // для первого модального окна нам нужен transition эффект
                    // при закрытии
                    $(document.body).removeClass(classNameModalOpenMultiple);
                }
            });

            $modal.on('hidden.bs.modal', function() {
                if (_this.isActive($modal)) {
                    var index = $.inArray($modal, _this.modals);

                    // показываем предшествующее модальное окно
                    $(document.body).addClass(classNameModalOpen);
                    _this.modals[index - 1].show();
                }
            });
        }
    };

    function register(modals, type) {
        var obj = new Obj(modals, {type: type});
        manager.push(obj);
        return obj;
    }

    function init() {
    }

    module.init = function(_settings) {
        _settings = _settings || {};

        for (var pr in _settings) {
            settings[pr] = _settings[pr];
        }

        logger = new Logger(settings);

        init();
    };

    /**
     * Регистрация группы модальных окон c поведением типа "очередь".
     * @param {list} список модальных окон Bootstrap.
     */
    module.registerQueue = function(modals) {
        register(modals, TYPE_QUEUE);
    };

    /**
     * Регистрация группы модальных окон c поведением типа "стек".
     * @param {list} список модальных окон Bootstrap.
     */
    module.registerStack = function(modals) {
        register(modals, TYPE_STACK);
    };

    return module;
}(jQuery, Logger));
