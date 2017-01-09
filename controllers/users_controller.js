var crypto = require('crypto');
var mongoose = require('mongoose'),
	User = mongoose.model('User');

function hashPW(pwd) {
	return crypto.createHash('sha256').update(pwd).digest('base64').toString();
}

exports.signup = function(req,res){
	var user = new User(
	{
		username:req.body.username
	});

	user.set('hashed_password',hashPW(req.body.password));
	user.set('sex',req.body.sex);
	user.set('age',req.body.age);
	user.set('area',req.body.area);
	user.save(function(err){
		if (err) {
			//res.session.msg = err;
			//error 未被定义
			res.redirect('/signup');
		}else{
			req.session.user = user.id;
			req.session.userarea = user.area;
			//由mongodb创建的id被添加为req.session.user的属性
			req.session.username = user.username;
			//req.session.msg = 'Authenticated as ' + user.username;
			res.redirect('/');
		}
	});
};

exports.login = function(req,res){
	User.findOne({
		username:req.body.username
	}).exec(function(err,user){
		if (!user) {
			err = 'User not Found!';
		}else if (user.hashed_password ===hashPW(req.body.password.toString())) {
			req.session.regenerate(
				function(){
					req.session.user = user.id;
					req.session.userarea = user.area;//在会话中存用户的area
					//由mongodb创建的id被添加为req.session.user的属性
					req.session.username = user.username;
					//req.session.msg = 'Authenticated as ' + user.username;
					if (user.username == "admin") {
						res.redirect('/ordersadmin');
					}else{
						res.redirect('/');
					}
					
				});
		}else{
			err = 'Authentication failed.';
		}
		if (err) {
			req.session.regenerate(function(){
				req.session.msg = err;
				res.redirect('/login');
			});
		}
	});
};

exports.getUserProfile = function(req,res){
	User.findOne(
		{_id:req.session.user},{'hashed_password':0,'__v':0,'_id':0}).exec(function(err,user){
			if (!user) {
				res.json(404,{err:'User not Found.'});
			}else{
				//console.log(user);
				res.json(user);
			}
		});
};

/*
exports.updateUser = function (req,res){
	User.findOne({_id:req.session.user}).exec(function(err,user){
		//user.set('email',req.body.email);
		user.save(function(err){
			if(err){
				res.session.error = err;
			}else {
				req.session.msg = 'User Updated.';
			}
			res.redirect('/user');
		});
	});
};

exports.deleteUser = function(req,res){
	User.findOne({_id:req.session.user}).exec(function(err,user){
		if (user) {
			user.remove(function(err){
				if (err) {
					req.session.msg = err;
				}
				req.session.destroy(function(){
					res.redirect('/login');
				});
			});
		} else {
			req.session.msg = "User Not Found!";
			req.session.destroy(function(){
				res.redirect('/login');
			});
		}
	});
};
*/