import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { supabase } from "../supabase";

const emptyBoard = () => Array(3).fill(null).map(() => Array(3).fill(""));

function getAvailableMoves(board) {
  const moves = [];
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++)
      if (!board[i][j]) moves.push([i, j]);
  return moves;
}

function evaluateWinner(b) {
  for (let i = 0; i < 3; i++) {
    if (b[i][0] && b[i][0] === b[i][1] && b[i][1] === b[i][2]) return b[i][0];
    if (b[0][i] && b[0][i] === b[1][i] && b[1][i] === b[2][i]) return b[0][i];
  }
  if (b[0][0] && b[0][0] === b[1][1] && b[1][1] === b[2][2]) return b[0][0];
  if (b[0][2] && b[0][2] === b[1][1] && b[1][1] === b[2][0]) return b[0][2];
  if (b.flat().every((cell) => cell)) return "Neriješeno";
  return null;
}

function minimax(board, depth, isMaximizing) {
  const winner = evaluateWinner(board);
  if (winner === "O") return { score: 10 - depth };
  if (winner === "X") return { score: depth - 10 };
  if (winner === "Neriješeno") return { score: 0 };

  const moves = getAvailableMoves(board);
  let bestMove;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (const [i, j] of moves) {
      board[i][j] = "O";
      const result = minimax(board, depth + 1, false);
      board[i][j] = "";
      if (result.score > bestScore) {
        bestScore = result.score;
        bestMove = [i, j];
      }
    }
    return { score: bestScore, move: bestMove };
  } else {
    let bestScore = Infinity;
    for (const [i, j] of moves) {
      board[i][j] = "X";
      const result = minimax(board, depth + 1, true);
      board[i][j] = "";
      if (result.score < bestScore) {
        bestScore = result.score;
        bestMove = [i, j];
      }
    }
    return { score: bestScore, move: bestMove };
  }
}

function smartComputerMove(board) {
  const { move } = minimax(board, 0, true);
  return move;
}

const TicTacToeScreen = () => {
  const [board, setBoard] = useState(emptyBoard());
  const [current, setCurrent] = useState("X");
  const [winner, setWinner] = useState(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const fetchPoints = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) return;
      const { data, error } = await supabase
        .from("profiles")
        .select("points")
        .eq("id", user.id)
        .single();
      if (data) setScore(data.points || 0);
    };
    fetchPoints();
  }, []);

  const updatePoints = async (pointsChange) => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return;
    const { data, error } = await supabase
      .from("profiles")
      .select("points")
      .eq("id", user.id)
      .single();
    if (data) {
      const newPoints = (data.points || 0) + pointsChange;
      await supabase
        .from("profiles")
        .update({ points: newPoints })
        .eq("id", user.id);
      setScore(newPoints);
    }
  };

  const handlePress = (row, col) => {
    if (winner || board[row][col] || current !== "X") return;
    const newBoard = board.map((r, i) =>
      r.map((cell, j) => (i === row && j === col ? "X" : cell))
    );
    const win = evaluateWinner(newBoard);
    setBoard(newBoard);
    if (win) {
      setWinner(win);
      if (win === "X") updatePoints(3);
      else if (win === "O") updatePoints(-1);
      showEndAlert(win);
      return;
    }
    setCurrent("O");
    setTimeout(() => computerTurn(newBoard), 500);
  };

  const computerTurn = (b) => {
    const move = smartComputerMove(b);
    if (!move) return;
    const [row, col] = move;
    const newBoard = b.map((r, i) =>
      r.map((cell, j) => (i === row && j === col ? "O" : cell))
    );
    const win = evaluateWinner(newBoard);
    setBoard(newBoard);
    if (win) {
      setWinner(win);
      if (win === "X") updatePoints(3);
      else if (win === "O") updatePoints(-1);
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
      <Text style={styles.title}>Križić-Kružić</Text>
      <Text style={styles.score}>Bodovi: {score}</Text>

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
    marginBottom: 10,
  },
  score: {
    fontSize: 22,
    marginBottom: 20,
    color: "#007BFF",
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
