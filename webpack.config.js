var Encore = require('@symfony/webpack-encore');

Encore
    // the project directory where compiled assets will be stored
    .setOutputPath('public/build/')
    // the public path used by the web server to access the previous directory
    .setPublicPath('/build')
    .cleanupOutputBeforeBuild()
    .enableSourceMaps(!Encore.isProduction())
    // uncomment to create hashed filenames (e.g. app.abc123.css)
    //.enableVersioning(Encore.isProduction())

    // uncomment to define the assets of the project
    .addEntry('js/font-awesome', './assets/js/font-awesome/svg-with-js/js/fontawesome.min.js')
    .addEntry('js/app', './assets/js/app.js')
    .addEntry('js/comp.collapse', './assets/js/comp.collapse.js')
    .addEntry('js/comp.carrousel', './assets/js/comp.carrousel.js')
    .addEntry('js/comp.modal', './assets/js/comp.modal.js')
    .addEntry('js/comp.form', './assets/js/comp.form.js')
    .addEntry('js/comp.print', './assets/js/comp.print.js')
    .addEntry('js/comp.searchBar', './assets/js/comp.searchBar.js')
    .addEntry('js/comp.pagination', './assets/js/comp.pagination.js')
    .addStyleEntry('css/app', './assets/scss/app.scss')

    // uncomment if you use Sass/SCSS files
    .enableSassLoader()

    // uncomment for legacy applications that require $/jQuery as a global variable
    .autoProvidejQuery()
;

module.exports = Encore.getWebpackConfig();
