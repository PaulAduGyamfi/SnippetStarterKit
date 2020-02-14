const gulp = require("gulp");
const sass = require("gulp-sass");
const imagemin = require("gulp-imagemin");
const browserSync = require("browser-sync");
const CacheBuster = require("gulp-cachebust");
const cachebust = new CacheBuster();
const htmlmin = require("gulp-html-minifier")
const del = require("del");
const autoprefixer = require("gulp-autoprefixer");
const exec = require("child_process").exec;
const prettyUrl = require("gulp-pretty-url");

function bustCache(src, dest) {
    return () =>
      gulp
        .src(src)
        .pipe(cachebust.references())
        .pipe(gulp.dest(dest));
  }

//Compiles SCSS To CSS

function getSass() {
    return gulp
      .src("src/scss/**/*.scss")
      .pipe(
        sass({
          outputStyle: "compressed",
          includePaths: [require("path").resolve(__dirname, "node_modules")]
        }).on("error", sass.logError)
      )
      .pipe(
        autoprefixer({
          browsers: ["last 2 versions"]
        })
      );
  }

//Output file for sass to css
  function compileSass() {
    return getSass()
      .pipe(gulp.dest(`./dist/css`))
      .pipe(browserSync.stream());
  }

  function compileSassProd() {
    return getSass().pipe(gulp.dest(`./temp/css`));
  }


  function compileJS(cb) {
    return exec("npm run dev:webpack", function(err, stdout, stderr) {
      console.log(stdout);
      console.log(stderr);
      cb(err);
    });
  }

  function compileJSProd(cb) {
    return exec("npm run build:webpack", function(err, stdout, stderr) {
      console.log(stdout);
      console.log(stderr);
      cb(err);
    });
  }



  function startBrowserSync() {
    browserSync.init({
      server: "./dist",
      notify: false,
      open: true 
    });
  }
  

  function minifyHtml(){
      return gulp.src('./src/views/**/*.html')
      .pipe(htmlmin({collapseWhitespace: true}))
      .pipe(gulp.dest('./dist'))
  }

 function minifyImages(){
    return gulp.src('src/images/*')
        .pipe(imagemin(
        imagemin.gifsicle({ interlaced: true }),
        imagemin.jpegtran({ progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [{ removeViewBox: true }, { cleanupIDs: false }]
        }),
        ))
        .pipe(gulp.dest('dist/images'))
 } ;

 function cleanUrl() {
    return gulp
      .src("temp/**/*.html")
      .pipe(prettyUrl())
      .pipe(gulp.dest("dist"));
  }
  
  
  function watchFiles() {
    gulp.watch(
      "./src/views/**/*",
      gulp.series("views:dev", clearDirectory("./temp"))
    );
    gulp.watch("./src/scss/**/*", gulp.series("styles:dev"));
    gulp.watch(["./dist/**/*", "./dist/*"]).on("change", browserSync.reload);
  }

  function cleanUrl() {
    return gulp
      .src("temp/**/*.html")
      .pipe(prettyUrl())
      .pipe(gulp.dest("dist"));
  }
  
  function cleanUrlAndBustCache() {
    return gulp
      .src("temp/**/*.html")
      .pipe(prettyUrl())
      .pipe(cachebust.references())
      .pipe(gulp.dest("dist"));
  }


gulp.task("styles:dev", compileSass);
// Use Webpack to compile latest Javascript to ES5
gulp.task("webpack:dev", compileJS);

// Browser-sync to get live reload and sync with mobile devices
gulp.task("browsersync", startBrowserSync);

gulp.task("views:prod", gulp.series(minifyHtml, cleanUrlAndBustCache));

gulp.task(
    "views:dev",
    gulp.series([minifyHtml, cleanUrl, clearDirectory("./temp")])
  );


// * Prod Tasks
gulp.task(
    "styles:prod",
    gulp.series(compileSassProd, bustCache("temp/css/**/*.css", "./dist/css"))
  );
  
  gulp.task(
    "webpack:prod",
    gulp.series(compileJSProd, bustCache("temp/js/**/*.js", "./dist/js"))
  );

gulp.task(
    "webpack:prod",
    gulp.series(compileJSProd, bustCache("temp/js/**/*.js", "./dist/js"))
  );
  
  // Minimise Your Images
  gulp.task("imagemin", minifyImages);

  function clearDirectory(...folders) {
    return function clearThisDirectory() {
      return del(folders);
    };
  }

//   / Tasks to generate site on development this will also have live reload
gulp.task(
  "static:dev",
  gulp.series([
    clearDirectory("./dist/js", "./dist/css"), // first we clear the old files
    gulp.parallel([
      gulp.series([
        gulp.series([
          "views:dev", // then we compile html files
          "styles:dev" // then we compile the css
        ]),
        watchFiles
      ]),
      "webpack:dev", // start webpack on watch mode
      "browsersync"
    ])
  ])
);

// this will run your static site for production
gulp.task(
  "static:build",
  gulp.series([
    clearDirectory("./dist"), // wipe the dist folder
    gulp.parallel(["styles:prod", "webpack:prod", "imagemin"]), // run in parallel because these are slow
    "views:prod",
    () => del(["./temp"])
  ])
);

gulp.task("default", gulp.series("static:dev"));

