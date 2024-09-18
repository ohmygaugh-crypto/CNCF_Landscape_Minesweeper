// define the game grid dimensions and the number of mines as regular variables
let WIDTH = 8;
let HEIGHT = 8;
let NUM_MINES = 10;

/* add the gameOver variable here */
let gameOver = false;
let gameOverElement = document.getElementById("game-over");

/* add the minesLeft variable here and initialize it to the total number of mines */
let minesLeft = NUM_MINES;
/* add the minesLeftElement variable here and initialize it to null */
let minesLeftElement = null;
let firstMove = true;
let timer = 0;
let timerElement = null;
let timerID = null;

// define a function to reveal a cell
function reveal(x, y) {
  if (grid[x][y].isFlagged || grid[x][y].isRevealed || gameOver) {
    return;
  }

  grid[x][y].isRevealed = true;

  // Update the cell element to remove the background image
  const cellElement = document.querySelector(
    `.grid .cell:nth-child(${y * WIDTH + x + 1})`
  );
  cellElement.classList.remove("hidden");
  cellElement.classList.add("revealed");
  cellElement.style.backgroundImage = "none";

  if (firstMove && !gameOver) {
    firstMove = false;
    if (grid[x][y].isMine) {
      let freeCells = [];
      for (let i = 0; i < WIDTH; i++) {
        for (let j = 0; j < HEIGHT; j++) {
          if (!grid[i][j].isMine) {
            freeCells.push({ x: i, y: j });
          }
        }
      }

      let newLocation = freeCells[Math.floor(Math.random() * freeCells.length)];
      grid[x][y].isMine = false;
      grid[newLocation.x][newLocation.y].isMine = true;

      // Recalculate surrounding mine counts
      for (let i = 0; i < WIDTH; i++) {
        for (let j = 0; j < HEIGHT; j++) {
          grid[i][j].surroundingMines = 0;
          for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
              if (
                i + dx >= 0 &&
                i + dx < WIDTH &&
                j + dy >= 0 &&
                j + dy < HEIGHT
              ) {
                if (grid[i + dx][j + dy].isMine) {
                  grid[i][j].surroundingMines++;
                }
              }
            }
          }
        }
      }
    }

    // Start the timer
    timerID = setInterval(() => {
      timer++;
      render(gridElement);
    }, 1000);
  }

  if (grid[x][y].isMine) {
    gameOver = true;

    /* create and display the "Game Over" message */
    displayGameOverMessage();

    // Clear the timer interval
    clearInterval(timerID);

    return;
  }

  let remaining = 0;
  for (let x = 0; x < WIDTH; x++) {
    for (let y = 0; y < HEIGHT; y++) {
      if (!grid[x][y].isRevealed && !grid[x][y].isFlagged) {
        remaining++;
      }
    }
  }

  if (remaining === 0 && !gameOver) {
    gameOver = true;

    /* create and display the "All clear!" message */
    displayAllClearMessage();

    // Clear the timer interval
    clearInterval(timerID);
  }

  if (grid[x][y].surroundingMines === 0) {
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (x + dx >= 0 && x + dx < WIDTH && y + dy >= 0 && y + dy < HEIGHT) {
          reveal(x + dx, y + dy);
        }
      }
    }
  }
}

// define a function to flag a cell
function flag(x, y) {
  if (grid[x][y].isRevealed) {
    return;
  }
  if (grid[x][y].isFlagged) {
    minesLeft++;
    grid[x][y].isFlagged = false;
  } else {
    minesLeft--;
    grid[x][y].isFlagged = true;
  }

  let flags = 0;
  for (let x = 0; x < WIDTH; x++) {
    for (let y = 0; y < HEIGHT; y++) {
      if (grid[x][y].isFlagged) {
        flags++;
      }
    }
  }

  if (flags === NUM_MINES) {
    let remaining = 0;
    for (let x = 0; x < WIDTH; x++) {
      for (let y = 0; y < HEIGHT; y++) {
        if (!grid[x][y].isRevealed && !grid[x][y].isFlagged) {
          remaining++;
        }
      }
    }

    if (remaining === 0) {
      gameOver = true;

      displayAllClearMessage();
    }
  }
}

