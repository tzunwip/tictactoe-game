const utility = (() => {
  const createTextBox = (parent, type, classes, text) => {
    const newBox = document.createElement(type);
    newBox.setAttribute("class", classes);
    newBox.textContent = text;
    parent.appendChild(newBox);
    return newBox;
  }

  const createTypedInput = (parent, name, type) => {
    const inputContainer = document.createElement("div");
    inputContainer.setAttribute("class", `form__input ${name}__container`);
  
    const inputLabel = document.createElement("div");
    inputLabel.setAttribute("class", "input__label");
    inputLabel.setAttribute("for", `input__${name}`);
    inputLabel.textContent = name;
    inputContainer.appendChild(inputLabel);
  
    const inputField = document.createElement("input");
    inputField.setAttribute("class", `input__field`);
    inputField.setAttribute("id", `input__${name}`);
    inputField.setAttribute("name", `${name}`);
    inputField.setAttribute("type", `${type}`);
    inputField.setAttribute("required", "");
    inputContainer.appendChild(inputField);
  
    parent.appendChild(inputContainer);
  }

  const createButton = (parent, classes, type, text) => {
    const newButton = document.createElement("button");
    newButton.setAttribute("class", classes);
    newButton.setAttribute("type", type);
    newButton.textContent = text;
    parent.appendChild(newButton);
    return newButton;
  }
    
  const _returnDiagonal = (gridID) => {
    return gridID == 0 || gridID == 8 ? " diagonal0":
    gridID == 2 || gridID == 6 ? " diagonal1":
    gridID == 4 ? " diagonal0 diagonal1":
    "";
  }
  
  const _returnRow = (gridID) => {
    return Math.floor((gridID / 9) * 3);
  }
  
  const _returnColumn = (gridID) => {
    return gridID % 3;
  }
  
  const returnCombinations = (gridID) => {
    const column = _returnColumn(gridID);
    const row = _returnRow(gridID);
    const diagonal = _returnDiagonal(gridID);
    
    return `column${column} row${row}${diagonal}`
  }

  return {
    createTextBox,
    createTypedInput,
    createButton,
    returnCombinations,
  }
})();

