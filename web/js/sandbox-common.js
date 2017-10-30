'use strict';


var Sandbox = (function($, Logger, Translator) {
    var module = {};

    var settings = {
        moduleName: 'Sandbox',
        debug: true
    };

    var ui = {
        testJSBlock: '#testJSBlock',
    };

    var logger;
    var t;

    function redraw() {
        logger.log('redraw');

        // логика для sandbox
        if (BootstrapHelper.isXS()) {
            ui.testJSBlock.text('Extra small devices (Phones <768px)');
        } else if (BootstrapHelper.isSM()) {
            ui.testJSBlock.text('Small devices (Tablets >=768px)');
        } else if (BootstrapHelper.isMD()) {
            ui.testJSBlock.text('Medium devices (Desktops >=992px)');
        } else if (BootstrapHelper.isC1()) {
            ui.testJSBlock.text('C1 devices (Desktops >=1000px)');
        } else if (BootstrapHelper.isLG()) {
            ui.testJSBlock.text('Large devices (Desktops >=1200px)');
        }

        if (Page.headerCheck()) {
            $('header').removeClass('mobile');
            $('header').siblings(':first').css('margin-top',$('header').innerHeight());
        } else { 
            $('header').addClass('mobile');
            $('header').siblings(':first').css('margin-top',0);
        }
        if (Page.footerCheck()) {
            $('footer').removeClass('mobile');
        } else { $('footer').addClass('mobile'); }
    }

    function init() {
        $(document).ready(function() {
            logger.log('event: DOM ready');

            // prepare jquery ui objects
            for (var pr in ui) {
                ui[pr] = $(ui[pr]);
            }

            // Для дропдаунов не закрывающихся при клике по ссылке внутри
            //ui.dropdown.on('click', function (e) {
            //    e.stopPropagation(); // This replace if conditional.
            //}); 

            // инициализация slider`ов
            $('#slider01').slider();

            $('#slider02').slider({
                min: 0,
                max: 100,
                value: 50,
                step: 5,
                handle: 'square',
                tooltip: 'always',
                formater: function(value) {
                    return 'Лёва заработал: ' + value + ' руб.';
                }
            }).on('slide', function(evt) {
                $('#slider02Text').val(evt.value + ' руб. заработал Лёва');
            });

            $('#slider03').slider();
            $('#slider03').slider('disable');

            // Пример инициализации и адаптивной логики показа подсказки (на экранах гаджетов подсказки не нужны)
            /*ui.tooltipElement.tooltip();
            ui.tooltipElement.on('show.bs.tooltip', function() {
                if (document.documentElement.clientWidth < BootstrapHelper.screenMD - BootstrapHelper.getScrollbarWidth()) {
                    return false;
                }
                return true;
            });*/

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