function rightClick(x, y) {
  if (grid[x][y].isRevealed && !grid[x][y].isFlagged && !gameOver) {
    let flagged = 0;
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (x + dx >= 0 && x + dx < WIDTH && y + dy >= 0 && y + dy < HEIGHT) {
          if (grid[x + dx][y + dy].isFlagged) {
            flagged++;
          }
        }
      }
    }

    if (flagged === grid[x][y].surroundingMines) {
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          if (x + dx >= 0 && x + dx < WIDTH && y + dy >= 0 && y + dy < HEIGHT) {
            if (
              !grid[x + dx][y + dy].isFlagged &&
              !grid[x + dx][y + dy].isRevealed
            ) {
              reveal(x + dx, y + dy);
            }
          }
        }
      }
    }
  }
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function init(width, height) {
  // Get the grid element
  const gridElement = document.querySelector(".grid");

  // Set the initial grid dimensions
  // gridElement.style.width = `${width * 30}px`;
  // gridElement.style.height = `${height * 30}px`;

  // create the game grid
  grid = new Array(WIDTH);
  for (let i = 0; i < WIDTH; i++) {
    grid[i] = new Array(HEIGHT);
  }

  // initialize the game grid
  for (let x = 0; x < WIDTH; x++) {
    for (let y = 0; y < HEIGHT; y++) {
      grid[x][y] = {
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        surroundingMines: 0,
      };
    }
  }

  // place the mines in random locations
  for (let i = 0; i < NUM_MINES; i++) {
    let x = Math.floor(Math.random() * WIDTH);
    let y = Math.floor(Math.random() * HEIGHT);
    if (grid[x][y].isMine) {
      i--;
    } else {
      grid[x][y].isMine = true;
    }
  }

  // calculate the number of surrounding mines for each cell
  for (let x = 0; x < WIDTH; x++) {
    for (let y = 0; y < HEIGHT; y++) {
      if (!grid[x][y].isMine) {
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            if (
              x + dx >= 0 &&
              x + dx < WIDTH &&
              y + dy >= 0 &&
              y + dy < HEIGHT
            ) {
              if (grid[x + dx][y + dy].isMine) {
                grid[x][y].surroundingMines++;
              }
            }
          }
        }
      }
    }
  }

  // create the game grid
  const backgroundImages = [
    "icon-aerakimesh-icon-color",
    "icon-akri-icon-color",
    "icon-antrea-icon-color",
    "icon-argo-icon-color",
    "icon-armada-icon-color",
    "icon-artifacthub-icon-color",
    "icon-athenz-icon-color",
    // "icon-1gpt",
    "icon-3dmurk",
    "icon-backstage-icon-color",
    "icon-bfe-icon-color",
    "icon-buildpacks-icon-color",
    "icon-capsule-icon-color",
    "icon-carina-icon-color",
    "icon-carvel-icon-color",
    "icon-cdk8s-icon-color",
    "icon-cert-manager-icon-color",
    "icon-chaosblade-icon-color",
    "icon-murk",
    "icon-chaosmesh-icon-color",
    "icon-chubaofs-icon-color",
    "icon-cilium_icon-color",
    "icon-cloudcustodian-icon-color",
    "icon-cloudevents-icon-color",
    "icon-clusternet-icon-color",
    "icon-clusterpedia-icon-color",
    "icon-cncf-distribution-icon-color",
    "icon-cni-icon-color",
    "icon-confidential-containers-icon",
    "icon-connect-rpc-color",
    "icon-containerd-icon-color",
    "icon-containerssh-icon-dark",
    "icon-contour-icon-color",
    "icon-copa-icon-color",
    "icon-coredns-icon-color",
    "icon-cortex-icon-color",
    "icon-crio-icon-color",
    "icon-crossplane-icon-color",
    "icon-cubefs-icon-color",
    "icon-curve_icon_color",
    "icon-dapr-icon-color",
    "icon-devfile-icon-color",
    "icon-devstream-icon-color",
    "icon-dex-icon-color",
    "icon-dragonfly-icon-color",
    "icon-easegress-icon-color",
    "icon-emissary-ingress-icon-color",
    "icon-envoy-icon-color",
    "icon-eraser-icon-color",
    "icon-eso-icon-color",
    "icon-etcd-icon-color",
    "icon-fabedge-color",
    "icon-falco-icon-color",
    "icon-fluentbit-icon-color",
    "icon-fluid-icon-color",
    "icon-flux-horizontal-color",
    "icon-grpc-icon-color",
    "icon-grpc-pancake-color",
    "icon-harbor-icon-color",
    "icon-headlamp-icon-color",
    "icon-helm-icon-color",
    "icon-hexa-icon-color",
    "icon-hwameistor-icon-color",
    "icon-in-toto-icon-color",
    "icon-inclavare-icon-color",
    "icon-inspektor-gadget-icon-color",
    "icon-istio-icon-color",
    "icon-jaeger-icon-color",
    "icon-k3s-icon-color",
    "icon-k8gb-icon-color",
    "icon-k8sgpt-icon-color",
    "icon-k8up-icon-color",
    "icon-kairos-icon-color",
    "icon-karmada-icon-color",
    "icon-kcl-icon-color",
    "icon-kcp-icon-color",
    "icon-keda-icon-color",
    "icon-kepler-icon-color",
    "icon-keptn-icon-color",
    "icon-keycloak-icon-color",
    "icon-keylime-icon-color",
    "icon-knative-icon-color",
    "icon-konveyor-icon-color",
    "icon-koordinator-icon-color",
    "icon-krkn-icon-color",
    "icon-krustlet-icon-color",
    "icon-kuadrant-icon-color",
    "icon-kuasar-icon-white",
    "icon-kube-burner-icon-color",
    "icon-kube-ovn-icon-color",
    "icon-kube-rs-icon-black",
    "icon-kubean-icon-colordark",
    "icon-kubearmor-icon-color",
    "icon-kubedl-icon-color",
    "icon-kubeedge-icon-color",
    "icon-kubeflow-icon",
    "icon-kuberhealthy-icon-color",
    "icon-kubernetes-icon-color",
    "icon-kubescape-icon-color",
    "icon-kubeslice-icon-color",
    "icon-kubestellar-icon-color",
    "icon-kubevela-icon-color",
    "icon-kubevirt-icon-color",
    "icon-kubewarden-icon",
    "icon-kudo-icon-color",
    "icon-kueue-icon-color",
    "icon-kuma-icon-color",
    "icon-kured-icon-color",
    "icon-kyverno-icon-color",
    "icon-lima-horizontal-color",
    "icon-linkerd-icon-color",
    "icon-litmus-icon-color",
    "icon-logging-operator-icon-color",
    "icon-longhorn-icon-color",
    "icon-merbridge-icon-color",
    "icon-meshery-logo-light",
    "icon-metal3-icon-color",
    "icon-metallb-icon-color",
    "icon-microcks-icon-color",
    "icon-murk",
    "icon-nats-icon-color",
    "icon-networkservicemesh-icon-color-reversed",
    "icon-nocalhost-icon-color",
    "icon-notary-project-icon-color",
    "icon-ocm-icon-color",
    "icon-opa-icon-color",
    "icon-opcr-icon-color",
    "icon-opencost_icon_color",
    "icon-openfeature-icon-white",
    "icon-openfga-icon-color",
    "icon-openfunction-icon-color",
    "icon-opengitops-icon-color",
    "icon-openkruise-icon-black",
    "icon-opentelemetry-icon-color",
    "icon-openyurt-icon-color",
    "icon-operatorframework-icon-color",
    "icon-oras-horizontal-color",
    "icon-paralus-icon-color",
    "icon-parsec-icon-color",
    "icon-pipecd-icon-color",
    "icon-piraeus-icon-color",
    "icon-pixie-icon-color",
    "icon-porter-icon-color",
    "icon-pravega-icon-color",
    "icon-prometheus-icon-color",
    "icon-radius-icon-color",
    "icon-rook-icon-color",
    "icon-schemahero-icon-color",
    "icon-serverless-devs-icon-color",
    "icon-serverlessworkflow-icon-color",
    "icon-skooner-icon-color",
    "icon-slimtoolkit-icon-color",
    "icon-smp-light",
    "icon-spiderpool-icon-color",
    "icon-spiffe-icon-color",
    "icon-spire-icon-color",
    "icon-strimzi-icon-color",
    "icon-submariner-icon-color",
    "icon-superedge-icon-color",
    "icon-telepresence-icon-color",
    "icon-teller-icon-color",
    "icon-thanos-icon-color",
    "icon-tikv-icon-color",
    "icon-tinkerbell-icon-color-light",
    "icon-tremor-icon-color",
    "icon-trickster-icon-color",
    "icon-tuf-icon-color",
    "icon-vineyard-icon-color",
    "icon-virtualkubelet-icon-color",
    "icon-vitess-icon-color",
    "icon-volcano-icon-color",
    "icon-wasm-edge-runtime-icon-color",
    "icon-wasmcloud-icon-green",
    "icon-werf-icon-color",
    "icon-xline-icon-color",
    "icon-xregistry-icon-color-whitetext",
    "icon-zot-color-icon",
  ];

  // Shuffle the images
  shuffleArray(backgroundImages);

  // Ensure each image is used at least once
  let imageIndex = 0;
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const cellElement = document.createElement("div");
      cellElement.classList.add("cell");
      cellElement.classList.add("hidden");

      // Assign an image to the cell
      const image = backgroundImages[imageIndex];
      cellElement.classList.add("icon");
      cellElement.classList.add(image);
      //cellElement.style.backgroundImage = `url(${image})`;

      // Move to the next image, and wrap around if necessary
      imageIndex = (imageIndex + 1) % backgroundImages.length;

      cellElement.addEventListener("click", () => {
        if (gameOver) {
          return;
        }
        reveal(x, y);
        render(gridElement);
      });
      cellElement.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        if (gameOver) {
          return;
        }
        flag(x, y);
        rightClick(x, y);
        render(gridElement);
      });
      gridElement.appendChild(cellElement);
    }
  }

  firstMove = true;
  timerElement = document.getElementById("timer");

  // Set the gameOverElement and allClearElement variables
  gameOverElement = document.querySelector(".game-over");
  allClearElement = document.querySelector(".all-clear");

  // Initialize the minesLeftElement
  minesLeftElement = document.getElementById("mines-left");
}

