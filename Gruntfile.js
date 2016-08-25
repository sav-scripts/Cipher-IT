module.exports = function(grunt)
{
    var pkg = grunt.file.readJSON('package.json');

    var pngquantPlugin = require('imagemin-pngquant');

    grunt.initConfig
    ({
        pkg: pkg,
        jshint: {
            options: pkg.jshintConfig,
            all: [
                'Gruntfile.js',
                'app/scripts/**/*.js',
                'test/**/*.js'
            ]
        },
        useminPrepare: {
            html: 'app/index.html',
            options: {
                dest: 'dist'
            }
        },
        clean: {
            build: [
                'dist/**/*', '!dist/images/**'
            ],
            release: [".tmp/"]
        },
        copy: {
            release: {
                files: [
                    {
                        expand: true,
                        cwd: 'app',
                        src: [
                            //'images/*.{png,gif,jpg,svg}',
                            '*.html',
                            'form_Canvas.js',
                            'js/Loading.js',
                            'js/lib/createjs-2015.11.26.min.js',
                            'js/lib/jquery.waitforimages.min.js',
                            'js/lib/jquery.mousewheel.min.js',
                            'js/lib/TweenMax.min.js',
                            'js/lib/jquery.min.js'
                        ],
                        dest: 'dist'
                    }
                ]
            }
        },
        filerev: {
            options: {
                encoding: 'utf8',
                algorithm: 'md5',
                length: 20
            },
            release: {
                // filerev:release hashes(md5) all assets (images, js and css )
                // in dist directory
                files: [{
                    src: [
                        //'dist/images/*.{png,gif,jpg,svg}',
                        'dist/js/*.js',
                        'dist/styles/*.css'
                    ]
                }]
            }
        },
        usemin: {
            html: ['dist/*.html'],
            css: ['dist/styles/*.css'],
            options: {
                assetsDirs: ['dist', 'dist/styles']
            }
        },
        less: {
            dev: {
                src: 'app/styles/main.less',
                dest: 'app/styles/main.css'
            },
            admin:{
                src: 'api/styles/main.less',
                dest: 'api/styles/main.css'
            },
            release: {
                src: 'app/styles/main.less',
                dest: 'dist/styles/main.css',
                options: {
                    compress: true
                }
            }
        },
        watch: {
            less: {
                files: ['app/styles/*.less'],
                tasks: ['less:dev'],
                options:
                {
                    atBegin:true
                }
            },
            lessAdmin:{
                files: ['api/styles/*.less'],
                tasks: ['less:admin'],
                options:
                {
                    atBegin:true
                }
            }
        },
        imagemin: {
            options:{
                use: [pngquantPlugin()]
            },
            dynamic: {
                files: [{
                    expand: true,
                    cwd: 'app/images/',
                    src: ['**/*.{png,jpg,gif}', '!layouts/**'],
                    dest: 'dist/images/'
                }]
            }
        }
    });

    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);


    grunt.registerTask('images', ['newer:imagemin']);

    //grunt.registerTask('watch2', ['watch:lessAdmin']);

    grunt.registerTask("default",
    [
        'clean:build',
        'jshint',
        'less:release',
        'useminPrepare',
        'concat',
        'uglify',
        'copy',
        'images',
        'filerev',
        'usemin',
        'clean:release'
    ]);
};
