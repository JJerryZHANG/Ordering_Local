#My_proj

- controllers
	- foods_controller.js
	- orders_controller.js
	- users_controller.js
- models
	- foods_model.js
	- orders_model.js
	- users_model.js
- node_modeules
	- body-parser
	- connect-mongo
	- cookie-parser
	- crypto
	- ejs
	- express
	- express-session
	- mongoose
	- ng-file-upload
- static
	- imgs
	- js
		- menuctrl.js
		- confirmctrl.js
		- orderctrl.js
		- orderadminctrl.js
		- userctrl.js
	- lib
		- checklist-model.js
		- ng-file-upload-all.min.js
- views
	- login.html
	- signup.html
	- index.html
	- user.html
	- order.html
	- menuuser.html
	- menuadmin.html
	- foodadmin.html
- package.json
- README.md
- routes.js
- server.js

功能介绍：

用户：
	主页：显示热门菜
	登陆：登陆后跳转至用户中心界面
	注册：提供用户账号，密码信息
	点菜：勾选菜品完成预订，在用户还有尚未付款的订单时无法进行预订
	个人中心：查看当前预订菜单

管理员：
	登陆:登陆后跳转至菜单管理界面。
	订单管理:查看所有用户当前订单，用户付款完成可以删除菜单。
			页面每隔5秒自动刷新页面
	菜单管理:添加、更新、删除菜品。
			完成操作后页面刷新。

数据分析：
	用户完成订单后，会copy一份到record表（永久保存用于数据分析）

user(_id,username,hashed_password);
food(_id,foodname,foodimg,foodprice,fooddesc,foodhot);
order(_id,userid,username,foods,total,timestamp，status);

8.18 update:
在food表增加foodhot属性，用于向用户做热门推荐显示于首页z

8.19 update:
1、在order表中增加status属性，用于显示用于是否已经（评分／付款）－－ok
未付款显示为0，已付款显示为1，已付款并且已评分显示2 －－ok
2、当status显示为0时，用户未付款，用户不能订新的订单 －－ok
3、当用户付款后，该订单会集合到管理界面的另一个位置（已付款订单），
   已付款订单显示是否评分，管理员可以自己决定是否删除一定间隔天数的已付款订单
4、已付款订单的所有food信息将传送到user个人中心，用户可以评分，
   评分结果传送到record数据库
5、在food中增加foodscore属性，默认为0，当用户点单时，被隐藏在点单页面，order提交后，一同添加到order表中


* 增加完成付款后，用户对点的菜的满意度
* 利用基于物品的协同过滤算法推荐菜品

9.18 update:
1、用户信息增加 用户性别，用户年龄，用户区域
2、食品信息增加 食品类型，食品区域
3、菜单增加分类，汤类，甜食类，主食类等
4、增加新用户登陆，根据其区域信息从热门数组中匹配食品推荐

9.20 update:
首页显示当前未付款用户数量（即当前就餐用户数量）
当就餐用户达到limited值时，用户仍然可以点单，但无法入座（订单放入一个wait数组中，status设置为4）
假定limited为30，用户X为第31个用户，此时他在首页看到了需要等待的提示，但仍然进入点单页面点单。
此时在点击order按钮后，在传入数据库前会获取当前未付款用户及等待用户数量（status为未付款的有30就放入wait数组）
进入订单页面后，获取wait数组及当前用户id，查询该用户id在wait数组中的位置，显示该用户需要等待的人数，在用户个人中心查看自己的状态。（当用户在30以下时是显示就餐中），在管理界面，等待用户单独一览，并且有一个按钮，点击确认入座（用户个人中心显示用户可以入座，但需管理员确认入座后方能真正入座（此时订单状态显示为未付款））

9.21 update:
index: 当前等待人数，当前就座人数
user: 用户当前状态（排队中，入座中），（若排队中同时显示 前面还需等待的人数）（若不需要等待，显示就座）
confirm: 在用户点完单后（若需要等待，显示还需等待人数）（若无需等待，显示可入座）

管理员：限定订单数30
｛当前满员 即30个user状态为0，5个user状态为4，此时一个人pay了，29个状态为0，找到第一个状态为4的设置为－1说明对于当前用户有位置可以入座，等待1min未置状态为0（由管理员点击置为0）则删除该订单｝

