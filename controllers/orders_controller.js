var mongoose = require('mongoose'),
Order = mongoose.model('Order');
Food = mongoose.model('Food');

exports.addOrder = function (req,res){
	//console.log('OK');
	var orderfoods = req.body.orderfoods;
	var avoid = req.body.avoid;
	var staple = req.body.staple;
	var guestnum = req.body.guestnum;
	if (orderfoods) {
	//首先在数据库中查找是否有该用户id下的订单
	//合计点菜的金额
	var n = orderfoods.length;
	var total =0;
	for(var i=0;i<n;i++){
		//合计每个菜的价格
		total = total + Number(orderfoods[i][2]); 
		//给每个菜的foodhot＋1
		Food.update({_id:orderfoods[i][0]},
		{$inc:{'foodhot':1}}).exec(
			function(err,food){

		});
	};

	Order.findOne({userid:req.session.user}).exec(
		function(err,order){
		var limitedNum=5;//limit the seat amount
		if (!order) //当没有该用户id下的订单时，添加订单	
		{
			//在输入数据库前需要查询当前status为-1,0和4人数，即 可入座的＋正在吃的＋正在排队的
			Order.find({"$or": [{"status": -1}, {"status": 0 }, {"status": 4}]}).exec(
				function(err,orders){
					var eatingNum=orders.length;//当前就餐人数
					if(eatingNum>=limitedNum){
						//当可入座的＋正在吃的＋正在排队的人数大于30时，需要排队，状态为4		
						var neworder = new Order({
						userid: req.session.user,
						username: req.session.username,
						guestnum: guestnum,
						staple: staple,
						foods: orderfoods,
						avoid: avoid,
						total: total,
						status: 4 //表示要等待
						});

						neworder.save();//用来保存数据库
						res.json(order);
					}else{
						var neworder = new Order({
						userid: req.session.user,
						username: req.session.username,
						guestnum: guestnum,
						staple: staple,
						foods: orderfoods,
						avoid: avoid,
						total: total,
						status: -1 //表示可以入座
						});

						neworder.save();//用来保存数据库
						res.json(order);
					}
				});

		} else {
		//当表中已存在该用户订单，删除原有订单，添加新订单
		//（当用户未付款无法点单，次数更新的订单是状态付过款和打过分的，不合理，插队了，应先删除原来的再添加）
		/*
			Order.update({userid:req.session.user},
				{$set: {foods:orderfoods,total:total,status:0,avoid:avoid}}).exec(function(err,order){
			});	
			res.json(order);
		*/

			Order.find({"$or": [{"status": -1}, {"status": 0 }, {"status": 4}]}).exec(
				function(err,orders){
				var eatingNum=orders.length;//当前就餐人数
				if(eatingNum>=limitedNum){

				order.remove();//删除原有user订单
				//当没有该用户id下的订单时，添加订单			
				var neworder = new Order({
				userid: req.session.user,
				username: req.session.username,
				guestnum: guestnum,
				staple: staple,
				foods: orderfoods,
				avoid: avoid,
				total: total,
				status: 4
				});

				neworder.save();//用来保存数据库
				res.json(order);

				}else{

				order.remove();//删除原有user订单
				//当没有该用户id下的订单时，添加订单			
				var neworder = new Order({
				userid: req.session.user,
				username: req.session.username,
				guestnum: guestnum,
				staple: staple,
				foods: orderfoods,
				avoid: avoid,
				total: total,
				status: -1
				});

				neworder.save();//用来保存数据库
				res.json(order);	

				}
				});
		}			
	})
//以上为菜单有更新

}else{
//未点菜单
console.log("未点菜，菜单无变化！");
}

};

exports.getOrderInfo = function(req,res){
	//console.log(req.session.user);
	Order.findOne({userid:req.session.user}).exec(function(err,order){
		if (!order) {
			//当未找到改订单时，返回空值即可
			res.json("");

		}else{
			console.log(order);
			res.json(order);
			//无论是res.json（）还是 res.send() 底层代码都是用res.end()结束。
		}
	})

};