const displayController = (() => {
  const _body = document.querySelector("body");

  const _generateBar = (parent, name, subElements) => {
    const container = document.createElement("div");
    container.setAttribute("class", `${name}container`);

    const mainElement = document.createElement("div");
    mainElement.setAttribute("class", name);

    subElements.forEach((str) => {
      const div = document.createElement("div");
      div.setAttribute("class", `${name}__${str}`);
      mainElement.appendChild(div);
    });

    container.appendChild(mainElement);
    parent.appendChild(container);
  };

  const _generateMain = (parent) => {
    const container = document.createElement("div");
    container.setAttribute("class", "maincontainer");
    parent.appendChild(container);
  }

  const _generateBoard = () => {
    const main = document.querySelector(".maincontainer");
    const boardContainer = document.createElement("div");
    boardContainer.setAttribute("class", "board");
    
    for (let i = 0; i < 9; i++) {
      const boardGrid = document.createElement("div");
      boardGrid.setAttribute("class", `board__grid ${utility.returnCombinations(i)}`);
      boardGrid.setAttribute("id", `${i}`);
      boardGrid.addEventListener("click", () => {
        gameController.playMove(boardGrid.id);
      });
      boardContainer.appendChild(boardGrid);
    };
    
    main.appendChild(boardContainer);
  };
  
  const clearBoard = () => {
    const board = document.querySelectorAll(".board__grid div");
    board.forEach((obj) => obj.textContent = "");

    clearWinningGrids();
  }

  const _populateHeaderFooter = () => {
    const headerCenter = document.querySelector(".header__center");
    const headerTitle = document.createElement("h1");
    headerTitle.setAttribute("class", "header__title");
    headerTitle.textContent = "Tic Tac Toe";
    headerCenter.appendChild(headerTitle);

    const footerCenter = document.querySelector(".footer__center");
    const footerGithub = document.createElement("a");
    footerGithub.setAttribute("class", "icon footer__github");
    footerGithub.href = "http://github.com/tzunwip/tictactoe-game";
    const githubIcon = document.createElement("i");
    githubIcon.setAttribute("class", "fab fa-github");
    footerGithub.appendChild(githubIcon);
    footerCenter.appendChild(footerGithub);
  }

  const displayMove = (gridID, icon) => {
    const targetGrid = document.getElementById(gridID);
    const iconDiv = document.createElement("div");
    iconDiv.textContent = icon;
    targetGrid.appendChild(iconDiv);
  }

  const displayWinningGrids = (winningClasses) => {
    const searchString = _convertArraytoClasses(winningClasses);
    const winningGrids = document.querySelectorAll(searchString);

    winningGrids.forEach((el) => {
      el.classList.toggle("board__grid--win");
    })
  }

  const clearWinningGrids = () => {
    const grids = document.querySelectorAll(".board__grid--win");

    grids.forEach((el) => {
      el.classList.toggle("board__grid--win");
    })
  }

  const _convertArraytoClasses = (array) => {
    return array
      .map(el => `.${el}`)
      .join(", ");
  }

  const updateCommentary = (playerObj, result) => {
    const headerCenter = document.querySelector(".header__center");
    const name = playerObj.name;

    headerCenter.textContent = "";
    if (result == "draw") {
      utility.createTextBox(headerCenter, "h3", "", `It's a Draw`);
    } else if (result == "win") {
      utility.createTextBox(headerCenter, "h3", "", name == "You" ? "You win" : `${name} wins`);
    } else {
      utility.createTextBox(headerCenter, "h3", "", name == "You" ? "Your turn" : `${name}'s turn`);
    }
  };

  _generateBar(
    _body,
    "header",
    ["left", "center", "right"]
    );
  _generateMain(_body);
  _generateBar(
    _body,
    "footer",
    ["left", "center", "right"]
    );
  _populateHeaderFooter();
  _generateBoard();

  return {
    clearBoard, 
    displayMove,
    displayWinningGrids,
    updateCommentary,
  };
})();

const gameController = (() => {
  const _players = {playerOne: {}, playerTwo: {}};
  let _activePlayer;
  let _winningPlayer;
  let boardStatus = {};

  const _setDefaultVariables = () => {
    _activePlayer = "";
    _winningPlayer = "";
    for (let i = 0; i < 9; i++) {
      boardStatus[i] = "";
    }
  };

  const createPlayer = (playerID, name, icon, isComputer) => {
    _players[playerID] = {name, icon, isComputer};
  };

  const startGame = (playerID) => {
    displayController.clearBoard();
    _setDefaultVariables();

    if (playerID) {
      _activePlayer = playerID;
      if (_players[_activePlayer].isComputer) {
        _playBotMove();
      };
    } else {
      _activePlayer = _chooseRandomPlayer();
      splashController.generateRandomStartPage(_players[_activePlayer], _playBotMove);
    };

    displayController.updateCommentary(_players[_activePlayer]);
  };

  const _chooseRandomPlayer = () => {
    return ["playerOne", "playerTwo"][Math.round(Math.random())];
  };

  const playMove = (gridID) => {
    if (_winningPlayer || _checkDraw()) {
      splashController.generateEndGamePage(_players.playerOne.name, _players.playerTwo.name);
    } else if (!boardStatus[gridID]) {
      boardStatus[gridID] = _activePlayer;
      displayController.displayMove(gridID, _players[_activePlayer].icon);
      
      if (!checkWin(gridID, _activePlayer, true) && !_checkDraw()) {
        _switchActivePlayer();
        displayController.updateCommentary(_players[_activePlayer]);
        if (_players[_activePlayer].isComputer) {
          _playBotMove();
        }
      }
    };
  };

  const _playBotMove = () => {
    playMove(bot.getBestMove(boardStatus, _activePlayer, _players[_activePlayer].name));
  }

  const _switchActivePlayer = () => {
    _activePlayer === "playerOne" ?
      _activePlayer = "playerTwo":
      _activePlayer = "playerOne";
  }
  
  const _returnWinningCombinations = (searchRowColDiag, playerID) => {
    const winArray = [];
    
    searchRowColDiag.forEach(string => {
      const DOMelementArray = Array.from(document.querySelectorAll(`.${string}`));
      
      const isWin = DOMelementArray.every(el => {
        return playerID == boardStatus[el.id];
      });
      
      if (isWin) {
        winArray.push(string);
      };
    });
    
    return winArray;
  }

  const checkWin = (gridID, playerID, display) => {
    const combinations = utility.returnCombinations(gridID).split(" ");
    const winningCombinations = _returnWinningCombinations(combinations, playerID);

    if (winningCombinations.length) {
      if (display) {
        _winningPlayer = _activePlayer;
        displayController.displayWinningGrids(winningCombinations);
        displayController.updateCommentary(_players[_winningPlayer], "win");
      }

      return winningCombinations
    };

  }

  const _checkDraw = () => {
    const boardValues = Object.values(boardStatus);
    const isBoardFull = boardValues.every(el => el);

    if (!_winningPlayer && isBoardFull) {
      displayController.updateCommentary({}, "draw");
      return true;
    }
  }
  
  return {
    createPlayer, 
    startGame, 
    playMove,
    checkWin,
    boardStatus,
  };
})();

