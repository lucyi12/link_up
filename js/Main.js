var size = adaptDevice();
init(50,"mylegend", size, size + 200, main);
var ADD_HEIGHT = 120;//增加高度
var MINUS_WIDTH = 60;//减少宽度
/* 
* 侧边栏消除问题？新增列和行 √
* 选中图片画框？然后取消框？ √
* 判断是否连通？分类判断，主要是直连、一个拐点、两个拐点 √
* 整体是否有解？循环判断？重新洗牌？ ×
* 画线？如何确定中间拐点的坐标？ √
* 计分？消除之后计分？ √
* 进度条？倒计时设计？ √
* 音乐素材加载？ √
*/

var backLayer,loadingLayer,graphicsLayer,lineLayer,loadLayer;
var imageData = new Array();
var imageDataNums = 10;
var imageList = {};
var cols = 8;
var rows = 8;
var graphicsLayerWidth = size - MINUS_WIDTH;
var graphicsLayerHeight = graphicsLayerWidth * rows / cols;
var gridWidth,gridHeight;
var imgRandomArr = [];
var map = [];
var selectArr = [];
var point = [];
var score = 0;
// 游戏剩余时间
var TIME_SPEED = 2.5 //实际的一秒相当于游戏中的2.5
var leftTime = 60 * TIME_SPEED; //设置为60秒
var leftTimeRectWidth  = leftTime; //进度框的宽度
var timeText;
//音乐开始播放
var voiceStarted;

var middlePoint,newPoint;

function main(){

	LGlobal.webAudio = false;
	voiceStarted = false;
	//定义每一个方格宽度和高度
	gridWidth = graphicsLayerWidth / cols - 1;
	gridHeight = graphicsLayerHeight / rows - 1;
	ADD_HEIGHT = 2 * gridHeight;

	//背景层初始化
	backLayer = new LSprite();
	//在背景层上绘制黑色背景
	backLayer.graphics.drawRect(1,"#000000",[0,0,size,size + ADD_HEIGHT],true,"#C0C0C0");
	//背景显示
	addChild(backLayer);
	//图片名称获取
	imgLoad();
	//进度条读取层初始化
	loadingLayer = new LoadingSample3();
	//进度条读取层显示
	backLayer.addChild(loadingLayer);
	//利用LLoadManage类，读取所有图片，并显示进度条进程	
	LLoadManage.load(
		imageData,
		function(progress){
			loadingLayer.setProgress(progress);
		},
		gameInit
	);

	

	graphicsLayer = new LSprite();
	graphicsLayer.graphics.drawRect(0,"#000000",[0,0,graphicsLayerWidth,graphicsLayerHeight],true,"#ffffff");
	graphicsLayer.x = MINUS_WIDTH / 2;
	graphicsLayer.y = 100;
	backLayer.addChild(graphicsLayer);

}

function imgLoad(){
	for(var i = 1;i<imageDataNums+1;i++){
		imageData[i] = {name:i,path:"./images/"+i+".png"};
	}
	imageData.shift();
}

function gameInit(result){
	//取得图片读取结果
	imageList = result;
	//移除进度条层
	backLayer.removeChild(loadingLayer);
	loadingLayer = null;
	//显示游戏标题
	var title = new LTextField();
	title.text = "连连看";
	title.x = (size - title.getWidth()) / 2;
	title.y = 10;
	title.size = 20;
	title.weight = "bolder";
	title.color = "#000000";
	backLayer.addChild(title);
	//显示游戏分数
	scoreText = new LTextField();
	scoreText.text = "游戏得分 ： 0";
	scoreText.weight = "bolder";
	scoreText.x = backLayer.x + 10;
	scoreText.y = 60;
	backLayer.addChild(scoreText);

	// 游戏倒计时设置
	loadLayer = new LSprite();
	loadLayer.x = scoreText.x + scoreText.width;
	loadLayer.y = 60;
	backLayer.addChild(loadLayer);
	timeText = new LTextField();
	timeText.text = "倒计时：";
	timeText.weight = "bolder";
	loadLayer.addChild(timeText);
	

	loadLayer.addEventListener(LEvent.ENTER_FRAME, countDown);
	
	//显示图片
	drawGrid();
}

function countDown(event){
	loadLayer.graphics.clear();

	loadLayer.graphics.drawRect(1,"#000000",[timeText.getWidth() + 1,6,leftTime,10],true,"#000000");
	loadLayer.graphics.drawRect(2,"#",[timeText.getWidth() + 1, 6, leftTimeRectWidth, 10]);

	leftTime -= 0.1;
	if(IsAllRemoved()){
		loadLayer.removeEventListener(LEvent.ENTER_FRAME, countDown);
	}
	else if(leftTime <= 0){
		loadLayer.removeEventListener(LEvent.ENTER_FRAME, countDown);
		alert("时间到，游戏结束！");
	}
}

