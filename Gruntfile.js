module.exports = function(grunt) {

    var cssPath = "src/css",

    jsPath = "src/js",

    imgPath = "src/img/",

    buildPath = "build/",

    externalPath= "./external/",

    testPath = "test";

    var requireJsModules = ["config"];  
    grunt.file.expand({cwd:jsPath+"/"}, "**/*.js").forEach( function (file) {  
        if(/qunit.*/i.test(file))return;
        if(/require.*/i.test(file))return;
        if(/almond.*/i.test(file))return;
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
            },
            requires:{
                src:["config/require.config.js","build/requires.js"],
                dest:"<%=requirejs.compile.options.mainConfigFile%>"
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
                    spawn: false,
                    livereload: true
                },
                files: ['./src/less/**/*.less'],
                tasks: ['less'],
               
            },
            createTest:{
                options:{
                    livereload:true,
                    // event: ['added'],
                },
                files:['src/js/**/*.js'],
                
            }
        },

        clean: {
            css: {
                src: ['<%=concat.css.dest%>', ]
            },
            js: {
                src: '<%=concat.js.dest%>'
            },
            requirefiles:{
                src:["src/js/almond.js","src/js/config.js"]
            }
        },
        requirejs: {
            compile: {
                options: {
                    baseUrl: "./src/js/",
                    mainConfigFile: "./src/js/config.js",
                    name: "almond",
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
          almondjs:{
            expand: true,
            cwd: 'external/reqiure/',

            src:"almond.js",
            dest:"src/js/"
          }
        },
        qunit: {
            all: ['test/**/*.html']
          },
      "file-creator": {
        "basic": {
          "build/requires.js": function(fs, fd, done) {
            var requireModules="require([";
            grunt.file.expand({cwd:jsPath+"/"}, "**/*.js").forEach( function (file,index) {  
                if(/qunit.*/i.test(file))return;
                if(/require.*/i.test(file))return;
                if(/config.*/i.test(file))return;
                if(/almond.*/i.test(file))return;
                    var item=file.replace(/\.js$/, '').split("/");
                    requireModules+="'"+item[item.length-1]+"'";
            });
            requireModules+="],function () {});";
            fs.writeSync(fd, requireModules.replace("''","','"));
            done();
          }
        }

        
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
    grunt.loadNpmTasks('grunt-file-creator');

    grunt.registerTask('default', ['connect:server', 'watch']);
    grunt.registerTask('imagemin', ['imagemin']); //图片优化 jshint concat js uglify
    grunt.registerTask('css', ['clean:css', 'csslint', 'concat:css', 'cssmin']); //css检查，压缩，合并
    grunt.registerTask('js', ['clean:js', 'jshint', 'concat:js', 'uglify']); //JS检查，压缩，合并
    grunt.registerTask('cimpile_less', ['watch:compileLess']); //Less 的编译
    grunt.registerTask('less', 'less'); //Less 的编译
    grunt.registerTask('require', ['copy','requirejs']); //Less 的编译
    grunt.registerTask('test', ['connect:server','qunit']); //Less 的编译
    grunt.registerTask('amdjs', ["file-creator:basic","concat:requires","copy:almondjs","requirejs","clean:requirefiles"]); //
    grunt.registerTask("tests","test watch write",function  (argument) {
         grunt.event.on('watch', function(action, filepath) {
              if ("added"==action) {
                 var testJsName=filepath.replace(".js","Test.js").replace(/^src\\(.*)/,"test\\$1");
                var shorname=testJsName.substring(testJsName.lastIndexOf("\\")+1);
                var testDir=testJsName.substr(0,testJsName.lastIndexOf("\\")+1);
                grunt.file.write(testJsName,grunt.file.read("config/testTemplate.js"));
                var content=grunt.file.read("config/testTemplate.html").replace("%=filename=%",shorname).replace(/%=root=%/g,testDir.replace(/([^\\]+)\\/g,"..\\"));
                grunt.file.write(testJsName.replace(".js",".html"),content);
              // grunt.log.writeln("name:%s;shortname:%s;dirname:%s;",testJsName,shorname,testDir);
              }
         });
    });
    grunt.registerTask("zzz",["tests","watch:createTest"]);
};