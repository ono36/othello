import React from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";

var _squares;
var turn = 1;
var total_turn = 0;
var mode = 2;
var board;
var winner=0;
var before=-1;
var interval=0;

class Square extends React.Component {
  render() {
    var a = "";
    if (this.props.value === 1) {
      a = "black";
    } else if (this.props.value === 2) {
      a = "white";
    }
    var css = "turn" + turn;
    if ((mode == 0 ||  turn == 1) ){
		//人のターンならマーカー表示
		if (this.props.enable) {
		  css += " enable";
		}
    }
	if (this.props.before) {
		  css += " before";
	}
	var score=board.evaluation(this.props.idx,turn,_squares);
	if (!this.props.enable) {
		score="";
	}
	var color="black;"
    if (turn === 2) {
     color= "white";
    }
    return (
      <div className={`square ${css}`} onClick={() => this.props.onClick()}>
        <p className={`cellstatus ${color}`}>{score}</p>
        <p className={`circle ${a} turn${turn}`} />
      </div>
    );
  }
}
function reset() {
	before=-1;
	   winner=0;
  var combo = document.getElementById("mode");
  mode = parseInt(combo.value);

  _squares.fill(0);
  _squares[8 * 3 + 3] = 1;
  _squares[8 * 4 + 4] = 1;
  _squares[8 * 3 + 4] = 2;
  _squares[8 * 4 + 3] = 2;
  turn = 1;
  board.forceUpdate();
}
class Board extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      squares: Array(8 * 8).fill(0)
    };

    _squares = this.state.squares;
    board = this;
    reset();
  }
  
  handleClick(i) {
    const squares = this.state.squares;
    if ( squares[i]) {
      return;
    }
    var color = turn;
    if (!check(i, color, squares)) {
		//置けないなら無視
      return;
    }

    if (mode != 0 && turn == 2){
		//CPUのターンなら無視
    	return;
    }
	this.put(i);

  }
  put(i){
	  interval=1;
//	  window.setTimeout(()=>{
//			  interval=0;
//  board.forceUpdate();
//			  },1000);
	  total_turn++;
    var color = turn;
	before=i;
	var squares = this.state.squares;
    check(i, color, squares, true);
    squares[i] = color;

    this.setState({
      squares: squares
    });

	//次置けるかチェック
	var enable=false;
    for (let i = 0; i < 8 * 8; i++) {
      if(check(i,3-turn,this.state.squares)){
		  enable=true;
		  break;
	  }
    }
  var combo = document.getElementById("mode");
  mode = parseInt(combo.value);

	//置ける場合はターン交代する
	if(enable){
		//ターン交代
		turn = 3 - turn;
	}else{
		//置ける場合はターン交代しない

		//再度置けるかチェック
		enable=false;
		for (let i = 0; i < 8 * 8; i++) {
		  if(check(i,turn,this.state.squares)){
			  enable=true;
			  break;
		  }
		}

		if(!enable){
			//置けない場合は終了
			window.setTimeout(this.end,100);
		}
	}
    if (mode != 0 && turn == 2){
		//CPUのターンならCPU呼ぶ
		window.setTimeout(()=>{this.cpu()},1000);
    	return;
    }
  }

  //全ての手を評価
  evaluation(i,turn,_squares){
	  var count=check(i,turn,_squares);
		var test_squares =_squares.concat();
    var color = turn;
     check(i, color, test_squares, true);
	color = 3 - turn;
	var te = 0;
	for (let j = 0; j < 8 * 8; j++) {
    	var cnt = check(j, color, test_squares);
	  if(cnt){
		  te++;
	  }
	}

	  var kado = this.kado(i);
	  var time = total_turn/64;
	  var kado_ratio = 0;
	  var count_ratio = 0;
	  var te_ratio= 0;
	  var etc = 0;

	  switch(mode){
	 case 1:
		 etc = (Math.random()*64|0);
		 break;
	 case 2:
		 count_ratio = -1;
		 break;
	 case 3:
		 count_ratio = 1;
		 break;
	 case 4:
		 count_ratio = 1;
		 kado_ratio = 10;
		 break;
	 case 5:
		 if(time<0.5){
		 	count_ratio = -1;
		}else{
		 	count_ratio = 1;
		}
		 kado_ratio = 1;
		 break;
	 case 6:
		 te_ratio=-1;
		 break;
	  }
	count = count * count_ratio
		+ kado * kado_ratio
		+ te * te_ratio 
		+ etc;

	  return count|0;
  }
  //角かどうか判定
  kado(i){
	  if(i===0 || i===7 || i === 8*7 || i=== 8*7+7){
		  return 1;
	  }
	  return 0;
  }
  cpu(){
	 var enables=[];
	for (let i = 0; i < 8 * 8; i++) {
      var cnt = check(i, turn, _squares);
	  if(!cnt)continue;
	  var count=this.evaluation(i,turn,_squares);
	  enables.push({pos:i,count:count});
	}
	enables.sort((a,b)=>{
			return b.count-a.count;
			});
	var target=enables[0].pos;
	this.put(target);
  }
  end(){
       var black=count(1);
       var white=count(2);
	   var msg="引き分け";
	   if(black<white){
		   msg="白の勝ち";
		   winner=2;
	   }
	   if(white<black){
		   msg="黒の勝ち";
		   winner=1;
	   }
		alert(msg);
  		board.forceUpdate();
  }
  renderSquare(i) {
    var color = turn;
    return (
      <Square
        enable={check(i, color, this.state.squares)}
        before={i==before}
        value={this.state.squares[i]}
        idx={i}
        onClick={() => this.handleClick(i)}
      />
    );
  }

  render() {
    let status;
    if (winner) {
      status = "Winner: "  + (winner === 1 ? "黒" : "白");
    } else {
      status = "Next player: " + (turn === 1 ? "黒" : "白");
    }
    const items = [];
    for (let i = 0; i < 8 * 8; i++) {
      var square =this.renderSquare(i);
      items.push(square);
    }
    //個数カウント

    return (
      <div>
        <div className="status">{status}</div>
        <div className="board-row">{items}</div>
        <div className="status2">黒個数:{count(1)}</div>
        <div className="status2">白個数:{count(2)}</div>
        <div className="status2">総ターン数:{total_turn}</div>
      </div>
    );
  }
}