// define a function to render the game grid
function render(gridElement) {
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const cellElement = gridElement.children[y * WIDTH + x];
      cellElement.classList.remove(
        "hidden",
        "revealed",
        "mine",
        "flagged",
        "revealed-mine",
        "empty"
      );
      cellElement.innerText = "";

      if (grid[x][y].isRevealed) {
        cellElement.classList.add("revealed");
        if (grid[x][y].isMine) {
          cellElement.classList.add("revealed-mine");
          cellElement.innerText = "💣";
          cellElement.style.backgroundColor = "red";
        } else if (grid[x][y].surroundingMines === 0) {
          cellElement.classList.add("empty");
        } else {
          cellElement.innerText = grid[x][y].surroundingMines;
        }
      } else if (grid[x][y].isFlagged) {
        cellElement.classList.add("flagged");
        cellElement.innerText = "⛳️";
      } else {
        cellElement.classList.add("hidden");
      }
    }
  }

  /* update the minesLeftElement's innerText property with the flag emoji */
  if (minesLeftElement) {
    minesLeftElement.innerText = `⛳️ POC's left: ${minesLeft}`;
  }

  /* check the gameOver variable here and display a "game over" message if necessary */
  if (gameOver) {
    let flags = 0;
    for (let x = 0; x < WIDTH; x++) {
      for (let y = 0; y < HEIGHT; y++) {
        if (grid[x][y].isFlagged) {
          flags++;
        }
      }
    }

    if (flags === NUM_MINES) {
      displayAllClearMessage();
    } else {
      displayGameOverMessage();
    }
  } else {
    // Show the timer
    const timerElement = document.getElementById("timer");
    timerElement.textContent = timer;
  }
}

