var mongoose = require('mongoose'),
Record = mongoose.model('Record');
Order = mongoose.model('Order');
User = mongoose.model('User');
Food = mongoose.model('Food');

exports.addRecord = function(req,res){
	var orderid = req.body.orderid
	var newmark = req.body.mark;
	var userid = req.session.user;
	//console.log(mark);

	Record.findOne({userid:userid}).exec(
		function(err,record){
			if(!record){
				//当没有该用户id下的记录时添加记录
				var record = new Record({
					userid:userid,
					mark:newmark
				});

				record.save();
				res.json(record);
				//console.log("新添了数据到record表");
			}else{
				//当表中存在该用户记录时
				//首先获取该id下的信息
				//console.log("表中存在该用户");
			
			var markUpdate = function(){
				var i,j=0;
				var l = record.mark.length;//用于增加数组
				var m = record.mark.length;
				var n = newmark.length;
				//console.log("old "+m);
				//console.log("new "+n);

				//更新分数
				for(j = 0;j<n;j++){ 
					//新增的分数表
					for(i=0;i<m;i++){ 
						//原纪录中的分数表
						if(record.mark[i].foodid == newmark[j].foodid){
							//找到了该foodid，更新分数
							record.mark[i].score = newmark[j].score;
							break;
						}	
					}
					//当在记录表中未找到该foodid，添加到record.mark数组里
						if(i==m){
							//console.log(newmark[j]);
							//record.mark[l] = newmark[j];
							record.mark.push(newmark[j]);
							//console.log(newmark[j]);
							//l=l+1;
						}
				}
			}

			var recordUpdate =function(){
					Record.update({userid:userid},{$set:{mark:record.mark}}).exec(
						function(err,record){
							res.json(record);
							console.log("更新了record表数据");
					});
			}

			markUpdate();
			recordUpdate();
			//在record表写入数据后，更新订单状态
				/*
				//当mark定义为二维数组的算法
				for(j = 0;j<n;j++){ //先遍历新的数据，先取其中一个新数据
					for(i=0;i<m;i++){ //新数据与每个原有数据相对比
						//遍历所有表中的数据及新添的数据
						if(record.mark[i][0]==newmark[j][0]){
							//当在原有数据中找到了相同foodid的数据，update
							record.mark[i][1] = newmark[j][1];
							break;
							//增加跳转，当找到该foodid后跳出这个循环，不再继续当前循环，即不再从原有数据中找与其相同的foodid（因为已经没有了）
						}
						//bug:每次循环只要foodid没找到就循环这句
						//record.mark[l] = newmark[j]; //若在原有数据中未找到相同foodid，在mark数组末尾加上这条food数组
						//l = l+1; //增加数组长度，为了让下一个新加的数据赋值										
					}
					if(i == m){
						//i==m时，该循环已经结束
						record.mark[l] = newmark[j]; //若在原有数据中未找到相同foodid，在mark数组末尾加上这条food数组
						l = l+1;
					}
				}
				*/

				//console.log(record.mark);
				//现在record.mark已经是更新后的mark数组了，在数据库中更新
			}
			var orderUpdate = function(){
			Order.update({_id:orderid},{$set:{status:2}}).exec(
				function(err,order){
					console.log("该订单status已经置为2");
				});
			}
			orderUpdate();
		})
}

exports.getInputUser = function(req,res){
	if(req.session.user){
		//当session中有user时
		var InputUserid = req.session.user;//在会话中取用户id
		var InputUserarea = req.session.userarea;//在会话中取用户地区
		console.log(InputUserarea);
		//var str = "InputUserid:"+InputUserid+","+"InputUserarea:"+InputUserarea;
		//console.log(str);
		res.json({"InputUserid":InputUserid,"InputUserarea":InputUserarea});
		//res.json({"InputUserid:"+InputUserid+","+"InputUserarea:"+InputUserarea});
	}else{
		res.json();
	}
}

exports.getUsers = function(req,res){
	User.find({},{'hashed_password':0,'__v':0}).exec(
			function(err,users){
				res.json(users);
			}
		);
}

exports.getFoods = function(req,res){
	//用于推荐foods信息
	Food.find({},{'fooddesc':0,'foodhot':0,'foodscore':0,'__v':0}).exec(
			function(err,foods){
				res.json(foods);
			}
		);
}

exports.getFood = function(req,res){
	//获取特定用户的food
	var userid=req.params.id;
	//console.log(userid);
	Record.findOne({userid:userid}).exec(
		function(err,food){
			console.log(food);
			res.json(food);
		}
	);
}

exports.getRecords = function(req,res){
	Record.find({},{_id:0,'__v':0}).exec(
			function(err,records){
				res.json(records);
			}
		);
}

exports.userMarks = function(req,res){
	if (req.session.user) {
		var theUserid = req.session.user;//在会话中取用户id
		//获取用户评分
		Record.find().exec(
		function(err,record){
			res.json(record);
		}
	);}
}
	



