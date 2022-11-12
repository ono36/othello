import React from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";

var _squares;
var turn = 1;
var board;
class Square extends React.Component {
  render() {
    var a = "";
    if (this.props.value === 1) {
      a = "black";
    } else if (this.props.value === 2) {
      a = "white";
    }
    var css = "turn" + turn;
    if (this.props.enable) {
      css += " enable";
    }
    return (
      <div className={`square ${css}`} onClick={() => this.props.onClick()}>
        <p className={`circle ${a} turn${turn}`} />
      </div>
    );
  }
}
function reset() {
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
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    var color = turn;
    if (!check(i, color, squares)) {
      return;
    }

    check(i, color, squares, true);
    squares[i] = color;

    this.setState({
      squares: squares
    });
    turn = 3 - turn;
  }
  renderSquare(i) {
    var color = turn;
    return (
      <Square
        enable={check(i, color, this.state.squares)}
        value={this.state.squares[i]}
        key={i}
        onClick={() => this.handleClick(i)}
      />
    );
  }

  render() {
    const winner = calculateWinner(this.state.squares);
    let status;
    if (winner) {
      status = "Winner: " + winner;
    } else {
      status = "Next player: " + (turn === 1 ? "黒" : "白");
    }
    const items = [];
    for (let i = 0; i < 8 * 8; i++) {
      items.push(this.renderSquare(i));
    }
    //個数カウント

    return (
      <div>
        <div className="status">{status}</div>
        <div className="board-row">{items}</div>
        <div className="status2">黒個数:{count(1)}</div>
        <div className="status2">白個数:{count(2)}</div>
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

function calculateWinner(squares) {
  return null;
}
function check(i, color, squares, change) {
  var x = i % 8;
  var y = (i / 8) | 0;
  if (squares[i] !== 0) {
    return false;
  }

  var result = false;
  //左
  for (var ax = -1; ax < 2; ax++) {
    for (var ay = -1; ay < 2; ay++) {
      if (ax === 0 && ay === 0) {
        continue;
      }
      result |= search(x, y, ax, ay, color, squares, change);
    }
  }
  return result;
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
  for (var i = 0; 1; i++) {
    x += ax;
    y += ay;
    if (x < 0 || x >= 8 || y < 0 || y >= 8) {
      return false;
    }
    if (squares[x + y * 8] === 0) {
      return false;
    }
    if (squares[x + y * 8] === color) {
      if (i === 0) {
        return false;
      }
      if (change) {
        for (var j = 0; j < i + 1; j++) {
          squares[x + y * 8] = color;
          x -= ax;
          y -= ay;
        }
      }
      return true;
    }
  }
}

document.getElementById("reset").addEventListener("click", function () {
  reset();
});

