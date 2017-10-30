'use strict';


var SandboxSinglepage = (function($, Logger, Translator, History) {
    var module = {};

    var settings = {
        moduleName: 'SandboxSinglepage',
        debug: true,

        albums: {},  // картинки для альбомов
        defaultAlbum: '',

        // галерея
        galleryRowHeight: 100,
        galleryMargin: 0,

        // slideshow
        slideshowImagePadding: 0,
        slideshowEmptyImage: '',

        // общие
        isMobile: function() {
            return false;
        }
    };

    var ui = {
        slideshow: '#slideshow',  // контейнер для slideshow
        gallery: '#gallery',  // контейнер для галереи
        overlaySlideshow: '#overlaySlideshow',  // overlay для slideshow
        overlayImagebox: '#overlayImagebox',  // overlay для галереи

        albumTriggers: '.album-trigger'  // управление альбомами
    };

    var logger;
    var t;

    var state = History.getState();

    var slideshow;
    var gallery;
    var overlaySlideshow;
    var overlayImagebox;

    function initAlbum(album) {
        var images = settings.albums[album];
        if (!images) {
            return;
        }

        Gallery.destroy();
        Slideshow.destroy();

        overlaySlideshow.hide();

        // галерея
        gallery = Gallery.create(
            ui.gallery,
            images,
            {
                width: function() {
                    return ui.gallery.width()
                },
                rowHeight: settings.galleryRowHeight,
                margin: settings.galleryMargin,
                isActive: function() {
                    return !Overlay.isActive();
                },
                onClick: function(idx, img) {
                    var showSlideshow = function() {
                        overlaySlideshow.onShow(function() {
                            slideshow.redraw();
                            slideshow.goto(idx);
                        });

                        overlaySlideshow.onHide(function() {
                            Gallery.redraw();
                        });

                        overlaySlideshow.show();
                    };

                    var showImagebox = function() {
                        var ibox = Imagebox.create(
                            ui.overlayImagebox,
                            {
                                src: img.src,
                                width: img.w,
                                height: img.h
                            }
                        );

                        overlayImagebox.onShow(function() {
                            ibox.redraw();
                        });

                        overlayImagebox.onHide(function() {
                            ibox.destroy();
                            Gallery.redraw();
                        });

                        overlayImagebox.show();
                    };

                    if (settings.isMobile()) {
                        showImagebox();
                    } else {
                        showSlideshow();
                    }
                }
            }
        );

        slideshow = Slideshow.create(
            ui.slideshow,
            images,
            {
                imagePadding: settings.slideshowImagePadding,
                emptyImage: settings.slideshowEmptyImage,
                isMobile: function() {
                    return settings.isMobile();
                },
                viewportHeight: function() {
                    return overlaySlideshow.getContentHeight();
                },
                isActive: function() {
                    return overlaySlideshow.isActive();
                }
            }
        );
    }

    function init() {
        // на событие "statechange" будет происходить перерисовка альбома
        History.Adapter.bind(window, 'statechange', function() {
            var state = History.getState();

            // инициализация альбома
            initAlbum(state.data.album);

            logger.log('statechange', state.data, state.title, state.url);
        });

        // инициализация модулей
        Overlay.init({
            debug: settings.debug
        });

        Imagebox.init({
            debug: settings.debug
        });

        Gallery.init({
            debug: settings.debug
        });

        Slideshow.init({
            debug: settings.debug
        });

        $(document).ready(function() {
            logger.log('event: DOM ready');

            // prepare jquery ui objects
            for (var pr in ui) {
                ui[pr] = $(ui[pr]);
            }

            // overlay №1 (для slideshow)
            overlaySlideshow = Overlay.create(
                ui.overlaySlideshow
            );

            // overlay №2 (для imagebox)
            overlayImagebox = Overlay.create(
                ui.overlayImagebox
            );

            // триггеры (например, ссылки меню)
            ui.albumTriggers.on('click', function(evt) {
                evt.preventDefault();
                var $el = $(this);

                // добавление в историю браузера
                History.pushState({
                    album: $el.attr('data-album')
                }, $el.attr('data-title'), $el.attr('data-href'));
            });

            // дефолтный альбом
            if (settings.defaultAlbum) {
                initAlbum(settings.defaultAlbum);
            }
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
}(jQuery, Logger, Translator, History));