function drawGrid(){
	//获得随机数组
	getRandomArr();

	var gridX = 0;
	var gridY = 0;
	var nArr,imgNo,bitmap,imgRandomNum = 0;

	for(var i = 0;i <= rows + 1;i++){
		nArr = [];
		for(var j = 0;j <= cols + 1;j++){

			if(i == 0 || j == 0 || i == rows + 1 || j == cols + 1){
				nArr[j] = {"value":0,"bitmap":null};
				continue;
			}
			
			imgNo = imgRandomArr[imgRandomNum];
			imgRandomNum++;

			bitmap = new LBitmap(new LBitmapData(imageList[imgNo]));
			bitmap.scaleX =  gridWidth / imageList[imgNo].width;
			bitmap.scaleY = gridHeight / imageList[imgNo].height;
			bitmap.x = gridX;
			bitmap.y = gridY;

			graphicsLayer.graphics.drawRect(0.5,"black",[gridX,gridY,gridWidth,gridHeight]);
	
			var btn = new LButton(bitmap,bitmap);
			btn.name = imgNo;
			btn.row = i;
			btn.col = j;
			graphicsLayer.addChild(btn);
			btn.addEventListener(LMouseEvent.MOUSE_UP,onclick);

			gridX = gridX + gridWidth + 1;

			nArr[j] = {"value":imgNo,"bitmap":bitmap};
		}
		if(i != 0 && i != rows + 1){
			gridX = 0;
			gridY = gridY + gridHeight + 1;
		}
		map[i] = nArr;
	}
}

function getRandomArr(){

	var imgArr = [];
	var imgArrNums = rows * cols / 2;

	for(var i = 0,j = 0,num = 1;i < imgArrNums;i++,j += 2,num++){
		if(num == imageList.length){
			num = 1 + Math.floor(Math.random()*imageDataNums);
		}
		imgArr[j] = num;
		imgArr[j+1] = num;
	}
	
	var randomArrOne = new Array(imgArr.length);
	for(var i=0;i<randomArrOne.length;i++){
		randomArrOne[i] = i;
	}

	var randomArrTwo = new Array(imgArr.length);
	for(var j=0; j<randomArrTwo.length;j++){
		randomArrTwo[j] = randomArrOne.splice(Math.floor(Math.random()*randomArrOne.length),1);
	}

	var randomArrThree = new Array(imgArr.length);
	for(var k=0;k<randomArrThree.length;k++){
		randomArrThree[k] = imgArr[randomArrTwo[k]];
	}

	imgRandomArr = randomArrThree;
}

function onclick(event,display){
	if(!voiceStarted){
		voiceStarted = true;
		var myAuto = document.getElementById('bgMusic');
		myAuto.load();
		myAuto.play();
	}
	if(leftTime <= 0){
		alert('游戏已结束!');
		return ;
	}
	if(selectArr.length == 0){
		if(lineLayer != null){
			backLayer.removeChild(lineLayer);
		}
		lineLayer = new LSprite();
		lineLayer.x = (LGlobal.width - graphicsLayerWidth) / 2;
		lineLayer.y = 100;
		backLayer.addChild(lineLayer);

		selectArr[0] = {"name":display.name,"row":display.row,"col":display.col};

		lineLayer.graphics.drawRect(2,"red",[display.bitmap_up.x,display.bitmap_up.y,gridWidth,gridHeight]);

		point[0] = (display.col - 1) * (gridWidth + 1) + gridWidth/2;
		point[1] = (display.row - 1) * (gridHeight + 1) + gridHeight/2; 
		
	}else{

		point[2] = (display.col - 1) * (gridWidth + 1) + gridWidth/2;
		point[3] = (display.row - 1) * (gridHeight + 1) + gridHeight/2; 

		var tempArr = {"name":display.name,"row":display.row,"col":display.col};

		if(JSON.stringify(selectArr[0]) != JSON.stringify(tempArr)){
			selectArr[1] = tempArr;
			if(selectArr[0]["name"] == selectArr[1]["name"]){

				console.log("两个点分别为： ",selectArr)
				lineLayer.graphics.drawRect(2,"red",[display.bitmap_up.x,display.bitmap_up.y,gridWidth,gridHeight]);
				
				if(findPath(selectArr[0],selectArr[1])){

					console.log("直接连通 ");
					lineLayer.graphics.drawLine(2,"yellow",point);

					removeIcon();
					score += 1;

				}else if(findPathWithOneCorner(selectArr[0],selectArr[1])){

					console.log("一个拐点 ",middlePoint);
					point[4] = (middlePoint.col - 1) * (gridWidth + 1) + gridWidth/2;
					point[5] = (middlePoint.row - 1) * (gridHeight + 1) + gridHeight/2;
					lineLayer.graphics.drawLine(2,"yellow",[point[0],point[1],point[4],point[5]]);
					lineLayer.graphics.drawLine(2,"yellow",[point[4],point[5],point[2],point[3]]);

					removeIcon();
					score += 2;
				}else if(findPathWithTwoCorner(selectArr[0],selectArr[1])){

					console.log("两个拐点 ",newPoint,middlePoint);
					point[6] = (newPoint.col - 1) * (gridWidth + 1) + gridWidth/2;
					point[7] = (newPoint.row - 1) * (gridHeight + 1) + gridHeight/2;
					point[8] = (middlePoint.col - 1) * (gridWidth + 1) + gridWidth/2;
					point[9] = (middlePoint.row - 1) * (gridHeight + 1) + gridHeight/2;
					lineLayer.graphics.drawLine(2,"yellow",[point[0],point[1],point[6],point[7]]);
					lineLayer.graphics.drawLine(2,"yellow",[point[6],point[7],point[8],point[9]]);
					lineLayer.graphics.drawLine(2,"yellow",[point[8],point[9],point[2],point[3]]);

					removeIcon();
					score += 3;
				}
			}
		}

		setTimeout(function(){
			backLayer.removeChild(lineLayer);
		},500); 

		scoreText.text = "游戏得分 ： " + score;
	
		selectArr = [];
		
	}
}

