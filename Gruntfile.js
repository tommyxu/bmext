module.exports = function(grunt) {
    'use strict';
    grunt.initConfig({
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

