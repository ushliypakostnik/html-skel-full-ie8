'use strict';


var SandboxForm = (function($, Logger, Translator) {
    var module = {};

    var settings = {
        moduleName: 'SandboxForm',
        debug: true,

        url: ''
    };

    var ui = {
        ajax: '#ajax',
        form: '#form',
        email: '#email',
        password: '#password',
        checkbox: '#checkbox',
        btnSubmit: '#btnSubmit',
        hideElements: '.default'  // элементы которые необходимо скрыть перед отправкой формы
    };

    var logger;
    var t;

    var errors = [];

    var emailPattern = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;

    function addError($el, msg) {
        var id = $el.attr('id');
        errors.push({
            id: $el.attr('id'),
            msg: msg
        });
    }

    function isValid() {
        logger.log('validate');

        errors = [];

        if (!ui.email.val()) {
            addError(ui.email, t.translate('REQUIRED_FIELD'));
        } else if (!ui.email.val().match(emailPattern)) {
            addError(ui.email, t.translate('INVALID_EMAIL'));
        }

        if (!ui.password.val()) {
            addError(ui.password, t.translate('REQUIRED_FIELD'));
        }

        if (!ui.checkbox.prop('checked')) {
            addError(ui.checkbox);
        }

        if (errors.length) {
            return false;
        }

        return true;
    }

    function clearErrors() {
        // убираем выделение ошибочных полей
        $('.has-error', ui.form).each(function(i, el) {
            $(el).removeClass('has-error');
        });

        // прячем тексты ошибок
        $('.error-block', ui.form).each(function(i, el) {
            if ($(el).hasClass('error-block')) {
                $(el).hide();
            }
        });
    }

    function showErrors() {
        $(errors).each(function(i, error) {
            logger.log('show error', error.id);

            var $group = $('#' + error.id).parents('.form-group');
            $group.addClass('has-error');  // выделение ошибочного поля

            // текст ошибки, если есть
            if (error.msg) {
                $('.error-block', $group).html(error.msg).show();
            }
        });
    }

    function init() {
        // здесь уже точно DOM структура готова
        for (var pr in ui) {
            ui[pr] = $(ui[pr]);
        }

        ui.btnSubmit.on('click', function() {
            clearErrors();  // перед проверкой очищаем все ошибки

            if (isValid()) {
                // если ошибок нет - сабмитим форму
                if (settings.url) {  // урл присутствует в настройках - используем ajax
                    ui.hideElements.hide();  // скрываем отработавшие элементы формы
                    $.ajax({
                        url: settings.url,
                        dataType: 'html',
                        type: 'GET',
                        beforeSend: function(xhr) {
                        },
                        success: function(data) {
                            logger.log('ajax data', data);

                            ui.ajax.html(data);
                        },
                        complete: function() {
                        },
                        error: function() {
                        }
                    });
                } else {  // обычный сабмит
                    ui.form.submit();
                    console.log(ui.form.get(0));
                }
            } else {
                // если есть ошибки - показываем их
                showErrors();
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
}(jQuery, Logger, Translator));
