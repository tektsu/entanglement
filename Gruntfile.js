module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        concat: {
            separator: ';\n',
            dist: {
                src: ['src/Entanglement.js', 'src/Draw.js', 'src/Base.js', 'src/Aah.js', `src/BoxSpirals.js`, 'src/Ambler.js', 'src/Emingle.js', 'src/Zentangle.js'],
                dest: 'dist/entanglement.js',
            },
        },
        exec: {
            minify: 'minify dist/entanglement.js >dist/entanglement.min.js',
        },
        jsdoc: {
            src: ['src/*.js', 'README.md'],
            options: {
                destination: 'docs',
                configure: "./jsdoc.conf"
            },
        },
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-jsdoc');

    // Default task(s).
    grunt.registerTask('default', ['concat', 'jsdoc', 'exec']);
    grunt.registerTask('docs', ['jsdoc']);

};
