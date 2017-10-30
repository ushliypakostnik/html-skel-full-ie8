'use strict';


var BootstrapHelper = (function() {
    var module = {};

    // http://getbootstrap.com/css/#grid
    // http://getbootstrap.com/css/#responsive-utilities
    var minWidth = 320;
    var screenXS = 480;
    var screenSM = 768;
    var screenMD = 992;
    var screenC1 = 1000;
    var screenLG = 1200;
    var screenMG = 1700;

    module.getScrollbarWidth = function() {
        var bw1 = $('body').width();
        $('body').css('overflow', 'hidden');
        var bw2 = $('body').width();
        $('body').css('overflow', '');
        return bw2 - bw1;
    };

    // BootstrapHelper.getElementScrollbarWidth($(el))
    function getElementScrollbarWidth(el) {
        var $el = $(el);

        if ($el.children().length) {
            $el.css('overflow', 'hidden');
            var bw1 = $el.innerWidth();
            var $wrapped = $el.children(':first-child');
            $el.wrapInner('<div></div>');
            $el.css('overflow', 'auto');
            var bw2 = $('>div', $el).innerWidth();
            $wrapped.unwrap();
            $el.css('overflow', '');
            return bw1 - bw2;
        }

        return 0;
    };

    module.getElementScrollbarWidth = getElementScrollbarWidth;

    module.minWidth = minWidth;

    module.screenXS = screenXS;

    module.screenSM = screenSM;

    module.screenMD = screenMD;

    module.screenC1 = screenC1;

    module.screenLG = screenLG;

    module.screenMG = screenMG;

    module.isXS = function() {
        return window.matchMedia('(max-width: ' + (screenSM - 1) + 'px)').matches;
    };

    module.isSM = function() {
        return window.matchMedia('(min-width: ' + screenSM + 'px) and (max-width: ' + (screenMD - 1) + 'px)').matches;
    };

    module.isMD = function() {
        return window.matchMedia('(min-width: ' + screenMD + 'px) and (max-width: ' + (screenLG - 1) + 'px)').matches;
    };

    module.isLG = function() {
        return window.matchMedia('(min-width: ' + screenLG + 'px) and (max-width: ' + (screenMG - 1) + 'px)').matches;
    };

    module.isMG = function() {
        return window.matchMedia('(min-width: ' + screenMG + 'px)').matches;
    };

    module.isC1 = function() {
        return window.matchMedia('(max-width: ' + screenC1 + 'px)').matches;
    };

    function getCoords(el) {
        return (el.getBoundingClientRect());
    }

    module.getCoords = getCoords;

    return module;
}());
