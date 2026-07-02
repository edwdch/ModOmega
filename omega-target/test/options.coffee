chai = require 'chai'
should = chai.should()

describe 'Options', ->
  Options = require '../src/options'
  defaultOptions = require '../src/default_options'

  describe 'default options', ->
    it 'should include local UI language preference', ->
      defaultOptions()['-uiLanguage'].should.equal('')

  describe '#upgrade', ->
    it 'should add local UI language preference to existing options', ->
      options = {schemaVersion: 2}
      target = new Options()
      target.upgrade(options).then ([upgraded, changes]) ->
        upgraded['-uiLanguage'].should.equal('')
        changes['-uiLanguage'].should.equal('')

  describe '.transformValueForSync', ->
    it 'should not sync local UI language preference', ->
      should.not.exist Options.transformValueForSync('zh_CN', '-uiLanguage')
