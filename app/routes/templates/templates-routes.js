import { BaseRoute } from '../baseRoute.js';
import Handlebars from 'handlebars';
const templatesPath = '/templates';
import fs from 'fs';
import path from 'path';

export class TemplatesRoute extends BaseRoute {
    constructor(server) {
        super(server);
        this.compiledTemplates = {};
        this.bindMethods(['renderData','getTemplates']);
        this.createRoutes();
        this.compiledTemplates = this.precompileTemplates();
        
    }
    precompileTemplates() {
        const compiledTemplates = {};
        try {
            fs.readdirSync(templatesPath).forEach(file => {
                const filePath = path.join(templatesPath, file);
                const templateName = path.basename(file, '.hbs');
                const templateContent = fs.readFileSync(filePath, 'utf-8');
                compiledTemplates[templateName] = {compiled: Handlebars.compile(templateContent), uncompiled: templateContent};
            });
        } catch (error) {
            this.logs.error(error);
        }

        return compiledTemplates;
    }
    createGets() {
        this.server.get(`${this.baseRoute}/templates`, this.getTemplates);
        this.server.get(`${this.baseRoute}/templates/:id`, this.getTemplates);
    }
    createPost() {
        this.server.post(`${this.baseRoute}/templates/:id:render`, this.renderData);
    }
    createPuts() { }
    createDel() { }
    async renderData(req, res) {
        this.logs.info('render data');
        const id = req.params['id:render'];
        if(!id){
            res.json(400, {error: 'Bad Request'})
        }
        const template = this.compiledTemplates[id.split(':')[0]];
        if (!template) {
            res.json(404,{ error: 'Template not found' });
        }
        let renderedArray;
        if (Array.isArray(req.body)) {
            // If the data is an array, map through each item and render the template
            renderedArray = req.body.map(item => template.compiled(item));
        } else {
            // If it's not an array, render it directly
            renderedArray = [template.compiled(req.body)];
        }

        // Send the rendered templates as a response
        res.json({ renderedTemplates: renderedArray });
    }
    async getTemplates(req, res) {
        this.logs.info('Get the Templates')
        if(req.params.id){
            console.log(this.compiledTemplates[req.params.id].toString());
            res.json(this.compiledTemplates[req.params.id].uncompiled);
        } else {
            res.json(Object.keys(this.compiledTemplates));
        }
    }
}