import { expect } from 'chai';
import sinon from 'sinon';
import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';
import { TemplatesRoute } from '../app/routes/templates/templates-routes.js'; // Adjust the import path accordingly

describe('TemplatesRoute', function () {
  let serverMock, logsMock, reqMock, resMock, sandbox;

  beforeEach(function () {
    // Setup a Sinon sandbox
    sandbox = sinon.createSandbox();

    // Mock server
    serverMock = {
      get: sinon.stub(),
      post: sinon.stub()
    };

    // Mock logs
    logsMock = {
      info: sinon.stub(),
      error: sinon.stub()
    };

    // Mock request and response objects
    reqMock = {
      params: {},
      body: {}
    };
    resMock = {
      json: sinon.stub()
    };
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('precompileTemplates', function () {
    it('should precompile templates correctly', function () {
      // Mock fs methods
      const fileNames = ['template1.hbs', 'template2.hbs'];
      sandbox.stub(fs, 'readdirSync').returns(fileNames);
      sandbox.stub(fs, 'readFileSync').callsFake((filePath) => {
        if (filePath.includes('template1.hbs')) return '<h1>{{title}}</h1>';
        if (filePath.includes('template2.hbs')) return '<p>{{content}}</p>';
      });

      const templatesRoute = new TemplatesRoute(serverMock);
      templatesRoute.logs = logsMock; // Assign the mocked logs

      // Assertions
      expect(templatesRoute.compiledTemplates['template1'].uncompiled).to.equal('<h1>{{title}}</h1>');
      expect(templatesRoute.compiledTemplates['template2'].uncompiled).to.equal('<p>{{content}}</p>');
      expect(templatesRoute.compiledTemplates['template1'].compiled).to.be.a('function');
      expect(templatesRoute.compiledTemplates['template2'].compiled).to.be.a('function');
    });

    it('should log an error if precompiling templates fails', function () {
      // Simulate an error during readdirSync
      sandbox.stub(fs, 'readdirSync').throws(new Error('Failed to read directory'));

      const templatesRoute = new TemplatesRoute(serverMock);
      templatesRoute.logs = logsMock; // Assign the mocked logs

      // Assertions
      sinon.assert.calledOnce(logsMock.error);
      expect(templatesRoute.compiledTemplates).to.deep.equal({});
    });
  });

  describe('getTemplates', function () {
    let templatesRoute;

    beforeEach(function () {
      templatesRoute = new TemplatesRoute(serverMock);
      templatesRoute.logs = logsMock; // Assign the mocked logs
    });

    it('should return the uncompiled template when an id is provided', async function () {
      templatesRoute.compiledTemplates = {
        'test-template': { uncompiled: '<h1>{{title}}</h1>' }
      };
      reqMock.params.id = 'test-template';

      await templatesRoute.getTemplates(reqMock, resMock);

      sinon.assert.calledWith(resMock.json, '<h1>{{title}}</h1>');
    });

    it('should return a list of template names when no id is provided', async function () {
      templatesRoute.compiledTemplates = {
        'template1': {},
        'template2': {}
      };

      await templatesRoute.getTemplates(reqMock, resMock);

      sinon.assert.calledWith(resMock.json, ['template1', 'template2']);
    });
  });

  describe('renderData', function () {
    let templatesRoute;

    beforeEach(function () {
      templatesRoute = new TemplatesRoute(serverMock);
      templatesRoute.logs = logsMock; // Assign the mocked logs
    });

    it('should return 400 if no id is provided', async function () {
      reqMock.params['id:render'] = '';

      await templatesRoute.renderData(reqMock, resMock);

      sinon.assert.calledWith(resMock.json, 400, { error: 'Bad Request' });
    });

    it('should return 404 if the template is not found', async function () {
      reqMock.params['id:render'] = 'non-existent-template';

      await templatesRoute.renderData(reqMock, resMock);

      sinon.assert.calledWith(resMock.json, 404, { error: 'Template not found' });
    });

    it('should render and return data for a valid template', async function () {
      templatesRoute.compiledTemplates = {
        'test-template': { compiled: Handlebars.compile('<h1>{{title}}</h1>') }
      };

      reqMock.params['id:render'] = 'test-template:render';
      reqMock.body = { title: 'Hello World' };

      await templatesRoute.renderData(reqMock, resMock);

      sinon.assert.calledWith(resMock.json, { renderedTemplates: ['<h1>Hello World</h1>'] });
    });

    it('should render data for an array of input data', async function () {
      templatesRoute.compiledTemplates = {
        'test-template': { compiled: Handlebars.compile('<h1>{{title}}</h1>') }
      };

      reqMock.params['id:render'] = 'test-template:render';
      reqMock.body = [{ title: 'Hello World' }, { title: 'Goodbye World' }];

      await templatesRoute.renderData(reqMock, resMock);

      sinon.assert.calledWith(resMock.json, { renderedTemplates: ['<h1>Hello World</h1>', '<h1>Goodbye World</h1>'] });
    });
  });
});
