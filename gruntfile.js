module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
  //Configurazione per il plugin di concatenazione
    concat: {
        options: {
            separator: ';',
        },
      dist: {
          files: {
              'www/js/build/tmp/init.js': ['www/js/init/jquery-1.11.0.min.js', 'www/js/init/Application.js', 'www/js/init/Parameters.js', 'www/js/init/RelativePath.js', 'www/js/init/CategorySearcher.js', 'www/js/init/Utility.js'],
              'www/js/build/tmp/lib.js': ['www/js/lib/*/*.js', 'www/js/lib/*.js'],
              'www/js/build/tmp/core.js': ['www/js/core/*/*.js'],
              'www/js/build/tmp/modules.js': ['www/js/modules/*/*.js'],
          }
      },
      allTogether: {
          files: {
              'www/js/build/production.js': ['www/js/build/tmp/init.js', 'www/js/build/tmp/lib.js', 'www/js/build/tmp/core.js', 'www/js/build/tmp/modules.js']

          }
      }
    },
    clean: ['www/js/build/tmp/'],
	"disit-json-merger": {
		options: {
			replacer: null,
			space: " "
		},
		singleTemplate: {
			files:{'www/js/build/singleTemplate.json': ['www/js/modules/*/*.singleTemplate.json']},
		}
	},
	"json-merger": {
		options: {
			replacer: null,
			space: " "
		},
		ita: {
			files:{'www/js/build/labels.ita.json': ['www/js/data/json/labels/labels.ita.json','www/js/modules/*/*.labels.ita.json']},
		},
		eng: {
			files:{'www/js/build/labels.eng.json': ['www/js/data/json/labels/labels.eng.json','www/js/modules/*/*.labels.eng.json']},
		},
		deu: {
			files:{'www/js/build/labels.deu.json': ['www/js/data/json/labels/labels.deu.json','www/js/modules/*/*.labels.deu.json']},
		},
		esp: {
			files:{'www/js/build/labels.esp.json': ['www/js/data/json/labels/labels.esp.json','www/js/modules/*/*.labels.esp.json']},
		},
		fra: {
			files:{'www/js/build/labels.fra.json': ['www/js/data/json/labels/labels.fra.json', 'www/js/modules/*/*.labels.fra.json']},
		}
	}
  });
  // Specifichiamo quali plugin usare

  grunt.loadNpmTasks('disit-json-merger');
  grunt.loadNpmTasks('grunt-json-merger');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-clean');
  //Specifichiamo quali compiti eseguire al usando il comando “grunt”
  grunt.registerTask('default', ['concat:dist','concat:allTogether', 'clean','disit-json-merger:singleTemplate', 'json-merger']);
};