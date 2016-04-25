# gulp-pack-tool

## 打包编译 配置文件
```javascript
exports.mods = {
    less: {
        src: './src/mobile/less/main.less',
        dest: './src/console/less/css',
        beforeclean: './src/mobile/less/css'
    },
    scss: {
        src: './src/mobile/scss/m.scss',
        dest: './src/mobile/css/scss',
        beforeclean: './src/mobile/css/scss'
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
            main: 'main.js'         // requirejs 的主文件
        }
    }
};
```


### 打包编译所有类型文件

1. 编译压缩模式。
```
gulp pack 
```
2. 发布模式命令行后面加 `-p`。
```
gulp pack -p
```

### 打包编译单类文件，同样可在每个命令行后面添加 `-p`，使用

1. 编译SCSS
```
gulp pack_scss
```

2. 编译LESS
```
gulp pack_less
```

3. 编译LESS
```
gulp pack_less
```

4. 压缩CSS
```
gulp pack_less
```

5. 图片压缩
```
gulp pack_image
```

6. HTML压缩
```
gulp pack_html
```