function findPath(first,second){

	var minCol,maxCol,minRow,maxRow;

	if(first.row == second.row){
		var row = first.row;
		minCol = first.col < second.col ? first.col : second.col;
		maxCol = first.col > second.col ? first.col : second.col;
		for(var i = minCol + 1;i < maxCol;i++){
			if(map[row][i]["value"] != 0){
				return false;
			}
		}
		return true;
	}

	if(first.col == second.col){
		var col = first.col;
		minRow = first.row < second.row ? first.row : second.row;
		maxRow = first.row > second.row ? first.row : second.row;
		for(var i = minRow + 1;i < maxRow;i++){
			if(map[i][col]["value"] != 0){
				return false;
			}
		}
		return true;
	}

	return false;
}

function findPathWithOneCorner(first,second){

	if(map[first.row][second.col]["value"] == 0){
		middlePoint = {"name":0,"row":first.row,"col":second.col};
		if(findPath(first,middlePoint) && findPath(middlePoint,second)){
			return true;
		}
	}

	if(map[second.row][first.col]["value"] == 0){
		middlePoint = {"name":0,"row":second.row,"col":first.col};
		if(findPath(first,middlePoint) && findPath(middlePoint,second)){
			return true;
		}
	}

	return false;
}


function findPathWithTwoCorner(first,second){

	if(first.col != 0){
		for(var i = first.col - 1;i >= 0;i--){
			newPoint = {"name":0,"row":first.row,"col":i};
			if(map[newPoint.row][newPoint.col]["value"] == 0){
				if(findPathWithOneCorner(newPoint,second)){
					return true;
				}
			}else{
				break;
			}
		}
	}

	if(first.col != cols + 1){
		for(var i = first.col + 1;i <= cols + 1;i++){
			newPoint = {"name":0,"row":first.row,"col":i};
			if(map[newPoint.row][newPoint.col]["value"] == 0){
				if(findPathWithOneCorner(newPoint,second)){
					return true;
				}
			}else{
				break;
			}
		}
	}

	if(first.row != 0){
		for(var i = first.row - 1;i >= 0;i--){
			newPoint = {"name":0,"row":i,"col":first.col};
			if(map[newPoint.row][newPoint.col]["value"] == 0){
				if(findPathWithOneCorner(newPoint,second)){
					return true;
				}
			}else{
				break;
			}
		}
	}

	if(first.row != rows + 1){
		for(var i = first.row + 1;i <= rows + 1;i++){
			newPoint = {"name":0,"row":i,"col":first.col};
			if(map[newPoint.row][newPoint.col]["value"] == 0){
				if(findPathWithOneCorner(newPoint,second)){
					return true;
				}
			}else{
				break;
			}
		}
	}

	return false;
}

function removeIcon(){
	var firstRow = selectArr[0].row;
	var firstCol = selectArr[0].col;
	
	map[firstRow][firstCol]["value"] = 0;
	map[firstRow][firstCol]["bitmap"].bitmapData = null;
	
	var secondRow = selectArr[1].row;
	var secondCol = selectArr[1].col;
	
	map[secondRow][secondCol]["value"] = 0;
	map[secondRow][secondCol]["bitmap"].bitmapData = null;

	setTimeout(function(){
		if(IsAllRemoved()){
			alert("恭喜你, 成功完成游戏！");
		}
	},1000); 
}

function IsAllRemoved(){
	for(var i = 1;i <= rows; i++){
		for(var j = 1;j <= cols; j++){
			if(map[i][j]["bitmap"].bitmapData != null){
				return false;
			}
		}
	}
	return true;
}

function resetGame(){
	
}

function adaptDevice(){
	var d1 = document.getElementById("mylegend");
	var size = 0;
	var width = 0;
	var height = 0;
	if(LGlobal.os == "pc"){
		var doc = document.documentElement;
		width = doc.clientWidth;
		height = doc.clientHeight;	
	}
	else
	{
		width = window.screen.width;
		height = window.screen.height;
	}
	size = width > height ? height : width;
	d1.setAttribute("style","margin-left:"+((width - size) / 2)+"px");
	return size;
}