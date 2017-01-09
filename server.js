var express = require('express');
var app = express();
var bodyParser = require('body-parser');
//var cookiePareser = require('cookie-parser');
var expressSession = require('express-session');

require('./models/users_model.js');
require('./models/foods_model.js');
require('./models/orders_model.js');
require('./models/records_model.js');

var mongoStore = require('connect-mongo')(
	{
		session: expressSession
	});
var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://localhost:27017/myproj');
//创建数据库连接

//server.engine('.html', require('ejs')._express);
app.engine('.html', require('ejs').__express);
//注册ejs模板为html页。
//简单的讲，就是原来以.ejs为后缀的模板页，现在的后缀名可以是.html了
app.set('views', __dirname + '/views');
//the directory where the template files are located
//设置模板文件文件夹,__dirname为全局变量,表示网站根目录
app.set('view engine','html'); 
//the template engine to use
//设置视图模板的默认后缀名为.html,避免了每次res.Render("xx.html")的尴尬

app.use(bodyParser());
//app.use(cookiePareser());

app.use(expressSession(
{
	secret:'SECRET',
	cookie:{maxAge:60*60*1000},
	store: new mongoStore(
	{
		//db: mongoose.connection.db,
		//(无法被使用，故暂时删除此句)
		url: "mongodb://localhost:27017/myproj",
		collection:'sessions'
		//session对象直接绑定在MongoDB的sessions集合中的，以便更改会话时，它们被保存在数据库中
	})
}
));

require('./routes')(app);
//添加从./routes到Express服务器的路由
app.listen(3000);

/* 访问次数测试-> */
/*
var http = require('http');
var count = 0;
http.createServer(function (request, response) {
  response.writeHead(200, {'Content-Type': 'text/plain'});
  response.end((++count).toString())
}).listen(3001);
console.log('Server running at http://127.0.0.1:3000/');
*/
/* <-访问次数测试 */

