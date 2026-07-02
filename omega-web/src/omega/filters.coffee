angular.module('omega').filter 'profiles', (builtinProfiles, profileOrder,
  isProfileNameHidden, isProfileNameReserved) ->

  charCodePlus = '+'.charCodeAt(0)
  builtinProfileList = (profile for _, profile of builtinProfiles)
  (options, filter) ->
    result = []
    for name, value of options when name.charCodeAt(0) == charCodePlus
      result.push value
    if (typeof filter == 'object' or (
      typeof filter == 'string' and filter.charCodeAt(0) == charCodePlus))
      if typeof filter == 'string'
        filter = filter.substr(1)
      result = OmegaPac.Profiles.validResultProfilesFor(filter, options)
    if filter == 'all'
      result = result.filter (profile) -> !isProfileNameHidden(profile.name)
      result = result.concat builtinProfileList
    else
      result = result.filter (profile) -> !isProfileNameReserved(profile.name)
    if filter == 'sorted'
      result.sort profileOrder
    result

angular.module('omega').factory 'omegaI18n', (omegaTarget) ->
  languages = [
    {code: 'en', name: 'English'}
    {code: 'zh', name: '中文'}
  ]
  languages: languages
  getMessage: omegaTarget.getMessage
  setLanguage: omegaTarget.setUiLanguage

angular.module('omega').filter 'tr', (omegaI18n) ->
  filter = (args...) -> omegaI18n.getMessage(args...)
  filter.$stateful = true
  filter
angular.module('omega').filter 'dispName', (omegaI18n) ->
  (name) ->
    if typeof name == 'object'
      name = name.name
    omegaI18n.getMessage('profile_' + name) || name
