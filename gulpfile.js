const gulp = require('gulp');
const imagemin = require('gulp-imagemin'); //引入图片压缩模块
const scriptmin = require('gulp-uglify'); //引入js压缩模块
const gulpless = require('gulp-less'); //引入less转换模块
const gulp_minify_css = require('gulp-minify-css'); //压缩css
const concat = require('gulp-concat'); //引入合并代码模块
const babel = require('gulp-babel'); //引入ES6转ES5模块
const autoprefixer = require('gulp-autoprefixer'); //增加浏览器前缀
const rev = require('gulp-rev');//给静态文件资源添加hash值防缓存

const browserSync = require('browser-sync'); //热更新模块

/*
gulp.task -- 定义任务
gulp.src -- 找到需要执行任务的文件
gulp.dest -- 执行任务的文件的去处
gulp.watch -- 观察文件是否发生改变
安装gulpless压缩模块 npm i gulp-less --save-dev

执行任务 gulp + 任务名称 + 回车
*/

// 拷贝文件
gulp.task("copyHtml", function () {
    //pipe后面对应的地址就是将前面路径文件拷贝复制到哪里去
    console.log('\n正在打包编译中，请稍后......................\n');
    gulp.src(["src/**", "!src/js/*", "!src/css/*"]).pipe(gulp.dest("dist"))
});

//图片压缩
//安装模块 npm install --save-dev gulp-imagemin
gulp.task("imageMin", function () {
    gulp.src('src/images/*')
        .pipe(imagemin([
            imagemin.gifsicle({
                interlaced: true
            }),
            imagemin.jpegtran({
                progressive: true
            }),
            imagemin.optipng({
                optimizationLevel: 7
            }),
            imagemin.svgo({
                plugins: [{
                        removeViewBox: true
                    },
                    {
                        cleanupIDs: false
                    }
                ]
            })
        ]))
        .pipe(gulp.dest('dist/images'))
})

// 转行压缩css
gulp.task("minCss", function () {
    gulp.src("src/css/*.css")
        //.pipe(rev())//添加hash值防缓存
        //.pipe(gulpless())
        .pipe(autoprefixer({ //增加浏览器前缀
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(gulp_minify_css())
        .pipe(gulp.dest("dist/css"))
    gulp.src(["src/css/*", "!src/css/*.css"]).pipe(gulp.dest("dist/css"))
});

//ES6转换转ES5(babel-v7版本)
gulp.task('babel', () =>
    gulp.src('src/js/*.js')
    .pipe(babel({
        presets: ['@babel/env']
    }))
    .pipe(scriptmin()) //转换后进行压缩
    .pipe(gulp.dest('dist/js'))
);


//代码合并
//安装 npm i gulp-concat --save-dev
// gulp.task("concat", function () {
//     gulp.src("src/js/*.js")
//         .pipe(concat("main.js"))
//         .pipe(scriptmin()) //在合并的时候压缩js
//         .pipe(gulp.dest("dist/js"))
// })

//初始化browserSync
browserSync.init({
    server: {
        baseDir: './src'
    },
    middleware: function (req, res, next) {
        let str = '';
        let pathname = require('url').parse(req.url).pathname;
        if (pathname.match(/\.css/)) {
            str = scssSolve(pathname);
            if (str) {
                res.end(str);
            }
        }
        if (pathname.match(/\.js/)) {
            str = jsSolve(pathname);
            if (str) {
                res.end(str);
            }
        }
        next();
    }
});

// gulp.watch('src/*.html').on('change', function () {
//     browserSync.reload('*.html');
// });
// gulp.watch('src/*.php').on('change', function () {
//     browserSync.reload('*.php');
// });
// gulp.watch('src/css/**/*.scss').on('change', function () {
//     browserSync.reload('*.css');
// });
// gulp.watch('src/js/**/*.js').on('change', function () {
//     browserSync.reload('*.js');
// });
// browserSync.reload();


//监听文件是否发生改变
gulp.task("Watch", function () {
    gulp.watch("src/*.html", ["copyHtml"]);
    gulp.watch("src/css/*.css", ["minCss"]);
    gulp.watch("src/js/*.js", ["babel"]);
    //gulp.watch("src/images/*", ["imageMin"]);
})


//如果直接执行 gulp 那么就是运行任务名称为‘default’的任务,后面数组代表所需要执行的任务列表
//"imageMin"不加入，否则实在太慢，图片压缩还是单独处理吧
gulp.task('default', ["copyHtml", "babel", "minCss"], function () {
    setTimeout(()=>{
        console.log('\n恭喜你，编译打包已完成，所有文件在dist文件夹！！！');
    },1000)
});