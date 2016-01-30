/**
 * @fileOverview
 * Next plugin for Shower
 */
shower.modules.define('shower-next', [
    'shower',
    'Emitter',
    'util.extend'
], function (provide, globalShower, EventEmitter, extend) {

    var TIMER_PLUGIN_NAME = 'shower-timer';
    var DEFAULT_SELECTOR = '.next';

    /**
     * @class
     * @name plugin.Next
     * @param {Shower} shower
     * @param {Object} [options] Plugin options.
     * @param {String} [options.selector = '.next']
     * @constructor
     */
    function Next(shower, options) {
        options = options || {};

        this.events = new EventEmitter({context: this});

        this._shower = shower;
        this._elementsSelector = options.selector || DEFAULT_SELECTOR;
        this._elements = [];

        this._innerComplete = 0;

        this._setupListeners();
        if (this._shower.player.getCurrentSlideIndex() != -1) {
            this._onSlideActivate();
        }
    }

    extend(Next.prototype, /** @lends plugin.Next.prototype */{

        destroy: function () {
            this._clearListeners();

            this._elements = null;
            this._elementsSelector = null;
            this._innerComplete = null;
            this._shower = null;
        },

        /**
         * Activate next inner item.
         * @return {plugin.Next}
         */
        next: function () {
            if (!this._elements.length) {
                throw new Error('Inner nav elements not found.');
            }

            this._innerComplete++;
            this._go();

            this.events.emit('next');

            return this;
        },

        prev: function () {
            if (!this._elements.length) {
                throw new Error('Inner nav elements not found.');
            }

            this._innerComplete--;
            this._go();

            this.events.emit('prev');

            return this;
        },

        /**
         * @returns {Number} Inner elements count.
         */
        getLength: function () {
            this._elements = this._getElements();
            return this._elements.length;
        },

        /**
         * @returns {Number} Completed inner elements count.
         */
        getComplete: function () {
            return this._innerComplete;
        },

        _setupListeners: function () {
            var shower = this._shower;

            this._showerListeners = shower.events.group()
                .on('destroy', this.destroy, this);

            this._playerListeners = shower.player.events.group()
                .on('activate', this._onSlideActivate, this)
                .on('next', this._onNext, this)
                .on('prev', this._onPrev, this);

            var timerPlugin = globalShower.plugins.get(TIMER_PLUGIN_NAME, shower);
            if (timerPlugin) {
                this._setupTimerPluginListener(timerPlugin);
            } else {
                this._pluginsListeners = globalShower.plugins.events.group()
                    .on('add', function (e) {
                        if (e.get('name') === TIMER_PLUGIN_NAME) {
                            this._setupTimerPluginListener();
                            this._pluginsListeners.offAll();
                        }
                    }, this);
            }
        },

        _setupTimerPluginListener: function (plugin) {
            if (!plugin) {
                var timerPlugin = globalShower.plugins.get(TIMER_PLUGIN_NAME, this._shower);
            }
            plugin.events
                .on('next', this._onNext, this, 100);
        },

        _clearListeners: function () {
            this._showerListeners.offAll();
            this._playerListeners.offAll();

            if (this._pluginsListeners) {
                this._pluginsListeners.offAll();
            }
        },

        _getElements: function () {
            var slideLayout = this._shower.player.getCurrentSlide().layout;
            var slideElement = slideLayout.getElement();

            return Array.prototype.slice.call(
                slideElement.querySelectorAll(this._elementsSelector)
            );
        },

        _onNext: function (e) {
            var elementsLength = this._elements.length;
            var isSlideMode = this._shower.container.isSlideMode();

            if (isSlideMode && elementsLength && this._innerComplete < elementsLength) {
                e.preventDefault();
                this.next();
            }
        },

        _onPrev: function (e) {
            var elementsLength = this._elements.length;
            var isSlideMode = this._shower.container.isSlideMode();
            var completed = this._innerComplete;

            if (elementsLength && completed < elementsLength && completed > 0) {
                e.preventDefault();
                this.prev();
            }
        },

        _go: function () {
            for (var i = 0, k = this._elements.length; i < k; i++) {
                var element = this._elements[i];

                if (i < this._innerComplete) {
                    element.classList.add('active');
                } else {
                    element.classList.remove('active');
                }
            }
        },

        _onSlideActivate: function () {
            this._elements = this._getElements();
            this._innerComplete = this._getInnerComplete();
        },

        _getInnerComplete: function () {
            return this._elements.filter(function (element) {
                return element.classList.contains('active');
            }).length;
        }
    });

    provide(Next);
});

shower.modules.require(['shower'], function (sh) {
    sh.plugins.add('shower-next');
});
