window.SamsungAPI = (function () {

  const USER_AGENTS = [
    'HbbTV/1.1.1 (;Samsung;SmartTV2013;T-FXPDEUC-1102.2;;) WebKit',
    'Mozilla/5.0 (SmartHub; SMART-TV; U; Linux/SmartTV) AppleWebKit/531.2+ (KHTML, like Gecko) WebBrowser/1.0 SmartTV Safari/531.2+',
    'Mozilla/5.0 (SMART-TV; X11; Linux i686) AppleWebKit/535.20+ (KHTML, like Gecko) Version/5.0 Safari/535.20+',
    'Mozilla/5.0 (SmartHub; SMART-TV; U; Linux/SmartTV; Maple2012)',
    'Mozilla/5.0 (SmartHub; SMART-TV; U; Linux/SmartTV; Maple2012) AppleWebKit/534.7 (KHTML, like Gecko) SmartTV Safari/534.7',
    'Mozilla/4.0 (compatible; Gecko/20041115) Maple 5.0.0 Navi'
  ];

  const WIDGETS = [
    'Common/API/Plugin',
    'Common/API/Widget',
    'Common/API/TVKeyValue',
    'Common/webapi/1.0/webapis'
  ];

  const PLUGINS = [
    'SEF',
    'PLAYER',
    'AUDIO',
    'TVMW',
    'SCREEN',
    'NETWORK',
    'NNAVI',
    'TV',
    'APPCOMMON',
    'TIME',
    'FRONTPANEL',
    'DEVICE'
  ];

  const EVENT_NAME = 'SamsungKeyPress';

  var isSSTv = false;
  for (var i = 0; i < USER_AGENTS.length; i++) {
    isSSTv = USER_AGENTS[i] === window.navigator.userAgent;
    if (isSSTv) {
      break;
    }
  }

  var initialized = false;

  var init;
  (init = function () {
    // enable TV audio
    window.onShow = function () {
      if (!isSSTv) {
        return;
      }
      var
        pluginAPI = new window.Common.API.Plugin(),
        tvKeyAPI = new window.Common.API.TVKeyValue();

      var PL_NNAVI_STATE_BANNER_VOL = 1;
      pluginAPI.SetBannerState(PL_NNAVI_STATE_BANNER_VOL);
      pluginAPI['unregistKey'](tvKeyAPI.KEY_VOL_UP);
      pluginAPI['unregistKey'](tvKeyAPI.KEY_VOL_DOWN);
      pluginAPI['unregistKey'](tvKeyAPI.KEY_PANEL_VOL_UP);
      pluginAPI['unregistKey'](tvKeyAPI.KEY_PANEL_VOL_DOWN);
      pluginAPI['unregistKey'](tvKeyAPI.KEY_MUTE);
    }

    return function () {
      if (!!initialized) {
        return;
      }

      initialized = true;

      if (!isSSTv) {
        return;
      }

      var i;
      // for (i = 0; i < WIDGETS.length; i++) {
      //   document.head.appendChild(widgetTemplate(WIDGETS[i]));
      // }

      for (i = 0; i < PLUGINS.length; i++) {
        document.head.appendChild(pluginTemplate(PLUGINS[i]));
      }
    }

    function widgetTemplate(widgetName) {
      var elem = document.createElement('script');
      elem.type = 'text/javascript';
      elem.lang = 'javascript';
      elem.src = '$MANAGER_WIDGET/' + widgetName + '.js';

      return elem;
    }

    function pluginTemplate(pluginName) {
      var id = pluginName.charAt(0) + pluginName.slice(1).toLowerCase();

      var elem = document.createElement('object');
      elem.id = 'plugin' + id;
      elem.border = 0;
      elem.classid = 'clsid:SAMSUNG-INFOLINK-' + pluginName;
      // hide element
      var css = styleElement(elem);
      css('position', 'absolute');
      css('top', 0);
      css('left', 0);
      css('width', 0);
      css('height', 0);
      css('padding', 0);
      css('margin', 0);

      return elem;
    }

    function styleElement(elem) {
      return function(prop, value) {
        elem.style[prop] = value;
      }
    }
  }())();

  return new (function () {

    var 
      macAddress,
      disabledKeys = {},
      preventDefaults = {}

    // mimic remote for keyboard keys 
    this.tvKey = {
      KEY_RETURN: 27, // esc
      KEY_ENTER: 13, // enter
      KEY_INFO: 112, // F1
      KEY_TOOLS: 113, // F2
      KEY_LEFT: 37, // arrow-left
      KEY_UP: 38, // arrow-up
      KEY_RIGHT: 39, // arrow-right
      KEY_DOWN: 40, // arrow-down
      KEY_FF: 76, // L
      KEY_RW: 74, // J
      KEY_0: 96 // numpad_0
    };

    this.eventName = EVENT_NAME;

    (document.body || document).onload = function () {
      if (!isSSTv) {
        return;
      }

      if (!initialized) {
        init();
      }

      // map `window.console.log` to `window.alert` for Samsung SDK TV emulator
      console.log = function () {
        alert(arguments[0]);
      }

      if (!window.Common) {
        return;
      }

      (new window.Common.API.Widget()).sendReadyEvent();

      SamsungAPI.tvKey = new window.Common.API.TVKeyValue();

      var networkPlugin = document.getElementById('pluginNetwork');

      if (networkPlugin && networkPlugin.GetMAC) {
        // 0 wired, 1 wireless
        macAddress = networkPlugin.GetMAC(0) || networkPlugin.GetMAC(1);
      }
    };

    this.isSamsungTv = function () {
      return isSSTv;
    };

    this.getMacAddress = function (formatted) {
      if (!macAddress) {
        return '';
      }

      return !formatted ? macAddress : macAddress.replace(/(..)/g, '$1:').slice(0, -1);
    };

    var storeKeyState = function (keyCode, storage) {
      if (!keyCode || !storage) {
        return;
      }

      storage[keyCode] = !storage[keyCode];
    }

    var storeKeyStates = function (keyCodes, storage) {
      if (!keyCodes || !Array.isArray(keyCodes) || !storage) {
        return;
      }

      for (var i = 0; i < keyCodes.length; i++) {
        storeKeyState(keyCodes[i], storage);
      }
    }

    this.disableKey = function (keyCode) {
      storeKeyState(keyCode, disabledKeys);
    };

    this.disableKeys = function (keyCodes) {
      storeKeyStates(keyCodes, disabledKeys);
    };

    // default disable keyboard navigation, e.g. arrowkeys, home, end, space, backspace, etc...
    storeKeyStates([8, 9, 32, 33, 34, 35, 36, 37, 38, 39, 40], preventDefaults);
    
    (document.body || document).onkeydown = function (e) {
      e = e || window.event;
      if (!e || !e.keyCode) {
        return;
      }

      var keyCode = e.keyCode;

      if (disabledKeys[keyCode]) {
        return preventDefault(event);
      }

      var evt;
      try {
        evt = new CustomEvent(EVENT_NAME, {
          detail: {
            keyCode: keyCode
          }
        });
      } catch (e) {
        // deprecated approach
        evt = document.createEvent('HTMLEvents');
        evt.initEvent(EVENT_NAME, true, true, {
          detail: {
            keyCode: keyCode
          }
        });
      }
      evt.keyCode = keyCode;

      if (evt) {
        window.dispatchEvent(evt);
      }

      var tvKey = SamsungAPI.tvKey;

      if ((keyCode === tvKey.KEY_RETURN || keyCode === tvKey.KEY_INFO) || preventDefaults[keyCode]) {
        return preventDefault(event);
      }
    };

    function preventDefault(e) {
      e = e || window.event;
      if (!e) {
        return false;
      }

      if (e.preventDefault) {
        e.preventDefault();
      }
      if (e.returnValue) {
        e.returnValue = false;
      }

      return false;
    }
  })();
})();