'use strict';


var Page = (function($, BootstrapHelper) {
    var module = {};

    module.scrollToBlock = function($el, offsetTop) {
        $('body, html').animate({
            scrollTop: $el.offset().top - offsetTop
        }, getAnimationSpeed());
    }

    function getAnimationSpeed() {
        if (document.documentElement.clientWidth >= BootstrapHelper.screenSM) {
            return 300;
        }
        return 100;
    }

    // Для UI-trand-01
    module.getAnimationSpeed = getAnimationSpeed;

    // Для UI-trand-01
    module.getMenuWidth = function() {
        var w = document.documentElement.clientWidth;
        if (w >= BootstrapHelper.screenMG) {
            return 0.7;
        }
        if (w >= BootstrapHelper.screenLG) {
            return 0.6;
        }
        if (w >= BootstrapHelper.screenMD) {
            return 0.55;
        }
        if (w >= BootstrapHelper.screenSM) {
            return 0.45;
        }
        if (w >= BootstrapHelper.screenXS) {
            return 0.3;
        }
        return 0.25;
    }

    module.headerCheck = function() {
        var width = 0;
        $('header > div > nav > ul > li').each(function() {
            width += $(this).outerWidth(true);
        });

        var padding = parseInt($('header > div').css('padding-left'), 10) * 2;

        var logoWidth = 0;
        if ($('#logo').length) {
            logoWidth = $('#logo').outerWidth(true);
        }

        return width + logoWidth < document.documentElement.clientWidth - padding;
    };

    module.footerCheck = function() {
        var width = 0;
        $('footer > div > address > div:first-child > ul > li').each(function() {
            width += $(this).outerWidth(true);
        });

        var padding = parseInt($('footer > div').css('padding-left'), 10) * 2;

        var copyrightWidth = 0;
        if ($('footer > div > address > div:last-child').length) {
            copyrightWidth = $('footer > div > address > div:last-child').outerWidth(true);
        }

        return width + copyrightWidth < document.documentElement.clientWidth - padding;
    };

    module.redrawObjectBlocks = function() {
        $('.objectBlock').each(function () {
            var $this = $(this);
            var $objectCard = $this.find('.objectCard');
            $this.innerHeight($objectCard.innerHeight());
            $this.find('.objectImg').innerHeight($objectCard.innerHeight());
            $this.find('.objectImgLink').innerHeight($objectCard.innerHeight());
        });
    };

    module.checkMenu = function() {
        var $menu = $('#menu');
        if ($menu.length && BootstrapHelper.getCoords($menu.get(0)).top < 0) {
            $menu.addClass('fixedMenu');
            $menu.css('top', $('header').innerHeight());
        }

        var $prevEl = $('#prevEl');
        if ($prevEl.length && BootstrapHelper.getCoords($prevEl.get(0)).bottom > BootstrapHelper.getCoords($menu.get(0)).top) {
            $menu.removeClass('fixedMenu');
            $menu.css('top', 'auto');
        }
    }

    module.fixedSection = function($el) {
        var $prevEl = $el.prev();
        var $nextEl = $el.next();
        if (BootstrapHelper.isMD() || BootstrapHelper.isLG() || BootstrapHelper.isMG()) {
            if ($el.length && $nextEl.length && BootstrapHelper.getCoords($el.get(0)).top < 0) {
                $el.addClass('fixedSection');
                $nextEl.css('margin-top',$el.innerHeight());
            }
            if ($el.length && $nextEl.length && $prevEl.length && BootstrapHelper.getCoords($prevEl.get(0)).bottom > BootstrapHelper.getCoords($el.get(0)).top) {
                $el.removeClass('fixedSection');
                $nextEl.css('margin-top',0);
            }
        } else if ($el.length && $nextEl.length) {
            $el.removeClass('fixedSection');
            $nextEl.css('margin-top',0);
        }
    }

    return module;
}(jQuery, BootstrapHelper));