const gridElement = document.getElementById("grid");
// create the game grid
init(WIDTH, HEIGHT);

// render the initial game grid
render(gridElement);

// define the function to change the difficulty level
function changeLevel(width, height, mines) {
  WIDTH = width;
  HEIGHT = height;
  MINES = mines;
  NUM_MINES = mines;
  minesLeft = MINES;

  // clear the current game
  clearInterval(timerID);
  timer = 0;
  firstMove = true;
  gameOver = false;
  clearInterval(timerID);
  // reset the timer element
  timerElement.textContent = "0";
  minesLeftElement.textContent = "";
  // Remove the cells from the grid
  while (gridElement.firstChild) {
    gridElement.removeChild(gridElement.firstChild);
  }

  // Set the grid element's new dimensions
  // gridElement.style.gridTemplateColumns = `repeat(${width}, 1fr)`;
  // gridElement.style.gridTemplateRows = `repeat(${height}, 1fr)`;
  // // Set the grid element's size
  // // so that the cells are always 30px wide and high
  // gridElement.style.width = `${WIDTH * 30}px`;
  // gridElement.style.height = `${HEIGHT * 30}px`;

  // Clear game over message
  const gameOverElement = document.getElementById("game-over");
  if (gameOverElement) {
    gameOverElement.parentNode.removeChild(gameOverElement);
  }

  // Clear all clear message
  const allClearElement = document.getElementById("all-clear");
  if (allClearElement) {
    allClearElement.parentNode.removeChild(allClearElement);
  }

  // initialize the new game
  init(width, height);

  // Update the minesLeft count
  if (minesLeftElement) {
    minesLeftElement.innerText = `⛳️ POC's left: ${minesLeft}`;
  }
}

