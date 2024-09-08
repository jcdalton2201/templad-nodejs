import path from 'path';
import fs from 'fs';
const all = {
    env: process.env.ENV || 'local',
    applicationContext: '/orion-bff',
    apiApplicationContext: '/api',
    authApplicationContext: '/auth',
    root: path.normalize(path.dirname + '/../../..'),
    port: process.env.PORT || 8080,
    proxy: {
        host: 'none.com',
        port: 8099,
    },
    log_file_path: process.env.RESOLVED_LOG_PATH || 'logs',
    log: {
        type: 'file',
        fileName: 'orion-bff.log',
        accessFileName: 'orion-bff-access.log',
        level: 'info',
    },
    oauth: {
        // base_url: 'https://api-it.cloud.none.com',
        // tokenPath : '/oauth/oauth20/token',
        // authorizationPath: '/oauth/oauth20/authorize'
    },
    secret_names: {},
    api_base_uris: {
        // api_gw: 'https://api-it.cloud.none.com'
    },
    api_uris: {
        // sso_ping: '/ping',
        // sso_callback: '/callback',
        // sso_user: '/user',
        // sso_logout: '/logout',
        // offer_modeling_health_check: '/health-check'
    },
};
const envBlock = fs.readFileSync(
    `./app/config/environment/${all.env}.json`,
    'utf-8',
);
export default Object.assign(all, JSON.parse(envBlock));
