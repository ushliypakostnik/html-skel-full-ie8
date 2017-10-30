'use strict';


var Page2 = (function($, Logger, Translator) {
    var module = {};

    var settings = {
        moduleName: 'Page2',
        debug: true
    };

    var ui = {
        box: '#testBlock2'
    };

    var logger;
    var t;

    function redraw() {
        logger.log('redraw');

        // увеличиваем размер блока на 1px
        ui.box.css({
            width: ui.box.width() + 1,
            height: ui.box.height() + 1
        });
    }

    function init() {
        $(document).ready(function() {
            logger.log('event: DOM ready');

            // prepare jquery ui objects
            for (var pr in ui) {
                ui[pr] = $(ui[pr]);
            }

            // рисуем блок
            ui.box.css({
                backgroundColor: 'yellow',
                width: '150px',
                height: '150px'
            });

            redraw();
        });

        $(window).load(function() {
            logger.log('event: window load');

            redraw();
        });

        $(window).scroll(function() {
            logger.log('event: window scroll');

            // теоретически событие может наступить до того, как будет готова DOM модель,
            // поэтому, чтобы избежать ошибок, используем здесь $(ui.el) вместо ui.el
        });

        $(window).resize(function() {
            logger.log('event: window resize');

            redraw();
        });
    }

    module.init = function(_settings, _translations) {
        _settings = _settings || {};
        _translations = _translations || {};

        for (var pr in _settings) {
            settings[pr] = _settings[pr];
        }

        logger = new Logger(settings);
        t = new Translator(_translations);

        init();

        logger.log('init');
    };

    return module;
}(jQuery, Logger, Translator));
