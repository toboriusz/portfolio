'use strict';

module.exports = function (grunt) {

	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		sass: {
			options: {
				includePaths: ['node_modules/bootstrap/scss']
			},
			dev: {
                options: {
                    style: 'expanded',
                    sourcemap: 'none',
                    noCache: true
                },
				files: {
					'dev/css/style.css': 'dev/sass/style.sass'
				}
			}
		},
		watch: {
			grunt: { files: ['gruntfile.js'] },
			sass: {
				files: [ 'dev/sass/**/*.{sass,scss}' ],
				tasks: [ 'sass' ]
			},
			js: {
				files: [ 'dev/js/**/*.js', '!dev/js/{script,vendor}.js'  ],
				tasks: [ 'browserify:script' ]
			},
			html: {
				files: [ 'dev/**/*.nunjucks', 'data*.json' ],
				tasks: [ 'clean:html', 'nunjucks:dev' ]
			}
		},
		browserify: {
			script:{
				src: [ 'dev/js/index.js' ],
				dest:  'dev/js/script.js'
			}
		},
		postcss: {
			options: {
				processors: [
			        require('autoprefixer')({
			        		browsers: ['last 10 versions', 'ie 8', 'ie 9'],
                    		diff: true 
                    	}), // add vendor prefixes
			        require('cssnano')() // minify the result
		        ]
		    },
		    build: { expand: true, flatten: true, src: 'dev/css/*.css', dest: 'build/css' },
		},
		uglify: {
			options: { mangle: true, compress: true },
			build: {
				files: {
					'build/js/scripts.js' : [ 'dev/js/vendor.js', 'dev/js/script.js' ]
				}
			}
		},
		nunjucks: {
			options: {
				data: grunt.file.readJSON('data.json')
			},
			dev: {
				options: {
					configureEnvironment: function(env, nunjucks) { env.addGlobal('target', 'dev'); },
				},
			    files: [
					{
						expand: true, 
						cwd: 'dev/pages/', 
						src: "*.nunjucks", 
						dest: "dev/", 
						ext: ".html"
					}
			    ]
			},
			build: {
				options: {
					data: grunt.file.readJSON('data.json'),
					configureEnvironment: function(env, nunjucks) { env.addGlobal('target', 'build'); },
				},
			    files: [
			    	{
						expand: true, 
						cwd: 'dev/pages/', 
						src: "**/*.nunjucks", 
						dest: "build/", 
						ext: ".html"
					}
			    ]
			}
		},
		copy: {
			build: {
				files: [
					{ expand: true, cwd: 'dev/', src:'{fonts,docs,img}/**/*', dest:'build/' }
				]
			},
			packages: {
				files: [
					{ src: ['build*.zip'], dest: '/', filter: 'isFile' }
				]
			}
		},
		clean: {
			build: ['build', 'build.zip'], 
			img: ['build/img/'],
			html: ['dev/**/*.html']
		},
		chmod: {
			options: {
				mode: '777'
			},
			build: {
				src: ['build', 'build/**/*']
			}
		},
		compress: {
			build:{
				options: {
					archive: 'build.zip',
					mode: 'zip'
				},
				files: [
					{ expand: true, cwd: 'build/', src:['**'], dest: '' }
				]
			}
		},
		buildnumber: {
            options: {
              field: 'build',
            },
            files: ['data.json']
        },
        shell: {
        	deploy: {
        		command: [
        			'echo "Uploading app to server..."',
        			'scp build.zip maciej@toborek.io:build.zip',
        			'echo "Deleting files on server..."',
        			'ssh maciej@toborek.io "rm -rf www/*"',
        			'echo "Unpacking files..."',
        			'ssh maciej@toborek.io "unzip -q build.zip -d www/"',
        			'echo "Deleting temp files..."',
        			'ssh maciej@toborek.io "rm build.zip"',
        			'echo "Finish!"'
        		].join('&&')
        	}
        }
	});

	grunt.registerTask('compile', 	['sass', 'browserify', 'clean:html', 'nunjucks:dev'] );
	grunt.registerTask('default', 	['compile', 'watch']);
	grunt.registerTask('build', 	['buildnumber', 'clean:build', 'copy:build', 'sass', 'postcss:build', 'browserify', 'uglify:build', 'nunjucks:build', 'chmod:build'] );
	grunt.registerTask('deploy',	['compress', 'shell:deploy'] );
}
