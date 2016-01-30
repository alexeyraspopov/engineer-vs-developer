/**
 * @fileOverview
 * Progress plugin for shower.
 */
shower.modules.define('shower-progress', [
    'util.extend'
], function (provide, extend) {

    /**
     * @class
     * Progress plugin for shower.
     * @name plugin.Progress
     * @param {Shower} shower
     * @param {Object} [options] Plugin options.
     * @param {String} [options.selector = '.progress']
     * @constructor
     */
    function Progress (shower, options) {
        options = options || {};
        this._shower = shower;
        this._playerListeners = null;

        this._element = null;
        this._elementSelector = options.selector || '.progress';

        var showerContainerElement = this._shower.container.getElement();
        this._element = showerContainerElement.querySelector(this._elementSelector);

        if (this._element) {
            this._setupListeners();

            this._element.setAttribute('role', 'progressbar');
            this._element.setAttribute('aria-valuemin', '0');
            this._element.setAttribute('aria-valuemax', '100');

            this.updateProgress();
        }
    }

    extend(Progress.prototype, /** @lends plugin.Progress.prototype */{

        destroy: function () {
            this._clearListeners();
            this._shower = null;
        },

        updateProgress: function () {
            var slidesCount = this._shower.getSlidesCount(),
                currentSlideNumber = this._shower.player.getCurrentSlideIndex(),
                currentProgressValue = (100 / (slidesCount - 1)) * currentSlideNumber;

            if (this._element) {
                this._element.style.width = currentProgressValue.toFixed(2) + '%';
                this._element.setAttribute('aria-valuenow', currentProgressValue.toFixed());
                this._element.setAttribute('aria-valuetext', 'Slideshow Progress: ' + currentProgressValue.toFixed() + '%');
            }
        },

        _setupListeners: function () {
            var shower = this._shower;

            this._showerListeners = shower.events.group()
                .on('destroy', this.destroy, this);

            this._playerListeners = shower.player.events.group()
                .on('activate', this._onSlideChange, this);
        },

        _clearListeners: function () {
            if (this._showerListeners) {
                this._showerListeners.offAll();
            }
            if (this._playerListeners) {
                this._playerListeners.offAll();
            }
        },

        _onSlideChange: function () {
            this.updateProgress();
        }
    });

    provide(Progress);
});

shower.modules.require(['shower'], function (sh) {
    sh.plugins.add('shower-progress');
});
