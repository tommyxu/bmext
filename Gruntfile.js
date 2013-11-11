module.exports = function(grunt) {
    'use strict';
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            files: ["*.js"],
            options: {
                ignores: ["jquery.js"] //, "Gruntfile.js"
            }
        },
        "jsbeautifier": {
            files: ["*.js", "!jquery.js"]
        }
    });
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-jsbeautifier');
    grunt.registerTask('default', ['jshint']);
};
