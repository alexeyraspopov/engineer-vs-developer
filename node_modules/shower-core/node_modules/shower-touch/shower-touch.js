/**
 * @fileOverview
 * Touch events plugin for shower.
 */
shower.modules.define('shower-touch', [
    'util.extend'
], function (provide, extend) {

    var INTERACTIVE_ELEMENTS = [
        'VIDEO', 'AUDIO',
        'A', 'BUTTON', 'INPUT'
    ];

    /**
     * @class
     * Touch events plugin for shower.
     * @name plugin.Touch
     * @param {Shower} shower
     * @param {Object} [options] Plugin options.
     * @constructor
     */
    function Touch (shower, options) {
        options = options || {};
        this._shower = shower;

        this._setupListeners();
    }

    extend(Touch.prototype, /** @lends plugin.Touch.prototype */{

        destroy: function () {
            this._clearListeners();
            this._shower = null;
        },

        _setupListeners: function () {
            var shower = this._shower;

            this._showerListeners = shower.events.group()
                .on('destroy', this.destroy, this);

            this._bindedTouchStart = this._onTouchStart.bind(this);
            this._bindedTouchMove = this._onTouchMove.bind(this);

            document.addEventListener('touchstart', this._bindedTouchStart, false);
            document.addEventListener('touchmove', this._bindedTouchMove, false);
        },

        _clearListeners: function () {
            this._showerListeners.offAll();
            document.removeEventListener('touchstart', this._bindedTouchStart, false);
            document.removeEventListener('touchmove', this._bindedTouchMove, false);
        },

        _onTouchStart: function (e) {
            var shower = this._shower;
            var isSlideMode = shower.container.isSlideMode();
            var element = e.target;
            var slide = this._getSlideByElement(element);
            var x;

            if (slide) {
                if (isSlideMode && !this._isInteractiveElement(element)) {
                    x = e.touches[0].pageX;
                    if (x > window.innerWidth / 2) {
                        shower.player.next();
                    } else {
                        shower.player.prev();
                    }
                }

                if (!isSlideMode) {
                    // Go && turn on slide mode.
                    slide.activate();
                }
            }
        },

        _onTouchMove: function (e) {
            if (this._shower.container.isSlideMode()) {
                e.preventDefault();
            }
        },

        _getSlideByElement: function (element) {
            var slides = this._shower.getSlidesArray();
            var result = null;

            for (var i = 0, k = slides.length; i < k; i++) {
                if (element.id === slides[i].getId()) {
                    result = this._shower.get(i);
                    break;
                }
            }

            return result;
        },

        _isInteractiveElement: function (element) {
            return INTERACTIVE_ELEMENTS.some(function (elName) {
                return elName == element.tagName;
            });
        }
    });

    provide(Touch);
});

shower.modules.require(['shower'], function (sh) {
    sh.plugins.add('shower-touch');
});