const splashController = (() => {
  const _body = document.querySelector("body");

  const _generateCanvas = () => {
    const canvas = document.querySelector(".canvas");

    if (canvas) {
      canvas.textContent = "";
      return canvas;
    } else {
      const newCanvas = document.createElement("div");
      newCanvas.setAttribute("class", "canvas");
      _body.appendChild(newCanvas);
      return newCanvas;
    }
  }

  const _createFormControls = (parent) => {
    const buttonContainer = document.createElement("div");
    buttonContainer.setAttribute("class", `form__control control__container`);
  
    const submitButton = utility.createButton(buttonContainer, "form__button form__submit", "submit", "Play");
    const backButton = utility.createButton(buttonContainer, "form__button form__back", "button", "Back");
    backButton.addEventListener("click", () => generateWelcome());
  
    parent.appendChild(buttonContainer);
  }

  const _generateTwoPlayerForm = () => {
    const canvas = _generateCanvas();
    
    const formContainer = document.createElement("form");
    formContainer.setAttribute("class", "form");
    formContainer.setAttribute("id", "newGameForm");
    formContainer.setAttribute("autocomplete", "off");
    formContainer.addEventListener("submit", (e) => _submitNewGame(e));
  
    utility.createTextBox(formContainer, "h3", "", "Enter your names:");
    utility.createTypedInput(formContainer, "O", "text");
    utility.createTypedInput(formContainer, "X", "text");
    _createFormControls(formContainer);
  
    canvas.appendChild(formContainer);
    _body.appendChild(canvas);
  }

  const generateWelcome = () => {
    const canvas = _generateCanvas();
    const welcomeContainer = document.createElement("div");
    const titleContainer = document.createElement("div");

    welcomeContainer.setAttribute("class", "welcome");
    
    titleContainer.setAttribute("class", "welcome__titlecontainer")
    const titleText = utility.createTextBox(titleContainer, "h1", "welcome__title", "Let's Play Tic-tac-toe!");
    welcomeContainer.appendChild(titleContainer);
    
    const twoPlayerButton = utility.createButton(welcomeContainer, "welcome__button", "button", "Two Player Game");
    twoPlayerButton.addEventListener("click", () => _generateTwoPlayerForm());
    
    const challengeMinimaxButton = utility.createButton(welcomeContainer, "welcome__button", "button", "Challenge Minimax");
    challengeMinimaxButton.addEventListener("click", () => {
      gameController.createPlayer("playerOne", "You", "X", false);
      gameController.createPlayer("playerTwo", "Minimax", "O", true);
      _generateStartChoicePage("You", "Minimax");
    });

    const challengeAlphaBetaButton = utility.createButton(welcomeContainer, "welcome__button", "button", "Challenge alphaBeta");
    challengeAlphaBetaButton.addEventListener("click", () => {
      gameController.createPlayer("playerOne", "You", "X", false);
      gameController.createPlayer("playerTwo", "alphaBeta", "O", true);
      _generateStartChoicePage("You", "alphaBeta");
    });
    
    canvas.appendChild(welcomeContainer);
  }

  const _generateStartChoicePage = (playerOne, playerTwo) => {
    const canvas = _generateCanvas();
    const container = document.createElement("div");
    container.setAttribute("class", "startchoice");

    const title = utility.createTextBox(container, "h3", "startchoice__title", "Choose first mover:");
    const playerOneButton = utility.createButton(container, "startchoice__button", "button", `${playerOne}`);
    const playerTwoButton = utility.createButton(container, "startchoice__button", "button", `${playerTwo}`);
    const randomPlayerButton = utility.createButton(container, "startchoice__button", "button", "Random");

    playerOneButton.addEventListener("click", () => {
      gameController.startGame("playerOne");
      _clearCanvas();
    });
    playerTwoButton.addEventListener("click", () => {
      _clearCanvas();
      gameController.startGame("playerTwo");
    });
    randomPlayerButton.addEventListener("click", () => gameController.startGame());

    canvas.appendChild(container);
    _body.appendChild(canvas);
  }

  const generateRandomStartPage = (activePlayerObj, getBestMoveCallback) => {
    const canvas = _generateCanvas();

    const startContainer = document.createElement("div");
    startContainer.setAttribute("class", "start");
    startContainer.addEventListener("click", () => {
      _clearCanvas()
      if (activePlayerObj.isComputer) {
        getBestMoveCallback();
      }
    });

    utility.createTextBox(startContainer, "h1", "start__icon", activePlayerObj.icon);
    if (activePlayerObj.name == "You") {
      utility.createTextBox(startContainer, "h2", "start__name", "You move first");
    } else {
      utility.createTextBox(startContainer, "h2", "start__name", `${activePlayerObj.name} moves first`);
    };

    canvas.appendChild(startContainer);
  }

  const _submitNewGame = (e) => {
    e.preventDefault();
    const nameOne = e.target.elements["O"].value;
    const nameTwo = e.target.elements["X"].value;

    gameController.createPlayer("playerOne", nameOne, "O", false);
    gameController.createPlayer("playerTwo", nameTwo, "X", false);
    _generateStartChoicePage(nameOne, nameTwo);
  }

  const _clearCanvas = () => {
    const targetCanvas = document.querySelectorAll(".canvas");
    targetCanvas.forEach((el) => {
      el.remove();
    })
  }

  const generateEndGamePage = (playerOne, playerTwo) => {
    const canvas = _generateCanvas();

    const endContainer = document.createElement("div");
    endContainer.setAttribute("class", "end");

    utility.createTextBox(endContainer, "h2", "end__text", "Replay with:");
    const newPlayersButton = utility.createButton(endContainer, "end__button", "button", "New Players");
    newPlayersButton.addEventListener("click", () => generateWelcome());
    const samePlayersButton = utility.createButton(endContainer, "end__button", "button", "Same Players");
    samePlayersButton.addEventListener("click", () => _generateStartChoicePage(playerOne, playerTwo));

    canvas.appendChild(endContainer);
    _body.appendChild(canvas);
  }

  generateWelcome();

  return {
    generateWelcome,
    generateRandomStartPage,
    generateEndGamePage,
  }
})();

