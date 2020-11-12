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
      .map(el => "." + el)
      .join(", ");
  }

  const updateCommentary = (playerObj, result) => {
    const headerCenter = document.querySelector(".header__center");

    headerCenter.textContent = "";
    if (result == "draw") {
      utility.createTextBox(headerCenter, "h1", "", `It's a Draw`);
    } else if (result == "win") {
      utility.createTextBox(headerCenter, "h1", "", `Winner: ${playerObj.name}`);
    } else {
      utility.createTextBox(headerCenter, "h1", "", `Turn: ${playerObj.name}`);
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
  let _boardStatus;

  const _setDefaultVariables = () => {
    _activePlayer = "";
    _winningPlayer = "";
    _boardStatus = {
      "0": "",
      "1": "",
      "2": "",
      "3": "",
      "4": "",
      "5": "",
      "6": "",
      "7": "",
      "8": ""
    };
  };

  const _initVariables = (() => {
    _setDefaultVariables();
    Object.preventExtensions(_players);
    Object.preventExtensions(_boardStatus);
  })();

  const createPlayer = (playerID, name, icon) => {
    _players[playerID] = {name, icon};
  };

  const startGame = (playerID) => {
    if (_activePlayer) {
      displayController.clearBoard();
      _setDefaultVariables();
    };

    _playeridCheck(playerID) ? 
      _activePlayer = playerID:
      _activePlayer = _chooseRandomPlayer();

    displayController.updateCommentary(_players[_activePlayer]);

    return _players[_activePlayer];
  };

  const _chooseRandomPlayer = () => {
    return ["playerOne", "playerTwo"][Math.round(Math.random())];
  };

  const _playeridCheck = (playerID) => {
    playerID === "playerOne" || playerID === "playerTwo" ? true : false;
  };

  const playMove = (gridID) => {
    if (_winningPlayer || _checkDraw()) {
      splashController.generateEndGamePage();
    } else if (!_boardStatus[gridID] && !_winningPlayer) {
      _boardStatus[gridID] = _activePlayer;
      displayController.displayMove(gridID, _players[_activePlayer].icon);
      
      if (!_checkWin(gridID, _activePlayer) && !_checkDraw()) {
        _switchActivePlayer();
        displayController.updateCommentary(_players[_activePlayer]);
      }
    };
  };

  const _switchActivePlayer = () => {
    _activePlayer === "playerOne" ?
      _activePlayer = "playerTwo":
      _activePlayer = "playerOne";
  }
  
  const _returnWinningCombinations = (searchParameters, playerID) => {
    const winArray = [];
    
    searchParameters.forEach(string => {
      const DOMelementArray = Array.from(document.querySelectorAll(`.${string}`));
      
      const isWin = DOMelementArray.every(el => {
        return playerID == _boardStatus[el.id];
      });
      
      if (isWin) {
        winArray.push(string);
      };
    });
    
    return winArray;
  }

  const _checkWin = (gridID, playerID) => {
    const combinations = utility.returnCombinations(gridID).split(" ");
    const winningCombinations = _returnWinningCombinations(combinations, playerID);

    if (winningCombinations.length) {
      _winningPlayer = _activePlayer;
      displayController.displayWinningGrids(winningCombinations);
      displayController.updateCommentary(_players[_winningPlayer], "win");
      return true;
    };
  }

  const _checkDraw = () => {
    const boardValues = Object.values(_boardStatus);
    const isBoardFull = boardValues.every(el => el);

    if (!_winningPlayer && isBoardFull) {
      displayController.updateCommentary(null, "draw");
      return true;
    }
  }
  
  return {
    createPlayer, 
    startGame, 
    playMove,
    _checkDraw,
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
    formContainer.textContent = "Enter your names:";
  
    utility.createTypedInput(formContainer, "X", "text");
    utility.createTypedInput(formContainer, "O", "text");
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
    
    const challengeButton = utility.createButton(welcomeContainer, "welcome__button", "button", "Challenge Computer");
    // twoPlayerButton.addEventListener("click", () => _generateTwoPlayerForm());
    
    canvas.appendChild(welcomeContainer);
  }

  const generateGameStartPage = () => {
    const startingPlayer = gameController.startGame();
    const name = startingPlayer.name;
    const icon = startingPlayer.icon;
    const canvas = _generateCanvas();

    const startContainer = document.createElement("div");
    startContainer.setAttribute("class", "start");
    startContainer.addEventListener("click", () => _clearCanvas());

    utility.createTextBox(startContainer, "h1", "start__icon", icon);
    utility.createTextBox(startContainer, "h2", "start__name", `${name} moves first`);

    canvas.appendChild(startContainer);
  }

  const _submitNewGame = (e) => {
    e.preventDefault();
    const nameOne = e.target.elements["O"].value;
    const nameTwo = e.target.elements["X"].value;

    gameController.createPlayer("playerOne", nameOne, "O");
    gameController.createPlayer("playerTwo", nameTwo, "X");
    generateGameStartPage();
  }

  const _clearCanvas = () => {
    const targetCanvas = document.querySelectorAll(".canvas");
    targetCanvas.forEach((el) => {
      el.remove();
    })
  }

  const generateEndGamePage = () => {
    const canvas = _generateCanvas();

    const endContainer = document.createElement("div");
    endContainer.setAttribute("class", "end");

    utility.createTextBox(endContainer, "h2", "end__text", "Replay with:");
    const newPlayersButton = utility.createButton(endContainer, "end__button", "button", "New Players");
    newPlayersButton.addEventListener("click", () => generateWelcome());
    const samePlayersButton = utility.createButton(endContainer, "end__button", "button", "Same Players");
    samePlayersButton.addEventListener("click", () => generateGameStartPage());

    canvas.appendChild(endContainer);
    _body.appendChild(canvas);
  }

  // const _capitalizeFirstChar = (str) => {
  //   return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  // }

  generateWelcome();

  return {
    generateWelcome,
    generateGameStartPage,
    generateEndGamePage,
  }
})();
