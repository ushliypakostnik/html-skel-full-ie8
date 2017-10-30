'use strict';


var AdaptiveImage = function($el, options) {
    this.$el = $el;

    this.options = {
        emptyImage: '',
        oriSrc: '',
        oriWidth: 0,
        oriHeight: 0,
        badQ: 25,
        goodQ: 95,
        dirSuffix: '.dir',
        threshold: 100,
        useLowQualityImages: false
    };

    for (var pr in options) {
        this.options[pr] = options[pr];
    }

    var parts = this.options.oriSrc.split('/');
    this.basename = parts[parts.length - 1];

    this.$el.attr('src', this.options.emptyImage);
}


AdaptiveImage.prototype.load = function(width, height) {
    width = width || this.options.oriWidth;
    height = height || this.options.oriHeight;

    var m = width % this.options.threshold;
    var w = m ? width + this.options.threshold - m : width;

    if (w > this.options.oriWidth)  {
        w = this.options.oriWidth - this.options.oriWidth % this.options.threshold;
    }

    if ('' + w != this.$el.attr('data-w')) {
        var h = parseInt(w * height / width, 10);

        if (this.options.useLowQualityImages) {
            this.$el.unbind('load');

            var _this = this;
            this.$el.on('load', function() {
                
                var src = _this.options.oriSrc + _this.options.dirSuffix + '/' +
                                                 _this.options.goodQ + '/' +
                                                 w + '/' +
                                                 _this.basename;

                _this.$el.unbind('load');
                _this.$el.attr('src', src);
            });
        }

        var q = this.options.useLowQualityImages ? this.options.badQ : this.options.goodQ;

        var src = this.options.oriSrc + this.options.dirSuffix + '/' +
                                        q + '/' +
                                        w + '/' +
                                        this.basename;

        this.$el.attr({
            src: src,
            width: width,
            height: height
        });

        this.$el.attr('data-w', w);
    }
};
