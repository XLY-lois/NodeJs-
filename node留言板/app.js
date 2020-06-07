var http = require('http');
var url = require('url');
var template = require('art-template');
var fs = require('fs');


var server = http.createServer();


var data = fs.readFileSync('db.json','utf-8');//同步读取db中的数据
// console.log(data);
var comments = eval ("(" + data + ")");//将json字符串转换为js对象
comments = comments.reverse();//js对象数组倒序 最新的渲染在最前面
// console.log(comments);
// var comments = [
//     {name:'张三',msg:'今天天气不错啊',time:'2020-5-14'},
//     {name:'张三2',msg:'今天天气不错啊',time:'2020-5-14'},
//     {name:'张三3',msg:'今天天气不错啊',time:'2020-5-14'},
//     {name:'张三4',msg:'今天天气不错啊',time:'2020-5-14'},
// ]//原本写的假数据
// console.log(comments)


server.on('request',function(req,res){
	// console.log('收到请求了');
	var parseObj = url.parse(req.url,true);//将路径解析成对象
    var pathname = parseObj.pathname;//单独获取不包含查询字符串的路径部分（即不包含问号后的内容)

	if(pathname === '/'){
			fs.readFile('./views/index.html',function(err,data){
			if(err){
				return res.end('404 not found.');
			}
			var htmlStr = template.render(data.toString(),{
				comments:comments
			});
			res.end(htmlStr);
		})
	}else if(pathname === '/post'){
		fs.readFile('./views/post.html',function(err,data){
			if(err){
				return res.end('404 not found');
			}
			res.end(data);
		})
	}else if(pathname === '/comment'){
		console.log('收到表单请求');
		var urlObj=url.parse(req.url,true);
        // console.log(urlObj);
        fs.readFile('./db.json',function(err,data){
        	if(err){
        		console.log('读取文件失败')
        	}
        	var fileData = JSON.parse(data);
            fileData.push(urlObj.query);
            fs.writeFile('db.json',JSON.stringify(fileData),function(err){
            if(err){
            throw err;
            }
            console.log('ok');
          });
        })
        comments.unshift(urlObj.query);
		res.statusCode = 302;
		res.setHeader('Location','/');
		res.end();
	}else if (pathname.indexOf('/public/') >= 0){
		fs.readFile('.'+pathname,function(err,data){
			if(err){
				return res.end('404 not found');
			}
			res.end(data);
		});
	}else{
		fs.readFile('./views/404.html',function(err,data){
			if(err){
				return res.end('404 not found');
			}
			res.end(data);
		});
	}
})

server.listen(3000,function(){
	console.log('running...')
});