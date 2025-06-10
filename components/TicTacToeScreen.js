import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";

const emptyBoard = () => Array(3).fill(null).map(() => Array(3).fill(""));

function getAvailableMoves(board) {
  const moves = [];
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++)
      if (!board[i][j]) moves.push([i, j]);
  return moves;
}

function computerMove(board) {
  const moves = getAvailableMoves(board);
  if (moves.length === 0) return null;
  const idx = Math.floor(Math.random() * moves.length);
  return moves[idx];
}

const TicTacToeScreen = () => {
  const [board, setBoard] = useState(emptyBoard());
  const [current, setCurrent] = useState("X");
  const [winner, setWinner] = useState(null);

  const checkWinner = (b) => {
    for (let i = 0; i < 3; i++) {
      if (b[i][0] && b[i][0] === b[i][1] && b[i][1] === b[i][2]) return b[i][0];
      if (b[0][i] && b[0][i] === b[1][i] && b[1][i] === b[2][i]) return b[0][i];
    }
    if (b[0][0] && b[0][0] === b[1][1] && b[1][1] === b[2][2]) return b[0][0];
    if (b[0][2] && b[0][2] === b[1][1] && b[1][1] === b[2][0]) return b[0][2];
    if (b.flat().every((cell) => cell)) return "Neriješeno";
    return null;
  };

  const handlePress = (row, col) => {
    if (winner || board[row][col] || current !== "X") return;
    const newBoard = board.map((r, i) =>
      r.map((cell, j) => (i === row && j === col ? "X" : cell))
    );
    const win = checkWinner(newBoard);
    setBoard(newBoard);
    if (win) {
      setWinner(win);
      showEndAlert(win);
      return;
    }
    setCurrent("O");
    setTimeout(() => computerTurn(newBoard), 500);
  };

  const computerTurn = (b) => {
    const move = computerMove(b);
    if (!move) return;
    const [row, col] = move;
    const newBoard = b.map((r, i) =>
      r.map((cell, j) => (i === row && j === col ? "O" : cell))
    );
    const win = checkWinner(newBoard);
    setBoard(newBoard);
    if (win) {
      setWinner(win);
      showEndAlert(win);
      return;
    }
    setCurrent("X");
  };

  const showEndAlert = (win) => {
    setTimeout(() => {
      if (win === "Neriješeno") {
        Alert.alert("Kraj igre", "Neriješeno!");
      } else {
        Alert.alert("Kraj igre", win === "X" ? "Pobijedili ste!" : "Računalo je pobijedilo!");
      }
    }, 100);
  };

  const resetGame = () => {
    setBoard(emptyBoard());
    setCurrent("X");
    setWinner(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Križić-Kružić (vs. Računalo)</Text>
      <View style={styles.board}>
        {board.map((row, i) => (
          <View key={i} style={styles.row}>
            {row.map((cell, j) => (
              <TouchableOpacity
                key={j}
                style={styles.cell}
                onPress={() => handlePress(i, j)}
                disabled={!!cell || !!winner || current !== "X"}
              >
                <Text style={styles.cellText}>{cell}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
      {winner && (
        <Text style={styles.winnerText}>
          {winner === "Neriješeno"
            ? "Neriješeno!"
            : winner === "X"
            ? "Pobijedili ste!"
            : "Računalo je pobijedilo!"}
        </Text>
      )}
      <TouchableOpacity style={styles.resetButton} onPress={resetGame}>
        <Text style={styles.resetButtonText}>Nova igra</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
  },
  board: {
    borderWidth: 2,
    borderColor: "#333",
    backgroundColor: "#eee",
  },
  row: {
    flexDirection: "row",
  },
  cell: {
    width: 80,
    height: 80,
    borderWidth: 1,
    borderColor: "#333",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  cellText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#222",
  },
  winnerText: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 20,
    color: "#007bff",
  },
  resetButton: {
    marginTop: 30,
    padding: 12,
    backgroundColor: "#007bff",
    borderRadius: 8,
  },
  resetButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default TicTacToeScreen;