// get the "Beginner" and "Intermediate" buttons
const beginnerButton = document.getElementById("beginner");
const intermediateButton = document.getElementById("intermediate");

// attach event listeners to the level buttons
document.getElementById("beginner").addEventListener("click", () => {
  gridElement.classList.remove("intermediate", "advanced");
  gridElement.classList.add("beginner");
  changeLevel(8, 8, 10);
});
document.getElementById("intermediate").addEventListener("click", () => {
  gridElement.classList.remove("beginner", "advanced");
  gridElement.classList.add("intermediate");
  changeLevel(16, 16, 40);
});
document.getElementById("expert").addEventListener("click", () => {
  gridElement.classList.remove("intermediate", "beginner");
  gridElement.classList.add("advanced");
  changeLevel(30, 16, 99);
});

function displayGameOverMessage() {
  // Get the game over element, if it exists
  let gameOverElement = document.getElementById("game-over");

  // If the element doesn't exist, create it
  if (!gameOverElement) {
    gameOverElement = document.createElement("div");
    gameOverElement.id = "game-over";
    gameOverElement.style.fontSize = "40px";
    gameOverElement.style.color = "red";
    gameOverElement.style.position = "absolute";
    gameOverElement.style.left = "50%";
    gameOverElement.style.top = "50%";
    gameOverElement.style.transform = "translate(-50%, -50%)";
    gameOverElement.style.backgroundColor = "white";
    gameOverElement.style.border = "5px solid red";
    gameOverElement.style.padding = "10px";
    document.body.appendChild(gameOverElement);
  }

  // If the game is over, display the message
  if (gameOver) {
    gameOverElement.innerText = "Game Over | Vendor Locked";
  } else {
    // Otherwise, clear the message
    gameOverElement.innerText = "";
  }
}

function displayAllClearMessage() {
  let allClearElement = document.getElementById("all-clear");
  if (allClearElement === null) {
    allClearElement = document.createElement("div");
    allClearElement.id = "all-clear";
    // Apply the same styles as the Game Over message
    allClearElement.style.fontSize = "40px";
    allClearElement.style.color = "green";
    allClearElement.style.position = "absolute";
    allClearElement.style.left = "50%";
    allClearElement.style.top = "50%";
    allClearElement.style.transform = "translate(-50%, -50%)";
    allClearElement.style.padding = "10px";
    allClearElement.style.backgroundColor = "white";
    allClearElement.style.border = "5px solid green";
    document.body.appendChild(allClearElement);
  }
  allClearElement.innerText = "All Clear!";
}
