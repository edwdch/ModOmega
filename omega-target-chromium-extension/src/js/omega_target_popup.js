function callBackgroundNoReply(method, args, cb) {
  chrome.runtime.sendMessage({
    method: method,
    args: args,
    noReply: true,
    refreshActivePage: true,
  });
  if (cb) return cb();
}

function callBackground(method, args, cb) {
  chrome.runtime.sendMessage({
    method: method,
    args: args,
  }, function(response) {
    if (chrome.runtime.lastError != null)
      return cb && cb(chrome.runtime.lastError)
    if (response.error) return cb && cb(response.error)
    return cb && cb(null, response.result)
  });
}

var requestInfoCallback = null;
var defaultGetMessage = chrome.i18n.getMessage.bind(chrome.i18n);
var uiLanguage = '';
var uiMessages = null;
var uiMessageCache = {};

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function substituteMessage(entry, substitutions) {
  if (!entry || entry.message == null) return '';
  var message = entry.message;
  var values = Array.isArray(substitutions) ? substitutions :
    (substitutions == null ? [] : [substitutions]);
  var placeholders = entry.placeholders || {};
  Object.keys(placeholders).forEach(function(name) {
    var content = placeholders[name].content || '';
    var match = content.match(/^\$(\d+)$/);
    if (!match) return;
    var index = parseInt(match[1], 10) - 1;
    if (index < 0) return;
    var value = values[index] == null ? '' : String(values[index]);
    var pattern = new RegExp('\\$' + escapeRegExp(name) + '\\$', 'gi');
    message = message.replace(pattern, value);
  });
  values.forEach(function(value, index) {
    var pattern = new RegExp('\\$' + (index + 1), 'g');
    message = message.replace(pattern, value == null ? '' : String(value));
  });
  return message.replace(/\$\$/g, '$');
}

function setUiLanguage(language, cb) {
  uiLanguage = typeof language === 'string' ? language : '';
  if (!uiLanguage) {
    uiMessages = null;
    return cb && cb(null);
  }
  if (uiMessageCache[uiLanguage]) {
    uiMessages = uiMessageCache[uiLanguage];
    return cb && cb(null, uiMessages);
  }
  var loadingLanguage = uiLanguage;
  fetch(chrome.runtime.getURL('_locales/' + loadingLanguage + '/messages.json'))
    .then(function(response) {
      if (!response.ok) throw new Error('HTTP ' + response.status);
      return response.json();
    })
    .then(function(messages) {
      uiMessageCache[loadingLanguage] = messages;
      if (uiLanguage === loadingLanguage) uiMessages = messages;
      if (cb) cb(null, messages);
    })
    .catch(function(error) {
      console.warn('Failed to load UI language messages.', loadingLanguage, error);
      if (uiLanguage === loadingLanguage) uiMessages = null;
      if (cb) cb(null);
    });
}

function getMessage(key, substitutions) {
  var message = substituteMessage(uiMessages && uiMessages[key], substitutions);
  return message || defaultGetMessage(key, substitutions);
}

OmegaTargetPopup = {
  getState: function (keys, cb) {
    callBackground('getState', [keys], cb);
    return;
  },
  loadUiLanguage: function(cb) {
    callBackground('getAll', [], function(err, options) {
      if (err) {
        console.warn('Failed to read UI language preference.', err);
        return cb && cb();
      }
      setUiLanguage(options && options['-uiLanguage'], cb);
    });
  },
  setState: function (name, value, cb){
    var newItem = {};
    newItem[name] = value
    callBackground('setState', [newItem], cb);
    return;
  },
  applyProfile: function (name, cb) {
    callBackgroundNoReply('applyProfile', [name], cb);
  },
  openOptions: function (hash, cb) {
    var options_url = chrome.runtime.getURL('options.html');
    console.log('open options.....')

    chrome.tabs.query({
      url: options_url
    }, function(tabs) {
      if (!chrome.runtime.lastError && tabs && tabs.length > 0) {
        var props = {
          active: true
        };
        if (hash) {
          var url = options_url + hash;
          props.url = url;
        }
        chrome.tabs.update(tabs[0].id, props);
      } else {
        chrome.tabs.create({
          url: options_url
        });
      }
      if (cb) return cb();
    });
  },
  getActivePageInfo: function(cb) {
    chrome.tabs.query({active: true, lastFocusedWindow: true}, function (tabs) {
      if (tabs.length === 0 || !(tabs[0].pendingUrl || tabs[0].url)) return cb();
      var args = {tabId: tabs[0].id, url: tabs[0].pendingUrl || tabs[0].url};
      callBackground('getPageInfo', [args], cb)
    });
  },
  setDefaultProfile: function(profileName, defaultProfileName, cb) {
    callBackgroundNoReply('setDefaultProfile',
      [profileName, defaultProfileName], cb);
  },
  addCondition: function(condition, profileName, cb){
    callBackground('addCondition', [condition, profileName], cb)
  },
  getTempRules: function(cb){
    callBackground('getTempRules', [], cb);
  },
  addTempRule: function(domain, profileName, toggle, cb) {
    if (typeof toggle == 'function') {
      cb = toggle;
      toggle = null;
    }
    callBackgroundNoReply('addTempRule', [domain, profileName, toggle], cb);
  },
  openManage: function(domain, profileName, cb) {
    chrome.tabs.create({
      url: 'chrome://extensions/?id=' + chrome.runtime.id,
    }, cb);
  },
  getMessage: getMessage,
};
