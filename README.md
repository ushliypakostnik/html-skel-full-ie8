Devprod static project skel
===========================

Devprod static project skel является основой для создания новых статичных
html-проектов.


Deploy
------

Установка системных пакетов

    $ sudo apt-get install nodejs
    $ sudo apt-get install curl

Установка зависимостей (npm packages, bower packages)

    $ npm install

Экспорт проекта в папку *./output*

    $ npm run makestatic

Запуск watch (например для компиляции sass)

    $ npm run watch

Обновление версии приложения с автоматическим коммитом и созданием тега

    $ ./node_modules/.bin/mversion <version> -m "Update to %s"


Структура проекта
-----------------

* __node_modules__ - папка, куда устанавливаются пакеты nodejs
* __output__ - папка, куда происходит выгрузка проекта
* __web__ - папка, где ведётся разработка
    * __bower_components__ - папка, куда устанавливаются пакеты bower
    * __css__ - папка со стилями, которые не требуют препроцессинга less
        * __ie8.css__ - стили для IE8
        * __sys.css__ - стили для системных страниц (напр. для *web/legacy.html*)
    * __fonts__ - папка с кастомными шрифтами
        * __custom-font__ - пример кастомного шрифта
            *   ...
    * __gallery__ - папка для изображений галереи
        * __works__ - альбом галереи
            * ...
        * __point.png__ - прозрачный пиксель
    * __img__ - папка с изображениями проекта
        * ...
    * __js__ - папка со скриптами
        * __app__ - папка с кастомными скриптами
            * __page1.js__ - пример js-модуля
            * __page2.js__ - пример js-модуля
        * __adaptiveimage.js__ - модуль адаптивных изображений
        * __app.js__ - шаблон модуля
        * __bootstrap-helper.js__ - модуль для определения типов устройств
        * __logger.js__ - логгирование
        * __sandbox.js__ - модуль-песочница
        * __share.js__ - модуль социальных кнопок
        * __slideshow.js__ - модуль слайдшоу
        * __translator.js__ - модуль переводов
    * __less__ - стили, требующие препроцесснг less
        * __bootstrap-slider__ - стили для bootstrap-slider
            * __variables.less__ - настройки стилей bootstrap-slider
        * __font-awesome__ - стили для font-awesome
            * __variables.less__ - настройки стилей font-awesome
        * __layout.less__ - стили страниц проекта
        * __mixins.less__ - less mixins
        * __styles.less__ - имопрт стилевых зависимостей
        * __variables.less__ - настройки стилей
    * __app.html__ - шаблон страницы
    * __legacy.html__ - системная страница
    * __page1.html__ - пример страницы
    * __page2.html__ - пример страницы
    * __page3.html__ - пример страницы
    * __sandbox.html__ - страница-песочница
* __.bowerrc__ - файл локальной конфигурации bower
* __bower.json__ - конфигурация bower-пакета
* __Gruntfile.js__ - конфигурация сборщика проекта Grunt
* __package.json__ - конфигурация npm-пакета
* __README.md__ - файл документации по проекту


Работа с проектом
-----------------

### Общие замечания

Файлы *web/app.html* и *web/js/app.js* являются шаблонами - их модификация не требуется ни при каких условиях.

Файлы *web/sandbox.html* и *web/js/sandbox.js* представляют из себя "песочницу". В эти файлы вносятся наработки, идеи и т.д., которые полезно иметь под рукой.

Файлы *web/page**.html* и *web/js/app/page**.js* являются примерами. По идее они не должны содержаться в Skel, но так как логика создания новых страниц в дочерних проектах не очевидна, решено их оставить.

### Концепции использования:

* Cтраница может использовать несколько js-модулей одновременно. Пример - страницы *web/page3.html* (используются js-модули __Page1__ и __Page2__) и *web/sandbox.html* (используются js-модули __Sandbox__ и __Slideshow__).

* Несколько страниц могут использовать один и тот же модуль. Примера нет, но можно предположить, что js-модуль __Slideshow__ может потребоваться сразу на нескольких страницах проекта.

При экспорте проекта не экспортируются страница шаблона *web/app.html* и страница песочницы *web/sandbox.html*. Эти страницы не нужны в выгрузке.


Nginx config example
--------------------

    server {
        listen *:80;
        server_name project.lo;

        root /path/to/project;

        index index.html;
        autoindex on;

        access_log /var/log/nginx/project.access.log;
        error_log /var/log/nginx/project.error.log;

        set_real_ip_from 127.0.0.1;
        real_ip_header X-Forwarded-For;

        location = /favicon.ico {
            log_not_found off;
            access_log off;
        }

        location ~* ^.+\.(html|css|less|js|txt|xml|ttf|svg|eot|woff|zip|tgz|gz|rar|bz2|doc|xls|exe|pdf|ppt|tar|wav|mp3|ogg|rtf)$ {
            access_log off;
            expires 1y;
        }

        location ~* ^.+\.(jpg|jpeg|gif|png|ico|bmp|swf|flv)$ {
            access_log off;
            expires 1y;
            add_header Cache-Control public;
        }
    }
