exports.mods = {
    less: {
        src: './src/mobile/less/main.less',
        dest: './src/console/less/css',
        beforeclean: './src/mobile/less/css'
    },
    scss: {
        src: './src/mobile/scss/m.scss',
        dest: './src/mobile/css/scss',
        //beforeclean: './src/mobile/css/scss'
    },
    css: {
        src: './src/mobile/css/**/*.css',
        dest: './dist/mobile/css',
        pub: './pub/mobile/css',
        manifest: './pub/mobile',
        beforeclean: true,
        autoprefixer: false
    },
    js: {
        src: ['./src/mobile/scripts/**/*.js', '!./src/mobile/scripts/**/*.min.js'],
        dest: './dist/mobile/scripts',
        pub: './pub/mobile/scripts',
        manifest: './pub/mobile',
        beforeclean: true,
        concat: true,
        amdconfig: {
            baseUrl: './src/mobile/scripts',
            mainConfigFile: './src/mobile/scripts/main.js',
            exclude: ['zepto', 'angular', 'uiRoute', 'ngTouch', 'moment', 'swipe']
        }
    },
    image: {
        src: './src/mobile/imgs/**/*.{png,jpg,jpeg,gif,ico,svg}',
        dest: './dist/mobile/imgs',
        pub: './pub/mobile/imgs',
        compact: true
    },
    html: {
        src: './src/mobile/**/*.html',
        dest: './dist/mobile/',
        pub: './pub/mobile/',
        manifest: './pub',
        minify: true,
        rjs: {
            main: 'main.js'
        }
    }
};