import React, { useState, useEffect } from 'react';
import { StyleSheet, BackHandler, Modal, TouchableWithoutFeedback, Text, View, AppState, TouchableOpacity, Alert, TextInput, Button } from 'react-native';
//import { io, Socket } from 'socket.io-client';
import Overlay from './OverlayComponent';
//import {WebSocket} from 'react-native'

const BOARD_SIZE = 8;
const CELL_SIZE = 50;
const TOKEN_SIZE = CELL_SIZE * 0.8;
const COLORS = {
  BACKGROUND: '#F0D9B5',// `¡™£¢∞§¶•ªº–≠œ∑´®†¥¨ˆøπ“‘«åß∂ƒ©˙∆˚¬…æ≈ç√∫˜µ≤≥÷
  CELL_DARK: '#8B4513',
  CELL_LIGHT: '#CD853F',
  SELECTED: '#FFD700',
  JUMP_INDICATOR: '#008000',
  EXIT_GAME_BUTTON: 'grey',
};
const CheckerBoard = () => {
  const [board, setBoard] = useState(Array(BOARD_SIZE).fill(Array(BOARD_SIZE).fill(null)));
  const [currentPlayer, setCurrentPlayer] = useState('black');
  const [selectedToken, setSelectedToken] = useState(null);
  const [possibleMoves, setPossibleMoves] = useState([]);
  const [playersString, setPlayersString] = useState('');
  const [message, setMessage] = useState('');
  const [messageReceived, setMessageReceived] = useState('');
  const [isOverlayVisible, setIsOverlayVisible] = useState(true);
  const [isNameEntered, setIsNameEntered] = useState(true);
  const [jumpIndicators, setJumpIndicators] = useState([]);
  const [killedString,setKilledString]=useState('');
  //const [killedStringShow,setKilledStringShow]=useState('');
  const [countBlack, setCountBlack] = useState(0);
  const [countWhite, setCountWhite] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [id, setId] = useState(null);
  const [name, setName] = useState('');
  const [socket, setSocket] = useState(null)
  //const serverUrl = 'http://192.168.0.110:9254'; // Replace with your server's IP address and port
  //this.Socket = io(serverUrl,{transports:['websocket']});

  // Initialize the WebSocket connection
  const initializeSocket = () => {
    if (socket === null) {
      const soc = new WebSocket('ws://192.168.206.32:9254')
      setSocket(soc);
      return;
    }
    return
  };
  initializeSocket();

  const sendMessage = (msg) => {
    if (isConnected && msg !== null) {
      // if(id==='0'){
      //   socket.send('black:'+msg);
      // }else if(id==='1'){
      //   socket.send('white:'+msg);
      // }else{
      //   socket.send('Spectator:'+msg);
      // }
      socket.send(name + ':' + msg)
      setMessage('')
    }
  }

  // Handle events on the socket
  useEffect(() => {
    initializeBoard();
    socket.onopen = () => {
      console.log('Connected to server');
      setIsConnected(true)
    };

    socket.onmessage = (event) => {
      // Assuming the received data is a string
      const receivedData = event.data;
      console.log('Received data:', receivedData);
      if (receivedData === "0" || receivedData === "1") {
        console.log("id:" + receivedData)
        setId(receivedData)
      } else if (receivedData === "black" || receivedData === "white") {
        setCurrentPlayer(receivedData)
      } else if (receivedData === "Player_02_Joined") {
        setIsOverlayVisible(false)
      } else if (receivedData.includes(':')) {
        setMessage('')
        setMessageReceived(receivedData)
      } else if(receivedData.includes(',') && !receivedData.includes("[[")){
        setKilledString(receivedData)
      } else if (receivedData.includes("[[")) {
        console.log("list as new board:" + receivedData)
        const arr = JSON.parse(receivedData)
        setBoard(arr)
        let blackCount = 0;
        let whiteCount = 0;

        for (let i = 0; i < arr.length; i++) {
          const row = arr[i];
          for (let j = 0; j < row.length; j++) {
            if (row[j] === "black"||row[j]==="red") {
              blackCount++;
            } else if (row[j] === "white"||row[j]==="green") {
              whiteCount++;
            }
          }
        }

        console.log("Number of 'black' occurrences:", blackCount);
        console.log("Number of 'white' occurrences:", whiteCount);

        if(blackCount===0){
          Alert.alert('Winner', 'White Win\'s', [
            {
              text: 'Exit',
              onPress: () => {socket.close();BackHandler.exitApp()},
              style: 'cancel',
            },
            {text: 'OK', onPress: () => console.log('OK Pressed')},
          ]);
          socket.send('close')
        }else if(whiteCount===0){
          Alert.alert('Winner', 'Black Win\'s', [
            {
              text: 'Exit',
              onPress: () => {socket.close();BackHandler.exitApp()},
              style: 'cancel',
            },
            {text: 'OK', onPress: () => console.log('OK Pressed')},
          ]);
          socket.send('close')
        }
      } else if (receivedData.includes("has")) {
        setPlayersString(receivedData)
      } else if(receivedData.includes('wins')){
        Alert.alert('Winner', receivedData, [
          {
            text: 'Exit',
            onPress: () => {socket.close();BackHandler.exitApp()},
            style: 'cancel',
          },
          {text: 'OK', onPress: () => console.log('OK Pressed')},
        ]);
      }
    };

    socket.onclose = (event) => {
      const { code, reason, wasClean } = event;
      console.log('Disconnected from server');
    };

    return () => {
      socket.close();
    };
  }, []);

  const initializeBoard = () => {
    const newBoard = Array(BOARD_SIZE).fill(null).map((_, row) => {
      if ((row < 3 || row > 4)) {
        return Array(BOARD_SIZE).fill(null).map((_, col) => {
          return (row < 3 && ((col % 2 !== 0 && row % 2 !== 1) || (col % 2 === 0 && row % 2 === 1))) ? 'white' : (row > 3 && ((col % 2 !== 0 && row % 2 !== 1) || (col % 2 === 0 && row % 2 === 1))) ? 'black' : null
        });
      }
      return Array(BOARD_SIZE).fill(null);
    });
    setBoard(newBoard);
    setCurrentPlayer('black');
    setSelectedToken(null);
    setPossibleMoves([]);
  };

  const handleTokenPress = (row, col) => {
    const selectedToken = board[row][col];
    if (selectedToken === null) {
      // If there is no token in the selected cell, do nothing
      return;
    }
    //if (isConnected) {
      if (((selectedToken === "black"||selectedToken === "red") && id === "1") || ((selectedToken === "white"||selectedToken === "green") && id === "0") || id === null) {
        return;
      }
    //}

    if (currentPlayer === 'black') {
      if ((selectedToken !== currentPlayer && (selectedToken !== 'red'))) {
        // If the selected token is not of the current player, do nothing
        return;
      }
    } else {
      if ((selectedToken !== currentPlayer && (selectedToken !== 'green'))) {
        // If the selected token is not of the current player, do nothing
        return;
      }
    }

    const possibleMoves = getAvailableMoves(board, currentPlayer, row, col);

    if (possibleMoves.length === 0) {
      // If there are no available moves for the selected token, do nothing
      return;
    }

    setSelectedToken({ row, col });
    setPossibleMoves(possibleMoves);
  };

  const handleCellPress = (row, col) => {
    if (selectedToken === null) {
      // If there is no selected token, do nothing
      return;
    }

    const validMove = possibleMoves.find(move => move.row === row && move.col === col);

    if (!validMove) {
      // If the selected cell is not a valid move, do nothing
      return;
    }

    const newBoard = [...board];
    const checkCell = newBoard[selectedToken.row][selectedToken.col];
    newBoard[selectedToken.row][selectedToken.col] = null;
    newBoard[row][col] = checkCell;

    if (row === 0 && currentPlayer === 'black') {
      newBoard[row][col] = 'red'
      setBoard(newBoard)
    }

    if (row === 7 && currentPlayer === 'white') {
      newBoard[row][col] = 'green'
      setBoard(newBoard)
    }
    if (validMove.jump) {
      // If the move is a jump, remove the jumped token
      const jumpedRow = (selectedToken.row + row) / 2;
      const jumpedCol = (selectedToken.col + col) / 2;

      if(!socket.isConnected){
        if (newBoard[jumpedRow][jumpedCol] === 'white' || newBoard[jumpedRow][jumpedCol] === 'green') {
          setCountBlack(countBlack + 1);
          //alert("Black:"+countBlack)
          if (countBlack === 11) {
            alert("Black Win's")
          }
        } else {
          setCountWhite(countWhite + 1);
          //alert("White:"+countWhite)
          if (countWhite === 11) {
            alert("White Win's")
          }
        }
      }
      const killed=((newBoard[jumpedRow][jumpedCol])+',');
      //setKilledString(newBoard[jumpedRow][jumpedCol]);
      socket.send(killed);
      newBoard[jumpedRow][jumpedCol] = null;

      // Check if there are any more jumps available for the same token
      const moreJumps = getAvailableJumps(newBoard, currentPlayer, row, col);

      if (moreJumps.length > 0) {
        // If there are more jumps available for the same token, update the selected token and possible moves
        setSelectedToken({ row, col });
        setPossibleMoves(moreJumps);
      }
      else {
        // Otherwise, switch to the next player
        setSelectedToken(null);
        setPossibleMoves([]);
        if (isConnected) {
          const nBoard = JSON.stringify(newBoard)
          socket.send(nBoard)
          socket.send(currentPlayer === 'black' ? 'white' : 'black')
          setId(id)
          setName(name)
        } else {
          setCurrentPlayer(currentPlayer === 'black' ? 'white' : 'black');
          setBoard(newBoard)
        }
      }
    } else {
      // If the move is not a jump, switch to the next player
      setSelectedToken(null);
      setPossibleMoves([]);
      if (isConnected) {
        const nBoard = JSON.stringify(newBoard)
        socket.send(nBoard)
        socket.send(currentPlayer === 'black' ? 'white' : 'black')
        setId(id)
        setName(name)
      } else {
        setCurrentPlayer(currentPlayer === 'black' ? 'white' : 'black');
        setBoard(newBoard)
      }
    }
    //setBoard(newBoard);
  };

  const getAvailableMoves = (board, player, row, col) => {
    const moves = [];

    const checkMove = (r, c) => {
      if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) {
        // If the cell is out of bounds, do nothing
        return;
      }

      const cell = board[r][c];
      //alert(cell)
      if (cell === null) {
        // If the cell is empty, it's a valid move
        moves.push({ row: r, col: c });
      } else if (cell !== player && ((cell !== 'red' && player === 'black') || (cell !== 'green' && player === 'white'))) {
        // If the cell has an opponent's token, check if a jump is possible
        const jumpRow = r + (r - row);
        const jumpCol = c + (c - col);
        if (jumpRow >= 0 && jumpRow < BOARD_SIZE && jumpCol >= 0 && jumpCol < BOARD_SIZE && board[jumpRow][jumpCol] === null) {
          moves.push({ row: jumpRow, col: jumpCol, jump: true });
        }

      }
    };

    if (player === 'black' || board[row][col] === 'black' || board[row][col] === 'red') {
      // If the player is black or the token is black, check moves downwards
      checkMove(row - 1, col - 1);
      checkMove(row - 1, col + 1);
      if (board[row][col] === 'red') {
        // If the token is a king, check moves upwards as well
        checkMove(row + 1, col - 1);
        checkMove(row + 1, col + 1);
      }
    }

    if (player === 'white' || board[row][col] === 'white' || board[row][col] === 'green') {
      // If the player is white or the token is white, check moves upwards
      checkMove(row + 1, col - 1);
      checkMove(row + 1, col + 1);

      if (board[row][col] === 'green') {
        // If the token is a king, check moves downwards as well
        checkMove(row - 1, col - 1);
        checkMove(row - 1, col + 1);
      }
    }

    return moves;
  };

  const getAvailableJumps = (board, player, row, col) => {
    const jumps = [];

    const checkJump = (r, c, dr, dc) => {
      const jumpRow = r + dr;
      const jumpCol = c + dc;
      const landingRow = r + dr * 2;
      const landingCol = c + dc * 2;

      if (landingRow < 0 || landingRow >= BOARD_SIZE || landingCol < 0 || landingCol >= BOARD_SIZE || board[landingRow][landingCol] !== null) {
        // If the landing cell is out of bounds or not empty, do nothing
        return;
      }

      const cell = board[jumpRow][jumpCol];

      if (cell === null) {
        // If the cell has no token, it's not a jump
        return;
      } else if (cell === player || (cell === 'red' && player === 'black') || (cell === 'green' && player === 'white')) {
        // If the cell has the player's own token, do nothing
        return;
      } else {
        // Otherwise, add the jump to the list of available jumps
        jumps.push({ row: landingRow, col: landingCol, jump: true });
      }
    };

    if (player === 'black' || board[row][col] === 'black' || board[row][col] === 'red') {
      // If the player is black or the token is black, check jumps downwards
      checkJump(row, col, -1, -1);
      checkJump(row, col, -1, 1);

      if (board[row][col] === 'red' && player === 'black') {
        // If the token is a king, check jumps upwards as well
        checkJump(row, col, 1, -1);
        checkJump(row, col, 1, 1);
      }
    }

    if (player === 'white' || board[row][col] === 'white' || board[row][col] === 'green') {
      // If the player is white or the token is white, check jumps upwards
      checkJump(row, col, 1, -1);
      checkJump(row, col, 1, 1);

      if (board[row][col] === 'green' && player === 'white') {
        // If the token is a king, check jumps downwards as well
        checkJump(row, col, -1, -1);
        checkJump(row, col, -1, 1);
      }
    }

    return jumps;
  };

  const renderToken = (row, col) => {
    const token = board[row][col];
    if (token === null) {
      return null;
    }

    return (
      <TouchableWithoutFeedback onPress={() => handleTokenPress(row, col)}>
        <View style={styles.tokenContainer}>
          <View style={col % 2 == 1 && row % 2 == 0 ? [styles.token, { backgroundColor: token }] : col % 2 == 0 && row % 2 == 1 ? [styles.token, { backgroundColor: token }] : styles.token} />
        </View>
      </TouchableWithoutFeedback>
    );
  };

  const renderCell = (row, col) => {
    const backgroundColor = (row + col) % 2 === 0 ? COLORS.CELL_LIGHT : COLORS.CELL_DARK;
    const possibleMove = possibleMoves.find(move => move.row === row && move.col === col);

    if (possibleMove) {
      return (
        <TouchableWithoutFeedback onPress={() => handleCellPress(row, col)}>
          <View style={[styles.cell, { backgroundColor: COLORS.HIGHLIGHT_SQUARE }]}>
            {possibleMove.jump && <View style={styles.jumpIndicator} />}
          </View>
        </TouchableWithoutFeedback>
      );
    } else {
      return (
        <View style={[styles.cell, { backgroundColor }]}>
          {renderToken(row, col)}
        </View>
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.message}>{playersString}</Text>
      <Text style={styles.message}>{killedString}</Text>
      <Modal
        visible={isNameEntered}
        transparent
        animationType="fade"
        onRequestClose={() => setIsNameEntered(false)}
      >
        <View style={styles.overlayContainer}>
          <View style={styles.overlayContent}>
            <TextInput
              placeholder='Enter Your Name'
              value={name}
              onChangeText={text => setName(text)}
            />
            <Button title='Enter' onPress={() => {
              const p = (id === "0") ? 'black' : 'white';
              if(id === "0" || id === "1"){
                socket.send(name + ' has ' + p)
              }
              //setPlayersString(name+' has '+p)
              setIsNameEntered(false)
            }} />
          </View>
        </View>
      </Modal>
      <View style={styles.board}>
        {board.map((row, rowIndex) => (
          <View style={styles.row} key={rowIndex}>
            {row.map((cell, colIndex) => (
              <View style={styles.col} key={colIndex}>
                {renderCell(rowIndex, colIndex)}
              </View>
            ))}
          </View>
        ))}
      </View>
      <Text style={styles.currentPlayer}>{currentPlayer === 'black' ? 'Black turn' : 'White turn'}</Text>
      <Text style={styles.message}>{messageReceived}</Text>
      {/* <TouchableOpacity style={styles.newGameButton} onPress={handleNewGame}>
        <Text style={styles.newGameButtonText}>New Game</Text>
      </TouchableOpacity> */}
      <View>
        <TextInput
          placeholder="Type your message"
          value={message}
          onChangeText={text => setMessage(text)}
        />
        <Button title='Send' onPress={() => { sendMessage(message) }} />
      </View>
      <TouchableOpacity style={styles.exitButton} onPress={() => {
        socket.close();
        BackHandler.exitApp()
      }}>
        <Text style={styles.exitButtonText}>Exit</Text>
      </TouchableOpacity>
      <Overlay check={(id !== null) ? isOverlayVisible : false} />
    </View>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
  },
  board: {
    flexDirection: 'column',
  },
  row: {
    flexDirection: 'row',
  },
  col: {
    width: CELL_SIZE,
    height: CELL_SIZE,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tokenContainer: {
    width: TOKEN_SIZE,
    height: TOKEN_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  token: {
    width: TOKEN_SIZE * 0.8,
    height: TOKEN_SIZE * 0.8,
    borderRadius: TOKEN_SIZE * 0.4,
  },
  jumpIndicator: {
    width: CELL_SIZE * 0.2,
    height: CELL_SIZE * 0.2,
    borderRadius: CELL_SIZE * 0.1,
    backgroundColor: COLORS.JUMP_INDICATOR,
    position: 'absolute',
    top: CELL_SIZE * 0.1,
    left: CELL_SIZE * 0.1,
  },
  currentPlayer: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  message: {
    color: 'black',
    fontSize: 16,
    marginVertical: 10,
  },
  exitButton: {
    backgroundColor: COLORS.EXIT_GAME_BUTTON,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 10,
  },
  exitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  overlayContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // Semi-transparent background
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
  },
});

export default CheckerBoard;
