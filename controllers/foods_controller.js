var mongoose = require('mongoose'),
	Food = mongoose.model('Food');

exports.getMenu = function(req,res){
	Food.find().exec(function(err,menu){
		//console.log(menu);
			if (!menu) {
				res.json(404,{err:'Menu not Found.'});
			}else{
				res.json(menu);
			}
		});
};

//4、此处执行addFood函数，获取请求的数据并分别代入设定好的food模版中
exports.addFood = function(req,res){

	var food = new Food({
		foodname:req.body.foodname,
		foodhot: 0,
		foodscore: 0
	});
	food.set('foodimg',req.body.foodimg+'.jpg');
	//console.log(req.body.foodimg);
	food.set('foodprice',req.body.foodprice);
	food.set('fooddesc',req.body.fooddesc);
	food.set('foodtype',req.body.foodtype);//菜的类型
	food.set('foodarea',req.body.foodarea);//菜的菜系

	food.save(function(err){
		if (err) {
			//res.session.error = err;
			//error 未被定义
			req.session.msg = "Add出错！该食品已经存在";
			res.redirect('/foodadmin'); 
			//如果保存发生错误，比如foodname已经存在，则跳转回foodadmin页面，利用"/foodadmin" http请求
		}else{
			req.session.food = food.id;
			//由mongodb创建的id被添加为req.session.food的属性
			//req.session.msg = food.id + "添加完成";
			res.redirect('/foodadmin'); 
			//保存成功，并跳转回foodadmin页面，利用"/foodadmin" http请求
		}
	})
}

exports.searchFood = function(req,res){
	var keyword = req.params.keyword;
	var query={};
  	if(keyword) {
   		query['foodname']=new RegExp(keyword);//模糊查询参数
  	}
	console.log(query);
	Food.find(query).exec(function(err,foods){
		if (foods) {
			res.json(foods);
		}
	})
}

exports.deleteFood = function(req,res){
	var id=req.params.id;
	Food.findOne({_id:id}).exec(function(err,food){
		if (food) {
			food.remove(function(err){
				if(err){
					console.log('delete failed')
				}
				res.redirect('/foodadmin');
			});
		}else{
			req.session.msg = "Food Not Found! ";
			res.redirect('/foodadmin');
		}
	})

}

exports.editFood = function(req,res){
	var id = req.params.id;
	Food.findOne({_id:id}).exec(function(err,food){
		if (!food) {
			res.json(404,{err:'The food not Found.'});
		}else{
			res.json(food);
		}
	})
}

exports.updateFood = function(req,res){
	var id = req.params.id;
	Food.update({_id:id},{$set: {foodimg:req.body.foodimg, foodname:req.body.foodname, foodprice:req.body.foodprice, fooddesc:req.body.fooddesc,foodhot: 0,
		foodscore: 0}}).exec(function(err,food){
			res.json(food);
			//console.log(food);
		})
}

exports.hotFood = function(req,res){
	//取消服务器hotfood数量限制
	Food.find().sort({foodhot:-1})/*.limit(5)*/.exec(function(err,hotfood){
		if (!hotfood) {
			res.json(404,{err:'The hotfood not Found.'});
		}else{
			res.json(hotfood);
		}
	})
}