/*
//获取所有订单信息
exports.getOrdersInfo = function(req,res){
	//console.log("getOrderInfo");
	Order.find({status:0}).exec(function(err,orders){
		if (!orders) {
			//console.log("");
			res.json(404,{err:'Orders not Found.'});
		}else{
			//console.log(orders);
			res.json(orders);
			//console.log("hey!");
			//无论是res.json（）还是 res.send() 底层代码都是用res.end()结束。
		}
	})
};
*/

//获取正在排队的订单的
exports.getWaitingOrders = function(req,res){
	//console.log("getOrderInfo");
	Order.find({status:4}).exec(function(err,orders){
		if (!orders) {
			//console.log("");
			res.json(404,{err:'WaitingOrders not Found.'});
		}else{
			//console.log(orders);
			res.json(orders);
			//console.log("hey!");
			//无论是res.json（）还是 res.send() 底层代码都是用res.end()结束。
		}
	})
};

//获取可以入座的订单的
exports.getAvailableOrders = function(req,res){
	//console.log("getOrderInfo");
	Order.find({status:-1}).exec(function(err,orders){
		if (!orders) {
			//console.log("");
			res.json(404,{err:'AvailableOrders not Found.'});
		}else{
			//console.log(orders);
			res.json(orders);
			//console.log("hey!");
			//无论是res.json（）还是 res.send() 底层代码都是用res.end()结束。
		}
	})
};

//获取未付款的订单
exports.getUnpaidOrders = function(req,res){
	//console.log("getOrderInfo");
	Order.find({status:0}).exec(function(err,orders){
		if (!orders) {
			//console.log("");
			res.json(404,{err:'UnpaidOrders not Found.'});
		}else{
			//console.log(orders);
			res.json(orders);
			//console.log("hey!");
			//无论是res.json（）还是 res.send() 底层代码都是用res.end()结束。
		}
	})
};

//获取已付款但未打分的订单
exports.getPaidOrders = function(req,res){
	//console.log("getOrderInfo");
	Order.find({status:1}).exec(function(err,orders){
		if (!orders) {
			//console.log("");
			res.json(404,{err:'PaidOrders not Found.'});
		}else{
			//console.log(orders);
			res.json(orders);
			//console.log("hey!");
			//无论是res.json（）还是 res.send() 底层代码都是用res.end()结束。
		}
	})
};

/*
//获取打分的订单
exports.getMarkedOrders = function(req,res){
	//console.log("getOrderInfo");
	Order.find({status:2}).exec(function(err,orders){
		if (!orders) {
			//console.log("");
			res.json(404,{err:'MarkedOrders not Found.'});
		}else{
			//console.log(orders);
			res.json(orders);
			//console.log("hey!");
			//无论是res.json（）还是 res.send() 底层代码都是用res.end()结束。
		}
	})
};
*/


//确认用户入座，将status设置为0（在吃）
exports.sitOrder = function(req,res){
	var id = req.params.id;
	Order.update({_id:id},{$set:{status:0}}).exec(function(err,order){
		res.json(order);
	});
}

//用户付款，将status设置为1
exports.payOrder = function(req,res){
	var id = req.params.id;
	//当一个人付完款了，必定空出一个座位，然后检查当前是否有排队的user
	Order.update({_id:id},{$set:{status:1}}).exec(function(err,order){
		//res.json(order);
		toEat();
	});

	function toEat(){
		Order.findOne({status:4}).exec(function(err,order){
		if(order){
			//当找到第一个排队的用户，让他显示可以入座
			console.log(order);
			Order.update({_id:order._id},{$set:{status:-1}}).exec(function(err,order){
			res.json(order);
			});
		}else{
			//当未找到时无操作
			res.json(order);
		}
	});
	}
}

/*
exports.markOrder = function(req,res){
	var id = req.params.id;
	Order.update({_id:id},{$set:{status:2}}).exec(function(err,order){
		res.json(order);
		res.redirect('/user');
	})
}
*/

exports.deleteOrder = function(req,res){
	var id = req.params.id;
	Order.findOne({_id:id}).exec(function(err,food){
		if (food) {
			food.remove(function(err){
				if(err){
					console.log('delete failed')
				}
				res.json(food); //删除后返回food信息
			});
		}else{
			req.session.msg = "Food Not Found! ";
			res.json(food);
		}
	})
}