用户状态说明：
0 入座未付款 
1 已付款未评分（设置1day未评分删除）
2 已付款且已评分，删除该订单记录

4 排队状态中
－1 有空余位置可以入座（管理员点击确认入座后置为0）－－无需排队的用户的起初状态

order后
用户不需要排队（eating的用户"0" + available的用户"－1" + 排队用户"4" < 5）
status置为"-1"
管理员界面 显示available用户队列［A，B，C］，当点击“入座”按钮后status置为0（表示入座了）
此时avaialbe［B，C］，eating［A］，waiting［］

用户需要排队（eating的用户"0" + available的用户"－1" + 排队用户"4" > = 5）
status 置为"4"
管理员界面显示 eatng用户队列［A，B，C］ available用户队列［D，E］，waiting队列［F，G］
当管理员点击D“入座”按钮后，eatng用户队列［A，B，C，D］，available［E］，waiting［F，G］
当管理员点击E“入座”按钮后，eating用户队列［A，B，C，D，E］,available[],waiting[F,G]
当管理员点击C“付款”按钮后，waiting列表中的第一个用户自动进入available队列
	eating［A,B,D,E］,available[F] ,waiting[G]

当用户在排队和有座位时可以选择取消订单（在入座之前，餐厅都不会开始做菜，所以可以取消）
当用户用餐未付款时是无法取消订单的。

9.22 update
当用户用餐中 “取消订单按钮” 消失
实现点单菜单分页

菜的类别：甜点 酒水 冷菜 荤菜 蔬菜 ＋ 主食（米饭／面条）

 i_______________________________
u	|	|	|	|	|	|	|	|
|___|___|___|___|___|___|___|___|
|	|	|
|___|___|
|	|	|
|___|___|
|	|	
|___|
|	|
|___|

row: i 表示菜品
col: u 表示用户

uij 表示用户u对菜品j的评分
（评分为0-10，0表示没点过该菜，10表示非常喜欢这个菜）

美团推荐算法：
http://tech.meituan.com/mt-recommend-practice.html

推荐算法综述：
https://buildingrecommenders.wordpress.com/

itemCF算法：
http://blog.163.com/xyk_5366/blog/static/6872333820133254428278

Bug: Route.get() requires callback functions but got a [object Undefined]


* 完成预定后，菜品被点次数会有计数
* 附加根据用户信息推荐菜品
	热门推荐
	相似推荐
* 附加用户对较好的菜品的打分，供其他用户参考
* 附加等待时间（当前用户人数）

－－协同过滤理解：

1
step1:收集用户偏好
step2:找到相似的用户／物品
step3:计算推荐

1.1 收集用户偏好
采用评分获取用户偏好

收集了用户行为数据，我们还需要对数据进行一定的预处理，其中最核心的工作就是：减噪和归一化。
（即评分是0-10，则将每个评分除以10，取值为0-1）

进行的预处理后，根据不同应用的行为分析方法，可以选择分组或者加权处理，之后我们可以得到一个用户偏好的二维矩阵，一维是用户列表，另一维是物品列表，值是用户对物品的偏好，一般是 [0,1] 或者 [-1, 1] 的浮点数值。

1.2 找到相似的用户／物品

1.3 计算推荐

UserCF: 基于用户对物品的偏好找到相邻的邻居用户，然后将邻居用户喜欢的item推荐给用户
		计算：将一个用户对所有物品的偏好作为一个向量来计算用户之间的相似度
		（A用户对a,b,c物品的评分，B用户对a,b,c的评分，计算向量）
		找出K邻居，根据邻居相似度权重及对物品的偏好（先找出最相似的用户，再在最相似的用户中排列出最偏好的物品，选出其中在A用户选过的中没有的）

ItemCF: 基于用户对物品的偏好找到相似的物品，然后根据用户的历史偏好，推荐相似的物品给他
		计算：就是将所有用户对某个物品的偏好作为一个向量来计算物品之间的相似度
		（A,B,C用户对a物品的评分，A,B,C用户对b物品的评分，计算向量）
		得到物品的相似物品后，根据用户历史的偏好预测当前用户还没有表示偏好的物品（先确定A用户点过的food，然后找出最喜爱的food，然后找出这个最喜爱的food的最相似的food，然后选出其中没买过的）

 Item CF 从性能和复杂度上比 User CF 更优，其中的一个主要原因就是对于一个在线网站，用户的数量往往大大超过物品的数量，同时物品的数据相对稳定，因此计算物品的相似度不但计算量较小，同时也不必频繁更新（因此选择ItemCF较优）

