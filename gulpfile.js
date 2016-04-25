var gulp = require('gulp'),
    less = require('gulp-less'),
    sass = require('gulp-sass'),

    cleancss = require('gulp-clean-css'),
    autoprefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    sourcemaps = require('gulp-sourcemaps'),

    htmlmin2 = require('gulp-htmlmin-jinjia2'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),

    amdOptimize = require('gulp-amd-optimizer'),

    rev = require('gulp-rev'),
    revcollector = require('gulp-rev-collector'),
    replace = require('gulp-replace'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    fileinclude = require('gulp-file-include'),
    argv = require('yargs').argv,
    clean = require('gulp-clean'),
    sequence = require('gulp-sequence'),
    watch = require('gulp-watch'),
    livereload = require('gulp-livereload');

/**
 * 编译的KEY
 */
var task_key = 'pack';
var cancat_name = 'all-' + Math.random().toString(36).substr(2) + '.js';


/**
 * 编译模式：-p: 生产; -d: 开发
 * publish mode or develop mode
 */
var pub_vm = argv.p;

/**
 * 模块 
 */
var md_vm = pub_vm || 'all';

/**
 * 任务列表
 */
var task_list = [];

/**
 * 模块配置
 */
//var mods = require('./gulpfile.config').mods;
var mods = require('./gulpfile.config').mods;

/**
 * 编译函数
 */
var builds = {
    less: function (opts) {
        if (opts.pack) {

            var gulpless = gulp.src(opts.src)       //压缩的文件

            gulpless.pipe(watch(opts.src))
                .pipe(less())                       //编译LESS文件
                .pipe(gulp.dest(opts.dest))         //输出到对应目录
                .pipe(livereload());

            return gulpless;
        }
    },
    scss: function (opts) {
        var gulpscss = gulp.src(opts.src)               //压缩的文件

        gulpscss
            .pipe(watch(opts.src))
            .pipe(sass())                       //编译SCSS文件
            .pipe(autoprefixer({ browsers: ['last 2 version', 'safari 5', 'ios 6', 'android 4'] }))
            .pipe(gulp.dest(opts.dest))         //输出到对应目录
            .pipe(livereload());
        
        livereload.listen();
        
        return gulpscss;
    },
    css: function (opts) {
        if (pub_vm) {
            opts.dest = opts.pub;
        }

        var gulpcss = gulp.src(opts.src);               //压缩的文件

        if (pub_vm) {                                   //生产环境
            gulpcss
                .pipe(rev())
                .pipe(cleancss())
                .pipe(gulp.dest(opts.dest))
                .pipe(rev.manifest({
                    base: opts.manifest,
                    merge: true                         //与现有的清单合并(如果有的话)
                }))
                .pipe(gulp.dest(opts.dest));            //输出到对应目录
        } else {
            gulpcss
                .pipe(gulp.dest(opts.dest))
                .pipe(rename({ suffix: '.min' }))       //rename压缩后的文件名
                .pipe(sourcemaps.init())                //sourcemap 初始化
                .pipe(cleancss())                       //执行压缩
                .pipe(sourcemaps.write('.'))            //以.map文件后缀名的形式输出，可不填，不填就输出到处理的文件里面
                .pipe(gulp.dest(opts.dest));            //输出到对应目录
        }
        return gulpcss;
    },
    js: function (opts) {
        if (pub_vm) {
            opts.dest = opts.pub;
        }
        var gulpjs = gulp.src(opts.src);
        if (pub_vm) {
            gulpjs
                //.pipe(rev())
                .pipe(amdOptimize(mods.js.amdconfig))
                .pipe(concat(cancat_name))
                .pipe(uglify().on('error', function (e) {
                    console.log(e);
                }))                                         //压缩
                .pipe(gulp.dest(opts.dest));
                // .pipe(rev.manifest({
                //     base: opts.manifest,
                //     merge: true                          //与现有的清单合并(如果有的话)
                // }))
                // .pipe(gulp.dest(opts.dest));
        } else {
            if (opts.concat) {
                gulpjs
                    .pipe(amdOptimize(mods.js.amdconfig))
                    .pipe(concat('all.js'))
                    .pipe(gulp.dest(opts.dest))
                    .pipe(sourcemaps.init())
                    .pipe(rename({ suffix: '.min' }))
                    .pipe(uglify().on('error', function (e) {
                        console.log(e);
                    }))
                    .pipe(sourcemaps.write('.'))
                    .pipe(gulp.dest(opts.dest));
            } else {
                gulpjs
                    .pipe(gulp.dest(opts.dest))           //输出源文件
                    .pipe(sourcemaps.init())                //sourcemap 初始化            
                    .pipe(rename({ suffix: '.min' }))       //重命名压缩后的文件名
                    .pipe(uglify().on('error', function (e) {
                        console.log(e);
                    }))                                     //压缩
                    .pipe(sourcemaps.write('.'))            //以.map文件后缀名的形式输出，可不填，不填就输出到处理的文件里面                
                    .pipe(gulp.dest(opts.dest));
            }
        }
        return gulpjs;
    },
    image: function (opts) {
        if (pub_vm) {
            opts.dest = opts.pub;
        }

        var gulpimage = gulp.src(opts.src);

        if (opts.compact) {
            gulpimage.pipe(imagemin({
                optimizationLevel: 3,           //类型：Number  默认：3  取值范围：0-7（优化等级）
                progressive: true,              //类型：Boolean 默认：false 无损压缩jpg图片
                interlaced: true,               //类型：Boolean 默认：false 隔行扫描gif进行渲染
                multipass: true,                //类型：Boolean 默认：false 多次优化svg直到完全优化
                svgoPlugins: [{                 //不要移除svg的viewbox属性
                    removeViewBox: false
                }],
                use: [pngquant()]               //使用pngquant深度压缩png图片的imagemin插件
            }));
        }

        //gulpimage.pipe(gulp.dest(opts.dest));   //输出到对应目录

        if (opts.dest) {
            gulpimage.pipe(gulp.dest(opts.dest));
        }
        return gulpimage;
    },
    html: function (opts) {
        var gulphtml;

        if (pub_vm) {
            opts.dest = opts.pub;
            gulphtml = gulp
                .src([opts.manifest + '/*.json', opts.src])
                .pipe(revcollector({ replaceReved: true }))
                .pipe(replace(opts.rjs.main, cancat_name));
        } else {
            gulphtml = gulp.src(opts.src);     //要压缩的html文件
        }

        if (opts.minify) {
            gulphtml
                .pipe(htmlmin2({                //压缩HTML
                    minifyJS: true,             //压缩页面JS 
                    minifyCSS: true,            //压缩页面CSS 
                    removeComments: true,       //清除HTML注释
                    collapseWhitespace: true    //合并空白区域
                }))
        }

        gulphtml.pipe(gulp.dest(opts.dest));
        return gulphtml;
    }
}

/**
 * 生成单个任务
 */
var task = function (mod) {
    var task_mod = task_key + '_' + mod;
    var clean = mods[mod].beforeclean ? ['clean_' + mod] : [];
    gulp.task(task_mod, clean, function () {
        if (typeof builds[mod] === 'function') {
            return builds[mod](mods[mod]);
        }
    });
    task_list.push(task_mod);
}

/**
 * 清空文件夹
 */
var cleant = function (mod) {
    var mod_opts = mods[mod];
    var src;

    if (mod_opts.beforeclean) {
        if (typeof mod_opts.beforeclean === 'string') {
            src = mod_opts.beforeclean;
        } else {
            if (pub_vm) {
                src = mod_opts.pub;
            } else {
                src = mod_opts.dest
            }
        }
    }

    if (src) {
        gulp.task('clean_' + mod, function () {
            return gulp.src([src], { read: false })
                .pipe(clean());
        });
    }
}

/**
 * 循环生成任务
 */
for (var mod in builds) {
    new cleant(mod);
    new task(mod);
}

/**
 * 打包所有
 */
gulp.task(task_key, function (callback) {
    task_list.push(callback);
    sequence.apply(this, task_list);
});

/**
 * 帮助
 */
gulp.task('help', function () {
    console.log('');
    console.log('====================================================================================');
    console.log('=====================================帮助文档=======================================');
    console.log('====================================================================================');
    console.log('=====   gulp pack  <_less|_scss|_css|_js|_image|_html>              打包       =====');
    console.log('=====   gulp -p                                                     生产环境   =====');
    console.log('====================================================================================');
    console.log('');
});

/**
 * 打包全部
 */
gulp.task('default', ['help'], function () {
    if (md_vm !== 'all') {
        var t_idx = task_list.indexOf((task_key + md_vm));
        if (t_idx >= 0) {
            gulp.start(task_list[t_idx]);
        } else {
            console.log('not exists "' + (task_key + md_vm) + '" task');
        }
    }
});

/**
 * 合并打包requirejs
 */
gulp.task('pack_rjs', function () {
    return gulp.src(mods.js.src)
        .pipe(amdOptimize(mods.js.amdconfig))
        .pipe(concat('all.js'))
        .pipe(gulp.dest(mods.js.dest));
});

// livereload.listen();