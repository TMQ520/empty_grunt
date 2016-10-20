module.exports = function(grunt) {

    var cssPath = "src/css",

    jsPath = "src/js",

    imgPath = "src/img/",

    buildPath = "build/",

    externalPath= "./external/",

    testPath = "test";

    var requireJsModules = [];  
    grunt.file.expand({cwd:jsPath+"/"}, "**/*.js").forEach( function (file) {  
        if(/qunit.*/i.test(file))return;
        if(/require.*/i.test(file))return;
            requireJsModules.push(file.replace(/\.js$/, ''));
    });

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        connect: { //连接插件
            options: {
                port: 9000,
                //端口号
                hostname: '*',
                //主机名
                //默认就是这个值，可配置为本机某个 IP，localhost 或域名
                livereload: 35729 //声明给 watch 监听的端口
            },

            server: {
                options: {
                    open: true,
                    //自动打开网页 http://
                    /* base: ['*' //主目录
                   ]*/
                }
            }
        },
        less: {
            development: {
                files: [{
                    expand: true,
                    cwd: './src/less/',
                    src: ['**/*.less'],
                    dest: './src/css',
                    ext: '.css'
                }]
            }
        },
        imagemin: {
            /* 压缩优化图片大小 */
            dist: {
                options: { //优化级别
                    optimizationLevel: 3
                },
                files: [{
                    expand: true,
                    cwd: imgPath,
                    src: ['**/*.{png,jpg,jpeg}'],
                    // 优化 img 目录下所有 png/jpg/jpeg 图片
                    dest: imgPath // 优化后的图片保存位置，默认覆盖
                }]
            }
        },
        csslint: {
            /* 检查 CSS 语法 */
            src: [cssPath + '/**/*.css']
        },
        jshint: { //语法检查 
            all: ['Gruntfile.js', jsPath + '/**/*.js', testPath + '/**/*.js'],
        },
        concat: {
            /* 合并 CSS 文件 */
            css: {
                src: [cssPath + '/**/*.css'],
                /* 根据目录下文件情况配置 */
                dest: cssPath + '/<%=pkg.name%>.css'
            },
            js: {
                src: jsPath + '/**/*.js',
                /* 根据目录下文件情况配置 如果可以使用 require.js/LABjs 等配置更佳 */
                dest: jsPath + '/<%=pkg.name%>.js'
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: '<%= concat.js.dest %>',
                dest: buildPath + 'js/<%= pkg.name %><%= pkg.version %>.min.js'
            }
        },
        cssmin: {
            /*压缩 CSS 文件为 .min.css */
            options: {
                keepSpecialComments: 0,
                /* 移除 CSS 文件中的所有注释 */
            },
            minify: {
                expand: true,
                cwd: cssPath + '/',
                src: '<%= pkg.name%>.css',
                dest: buildPath + 'css/',
                ext: '<%= pkg.version %>.min.css'
            }
        },
        watch: { //监控文件变化
            livereload: {
                options: {
                    livereload: '<%=connect.options.livereload%>' //监听前面声明的端口  35729
                },

                files: [ //下面文件的改变就会实时刷新网页
                'src/*.html', 'src/style/{,*/}*.css', 'src/{,*/}*.js', 'src/images/{,*/}*.{png,jpg}', 'test/**/*.js'],
                scripts: {
                    files: [jsPath + '/**/*.js'],
                    tasks: ['jshint'],

                },
            },
            compileLess: {
                options: {
                    livereload: true
                },
                files: ['./src/less/**/*.less'],
                tasks: ['less'],
                options: {
                    spawn: false,
                }
            }
        },

        clean: {
            css: {
                src: ['<%=concat.css.dest%>', ]
            },
            js: {
                src: '<%=concat.js.dest%>'
            }
        },
        requirejs: {
            compile: {
                options: {
                    baseUrl: "./src/js/",
                    mainConfigFile: "./src/js/config.js",
                    name: "reqiure/almond",
                    include: requireJsModules,
                    out: "<%= uglify.build.dest %>",
                    wrap:true
                }
            }
        },
        copy: {
          main: {
            expand: true,
            cwd: 'external/',
            src: '**',
            dest: 'src/js/',
            filter: 'isFile',
          },
        },
        qunit: {
            all: ['test/**/*.html']
          }

    });
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-qunit');

    grunt.loadNpmTasks('grunt-contrib-csslint');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-less');

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-requirejs');

    grunt.loadNpmTasks('grunt-contrib-imagemin');

    grunt.registerTask('default', ['connect:server', 'watch']);
    grunt.registerTask('imagemin', ['imagemin']); //图片优化 jshint concat js uglify
    grunt.registerTask('css', ['clean:css', 'csslint', 'concat:css', 'cssmin']); //css检查，压缩，合并
    grunt.registerTask('js', ['clean:js', 'jshint', 'concat:js', 'uglify']); //JS检查，压缩，合并
    grunt.registerTask('cimpile_less', ['watch:compileLess']); //Less 的编译
    grunt.registerTask('less', 'less'); //Less 的编译
    grunt.registerTask('require', ['copy','requirejs']); //Less 的编译
    grunt.registerTask('test', ['connect:server','qunit']); //Less 的编译
};