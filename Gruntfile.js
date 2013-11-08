module.exports = function(grunt) {
    'use strict';
    grunt.initConfig({
        pkg : grunt.file.readJSON('package.json'),
        jshint: {
            files: [ "*.js" ],
            options : {
                ignores: [ "jquery.js", "Gruntfile.js" ]
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.registerTask('default', ['jshint']);
};