item 评分表：
 
_|A B C D E F	
a 3 4 0 0 0 1
b 0 2 3 0 0 1
c 2 4 0 0 0 0
d 1 1 1 1 0 0

以item a,b为例 
a向量为	(3,4,0,0,0,1)
b向量为	(0,2,3,0,0,1)

查找出所有a的id開頭的數組：[foodid,userid,score]
起初獲取的a數組有[a,A,3],[a,F,1],[a,B,4]
這樣C,D,E的評分均為0

設定一個多維數組 U(user)*I(item)
[
(flen 行)
[foodid,userid,score][][][][][][][][][][][](ulen 列)
[][][][][][][][][][][][]
[][][][][][][][][][][][]
]



//如果数据的顺序很重要，就用数组，否则就用对象。
//在Javascript语言中，关联数组就是对象，对象就是关联数组,
//在php中，关联数组也是数组
//JavaScript中的数组是一个类数组的对象，虽然在性能上比真正的数组会慢，但它使用起来更方便。
/*
JS数组的特点
数组大小可以动态变化。 部分编程语言（如java),创建数组时，必须要明确指定数组的大小（length),存储元素时，超出 数组的大小会出异常，而JS不是这样的，数组定义时不需要指定数组大小（指定了也没什么用），存储元素时不用考虑到数组的大小以及下表值。

数组中可以存储不同类型的元素。 java语言，数组只能存储同一种类型的元素，要不全部是int、要不全部是String，而JS中的数组不是这样的，一个数组中可以同时存储int和String。

数组元素不是存储在一段连续的内存集合。 java语言，创建数组时，会根据数组的定义分配一段连续的内存用来存储元素，而JS中不是这样的，它的元素可能存储在不连续的内存区。
*/

性能優化：
每创建一个函数对象是需要大批量空间的,所以在一个循环中创建函数是很不明智的，尽量将函数移动到循环之前创建

相似度数组（正方形）
[
//横向foodid
[0,0][0,1][...][...][...]
[1,0][1,1][1,2][...][...]
[...][2,1][2,2][...][...]
[...][...][...][3,3][...]
[...][...][...][...][4,4]
//竖向foodid
]

//只显示mark值:（一个数组）
//find({'mark':{'$elemMatch':{'foodid':'57b58e870ead242d214741ba'}}},{'mark':1,'_id':0})

＊＊＊任何要在回调函数执行完后才执行的代码，都需要在回调函数里调用。

网站逻辑：

User：用户名，密码 ＋（性别，年龄，地区）
Food：图片，名称，价格，描述，热度，菜系，辣度，菜类，特别推荐对象

login － signup 
	  － index

signup － login
	   － index

index － user
	  － login
	  － logout
	  － signup
	  － order

menuadmin － foodadmin
		  － record

index页面 可随意登录，当
			登录用户为空时 仅推荐热门
			登录用户为新用户（未评分用户）推荐个人信息相关及热门
			登录用户为老用户 推荐个人信息相关，热门及个性化推荐

当用户是以游客身份登录时，无“点单” “注销” “个人中心”出现，有登录按钮及注册按钮

当用户未点单时，个人中心，仅显示个人信息及 “当前无未付款订单”，“当前无未评分菜单”
增加: "返回" "点单"按钮

用户在提交订单后，可以查看当前已经点的菜单（无修改作用，只做确认）
若用户订单已付款，无法进入页面。

点单页面增加忌口输入，文本形式， 显示在订单信息中（增加忌口栏）

点单不得为空

梳理：

获取当前用户订单信息 /order/info

1 menuuser 页面
2 user 页面

select 设置默认值（当前无作用，需debug）
点击评分后 隐藏评分框
addorder 有问题

//应对异步编程
promise
async
step

https://getbootstrap.com/examples/theme/#

https://docs.mongodb.com/manual/applications/data-models/ 

how to use UML for MongoDB











