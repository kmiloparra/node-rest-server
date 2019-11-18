// puerto
process.env.PORT = process.env.PORT || 3000;


process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';

} else {
    urlDB = process.env.MOGO_URI;
}

process.env.URLDB = urlDB;



process.env.CADUCIDAD_TOKEN = 60 * 60 * 60 * 24 * 30;

process.env.SEED = process.env.SEED || 'este-es-el-seed-desarrollo';

process.env.CLIENT_ID = process.env.CLIENT_ID || '572205854318-venv1osnaiud3e5ffkjerh310omj88mr.apps.googleusercontent.com';