var deep = require("deep/deep");
var fs = require("fs");
var marked = require("marked");
var pygmentize = require("pygmentize-bundled");
//__________________________________________________

var markedOpt = {
  gfm: true,
  highlight: function (code, lang, callback) {
  	//console.log("highlight : ", lang)
    pygmentize({ lang: lang, format: 'html' }, code, function (err, result) {
    	//console.log("pygmentised : ", result.toString())
      	if (err) 
      		return callback(err);
      	callback(null, result.toString());
    });
  },
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: true,
  smartLists: true,
  smartypants: false,
  langPrefix: 'lang-'
};


deep.protocoles.marked = new deep.Store();
deep.protocoles.marked.get = function (path, options) {
	options = options || {};
	if(options.cache !== false && deep.mediaCache.cache["marked::"+path])
		return deep.mediaCache.cache["marked::"+path];
	var def = deep.Deferred();
	fs.readFile(path, function(err, datas){
		if(err)
		{
			return def.reject(err);
		}	
		if(datas instanceof Buffer)
			datas = datas.toString("utf8");
		// Using async version of marked
		marked(datas, markedOpt, function (err, content) {
		  	if (err){
				return def.reject(err);
			}
			def.resolve(content);
		});
	});
	var d = def.promise();
	if(options.cache !== false)
		deep.mediaCache.manage(d, "marked::"+path);
	return d;
};