class Game extends React.Component {
  render() {
    return (
      <div className="game">
        <div className="game-board">
          <Board />
        </div>
        <div className="game-info">
          <div>{/* status */}</div>
          <ol>{/* TODO */}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);


//置ける場所かどうか判定(change=true)で実際に置く)
function check(i, color, squares, change) {
  var x = i % 8;
  var y = (i / 8) | 0;
  if (squares[i] !== 0) {
    return 0;
  }

  var count=0;
  //左
  for (var ax = -1; ax < 2; ax++) {
    for (var ay = -1; ay < 2; ay++) {
      if (ax === 0 && ay === 0) {
        continue;
      }
      var result =  search(x, y, ax, ay, color, squares, change);
	  count+=result;
    }
  }
  return count;
}

function count(color) {
  if (!_squares) {
    return 0;
  }
  var num = 0;
  for (var i = 0; i < 8 * 8; i++) {
    if (_squares[i] === color) {
      num++;
    }
  }
  return num;
}
function search(x, y, ax, ay, color, squares, change) {
	var count=0;
  for (var i = 0; 1; i++) {
    x += ax;
    y += ay;
    if (x < 0 || x >= 8 || y < 0 || y >= 8) {
		break;
    }
    if (squares[x + y * 8] === 0) {
		break;
    }
    if (squares[x + y * 8] === color) {
      if (i === 0) {
		  break;
      }
      if (change) {
        for (var j = 0; j < i + 1; j++) {
          squares[x + y * 8] = color;
          x -= ax;
          y -= ay;
        }
      }
	  return i;
    }
  }
  return 0;
}

document.getElementById("reset").addEventListener("click", function () {
  reset();
});

