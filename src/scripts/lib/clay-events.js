'use strict';

var $ = require('../vendor/minified/minified').$;
var _ = require('../vendor/minified/minified')._;
/**
 * Attaches event methods to the context.
 * Call with ClayEvents.call(yourObject, $eventTarget)
 * @param {EventEmitter|M} $eventTarget - An object that will be used as the event
 * target. Must implement EventEmitter
 * @constructor
 */
function ClayEvents($eventTarget) {
  var self = this;
  var _eventProxies = [];

  /**
   * prefixes events with "|"
   * @param {string} events
   * @returns {string}
   * @private
   */
  var _transformEventNames = function(events) {
    return events.split(' ').map(function(event) {
      return '|' + event.replace(/^\|/, '');
    }).join(' ');
  };

  var _registerEventProxy = function(handler, proxy) {
    var eventProxy = _.find(_eventProxies, function(item) {
      return item.handler === handler ? item : null;
    });

    if (!eventProxy) {
      eventProxy = { handler: handler, proxy: proxy };
      _eventProxies.push(eventProxy);
    }
    return eventProxy.proxy;
  };

  var _getEventProxy = function(handler) {
    return _.find(_eventProxies, function(item) {
      return item.handler === handler ? item.proxy : null;
    });
  };

  /**
   * Attach an event listener to the item.
   * @param {string} events - a space separated list of events
   * @param {function} handler
   * @returns {ClayEvents}
   */
  self.on = function(events, handler) {
    var _events = _transformEventNames(events);
    var self = this;
    var _proxy = _registerEventProxy(handler, function() {
      handler.apply(self, arguments);
    });
    $eventTarget.on(_events, _proxy);
    return self;
  };

  /**
   * Remove the given event handler.
   * @see {@link http://minifiedjs.com/api/off.html|$.off()}
   * @param {function} handler
   * @returns {ClayEvents}
   */
  self.off = function(handler) {
    var _proxy = _getEventProxy(handler);
    if (_proxy) {
      $.off(_proxy);
    }
    return self;
  };

  /**
   * Trigger an event. This proxies minified.js' trigger.
   * @param {string} name - a single event name to trigger
   * @param {object} [eventObj] - an object to pass to the event handler,
   * provided the handler does not have custom arguments.
   * @see {@link http://minifiedjs.com/api/trigger.html|.trigger()}
   * @returns {ClayEvents}
   */
  self.trigger = function(name, eventObj) {
    $eventTarget.trigger(name, eventObj);
    return self;
  };
}

module.exports = ClayEvents;
