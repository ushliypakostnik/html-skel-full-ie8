'use strict';


var UITrand = (function($, Logger, Translator, BootstrapHelper, Utils) {
    var module = {};

    var settings = {
        moduleName: 'UITrand',
        debug: true
    };

    var ui = {
        body: 'body',
        mobileNav: '#mobileNav',
        mobileClose: '#mobileClose',
        content: '.content',
        overlay: '.overlay-uitrand',
        panel: '.panel'
    };

    var logger;
    var t;

    var useCSS3Animation;
    var animationDurationMS = 300;
    var animationDuration = animationDurationMS / 1000;

    function openPanel() {
        ui.body.addClass('panel-open');

        ui.overlay.css({
            display: 'block',
            height: '100%'
        });

        ui.panel.css('position', 'relative');

        var h1 = ui.overlay.height() + 1;  // keep scrolling
        var h2 = ui.panel.outerHeight();
        var h = Math.max(h1, h2);

        ui.panel.css('height', h);
        ui.overlay.css('height', h);

        ui.content.css('position', 'absolute');
        ui.mobileClose.css('display', 'block');

        setPanelTtransition(animationDuration);
        if (useCSS3Animation) {
            Utils.css3(ui.content, {'%stransform': 'translate(-70%, 0px)'});
            ui.overlay.css({opacity: 0.8});
            Utils.css3(ui.panel, {width: '100%', '%stransform': 'translate(-70%, 0px)'});
            ui.mobileNav.css({opacity: 0});
            window.setTimeout(function() {
                ui.mobileClose.css({opacity: 1});
            }, 10);
        } else {
            ui.content.animate({marginLeft: '-70%'}, {duration: animationDurationMS, queue: false});
            ui.overlay.animate({opacity: 0.8}, {duration: animationDurationMS, queue: false});
            ui.panel.animate({left: '30%'}, {duration: animationDurationMS, queue: false});
            ui.mobileNav.animate({ opacity: 0}, {duration: animationDurationMS, queue: false});
            ui.mobileClose.animate({opacity: 1}, {duration: animationDurationMS, queue: false});
        }
    }

    function closePanel() {
        ui.body.removeClass('panel-open');

        setPanelTtransition(animationDuration);
        if (useCSS3Animation) {
            Utils.css3(ui.content, {'%stransform': 'translate(0px, 0px)'});
            ui.overlay.css({opacity: 0});
            window.setTimeout(function() {
                ui.panel.css({height: 'auto', position: 'absolute'});
                ui.content.css({height: 'auto', position: 'relative'});
                ui.overlay.hide();
                ui.mobileClose.hide();
            }, animationDurationMS);
            Utils.css3(ui.panel, {'%stransform': 'translate(0px, 0px)'});
            ui.mobileClose.css({opacity: 0});
            window.setTimeout(function() {
                ui.mobileNav.css({opacity: 1});
            }, 10);
        } else {
            ui.content.animate({
                marginLeft: '0'
            }, {
                duration: animationDurationMS,
                complete: function() {
                    ui.panel.css({height: 'auto', position: 'absolute'});
                    ui.content.css({height: 'auto', position: 'relative'});
                    ui.overlay.hide();
                    ui.mobileClose.hide();
                }
            });
            ui.overlay.animate({opacity: 0}, {duration: animationDurationMS, queue: false});
            ui.panel.animate({left: '100%'}, {duration: animationDurationMS, queue: false});
            ui.mobileNav.animate({ opacity: 1}, {duration: animationDurationMS, queue: false});
            ui.mobileClose.animate({opacity: 0}, {duration: animationDurationMS, queue: false});
        }
    }

    function checkPanel() {
        if (ui.body.hasClass('panel-open')
            && document.documentElement.clientWidth >= BootstrapHelper.screenMD - BootstrapHelper.getScrollbarWidth()) {
            setPanelTtransition(0);

            if (useCSS3Animation) {
                Utils.css3(ui.content, {'%stransform': 'translate(0px, 0px)'});
                ui.overlay.css({opacity: 0}).hide();
                ui.panel.css({height: 'auto', position: 'absolute'});
                ui.content.css({height: 'auto', position: 'relative'});
                ui.mobileClose.css({opacity: 0}).hide();
                Utils.css3(ui.panel, {'%stransform': 'translate(0px, 0px)'});
                ui.mobileNav.css({opacity: 1});
            } else {
                ui.panel.css({left: '100%', height: 'auto', position: 'absolute'});
                ui.content.css({marginLeft: 0, height: 'auto', position: 'relative'});
                ui.overlay.css('opacity', 0).hide();
                ui.mobileClose.css('opacity', 0).hide();
                ui.mobileNav.css('opacity', 1);
            }

            ui.body.removeClass('panel-open');
        }
    }

    function setPanelTtransition(duration) {
        if (useCSS3Animation) {
            Utils.css3(ui.content, {'%stransition': '%stransform ' + duration + 's'});
            Utils.css3(ui.panel, {'%stransition': '%stransform ' + duration + 's'});
            Utils.css3(ui.overlay, {'%stransition': 'opacity ' + duration + 's'});
            Utils.css3(ui.mobileNav, {'%stransition': 'opacity ' + duration + 's'});
            Utils.css3(ui.mobileClose, {'%stransition': 'opacity ' + duration + 's'});
        }
    }

    function redraw() {
        logger.log('redraw');
        checkPanel();
    }

    function init() {
        logger.log('init');

        $(document).ready(function() {
            logger.log('event: DOM ready');

            // prepare jquery ui objects
            for (var pr in ui) {
                ui[pr] = $(ui[pr]);
            }

            // init mobile menu
            ui.mobileNav.on('click', function(evt) {
                evt.preventDefault();
                openPanel();
            });

            ui.mobileClose.on('click', function(evt) {
                evt.preventDefault();
                closePanel();
            });

            redraw();
        });

        $(window).load(function() {
            logger.log('event: window load');
            redraw();
        });

        $(window).resize(function() {
            logger.log('event: window resize');
            redraw();
        });

        $(window).scroll(function() {
            logger.log('event: window scroll');
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

        useCSS3Animation = Utils.supportsCSSProp('transition') 
                           && Utils.supportsCSSProp('transform');

        init();
    };

    return module;
}(jQuery, Logger, Translator, BootstrapHelper, Utils));