const bot = (() => {
  const _winLines = [
    [0,1,2],
    [3,4,5],
    [6,7,8],
    [0,3,6],
    [1,4,7],
    [2,5,8],
    [0,4,8],
    [2,4,6],
  ];

  const _getAvailable = (board) => {
    const emptyArray = [];

    for (let i = 0; i < 9; i++) {
      if (!board[i]) {emptyArray.push(i)}
    };

    return emptyArray
  }

  const _getOccupied = (board, playerID) => {
    const occupiedGrids = [];

    for (let i = 0; i < board.length; i++) {
      if (board[i] == playerID) {occupiedGrids.push(i)};
    }

    return occupiedGrids
  }

  const _winCheck = (board, playerID) => {
    const occupiedGrids = _getOccupied(board, playerID);

    return _winLines.some((array) => {
      return array.every((num) => {
        return occupiedGrids.includes(num);
      });
    })
  }

  const _drawCheck = (board) => {
    return board.every((el) => el)
  }

  const getBestMove = (currentBoard, activePlayer, botName) => {
    let newBoard = Object.values(currentBoard);

    if (botName === "Minimax") {
      return _minimax(newBoard, 0, activePlayer).id
    } else {
      return _alphaBeta(newBoard, 0, activePlayer, -Infinity, Infinity).id;
    };
  }

  const _minimax = (board, depth = 0, activePlayer) => {
    if (_winCheck(board, "playerOne")) {
      return {value: 10 - depth};
    } else if (_winCheck(board, "playerTwo")) {
      return {value: -10 + depth};
    } else if (_drawCheck(board)) {
      return {value: 0};
    };

    let availableMoves = _getAvailable(board);

    if (activePlayer == "playerOne") {
      let maxValue = -Infinity;
      let maxMove = {};

      for (let i = 0; i < availableMoves.length; i++) {
        let currentMove = {};
        currentMove.id = availableMoves[i];
        board[availableMoves[i]] = activePlayer;

        currentMove.value = _minimax(board, depth + 1, "playerTwo").value;
        
        if (currentMove.value > maxValue) {
          maxValue = currentMove.value;
          maxMove = currentMove;
        }
        board[availableMoves[i]] = "";
      }
      return maxMove
    } else {
      let minValue = Infinity;
      let minMove = {};

      for (let i = 0; i < availableMoves.length; i++) {
        let currentMove = {};
        currentMove.id = availableMoves[i];
        board[availableMoves[i]] = activePlayer;

        currentMove.value = _minimax(board, depth + 1, "playerOne").value;

        if (currentMove.value < minValue) {
          minValue = currentMove.value;
          minMove = currentMove;
        }
        board[availableMoves[i]] = "";
      }
      return minMove
    }
  }

  const _alphaBeta = (board, depth = 0, activePlayer, alpha, beta) => {
    if (_winCheck(board, "playerOne")) {
      return {value: 10};
    } else if (_winCheck(board, "playerTwo")) {
      return {value: -10};
    } else if (_drawCheck(board)) {
      return {value: 0};
    };

    let availableMoves = _getAvailable(board);

    if (activePlayer == "playerOne") {
      let maxValue = -Infinity;
      let maxMove = {};

      for (let i = 0; i < availableMoves.length; i++) {
        let currentMove = {};
        currentMove.id = availableMoves[i];
        board[availableMoves[i]] = activePlayer;

        currentMove.value = _alphaBeta(board, depth + 1, "playerTwo", alpha, beta).value;
        
        if (currentMove.value > maxValue) {
          maxValue = currentMove.value;
          maxMove = currentMove;
        }
        alpha = Math.max(alpha, maxMove.value);
        board[availableMoves[i]] = "";
        if (beta <= alpha) {
          break
        }
      }
      return maxMove
    } else {
      let minValue = Infinity;
      let minMove = {};

      for (let i = 0; i < availableMoves.length; i++) {
        let currentMove = {};
        currentMove.id = availableMoves[i];
        board[availableMoves[i]] = activePlayer;

        currentMove.value = _alphaBeta(board, depth + 1, "playerOne", alpha, beta).value;

        if (currentMove.value < minValue) {
          minValue = currentMove.value;
          minMove = currentMove;
        }
        beta = Math.min(beta, minMove.value);
        board[availableMoves[i]] = "";
        if (beta <= alpha) {
          break
        }
      }
      return minMove
    }
  }

  return {
    getBestMove,
  }
})();