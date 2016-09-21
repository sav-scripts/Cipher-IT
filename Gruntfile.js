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
            html: 'app/index.php',
            options: {
                dest: 'dist'
            }
        },
        clean: {
            build: [
                'dist/**/*', '!dist/images/**', '!dist/scenedata/textures/**'
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
                            '*.php',
                            'js/animes/**',
                            'js/lib/**',
                            'js/Loading.js',
                            'styles/phase1-only.css',
                            'scenedata/config.json',
                            'misc/**',
                            'shaders/**',
                            'textures/**'
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
            html: ['dist/*.php'],
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
                    compress: false
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
                    cwd: 'app/',
                    src: ['images/**/*.{png,jpg,gif}', '!images/layouts/**', 'scenedata/**/*.{png,jpg,gif}'],
                    dest: 'dist/'
                }]
            }
        },
        responsive_images: {
            myTask: {
                options: {
                    newFilesOnly: false,
                    sizes:[{rename: false, width: "50%"}]
                },
                files: [{
                    expand: true,
                    src: ['**/*.{jpg,gif,png}'],
                    cwd: 'app/scenedata/textures/',
                    dest: 'app/scenedata/textures_m/'
                }]
            }
        }
    });

    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.registerTask('images', ['newer:imagemin']);

    grunt.registerTask('resize', ['newer:responsive_images']);

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
        //'responsive_images',
        'images',
        'filerev',
        'usemin',
        'clean:release'
    ]);
};
