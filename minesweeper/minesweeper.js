// define the game grid dimensions and the number of mines as regular variables
let WIDTH = 8;
let HEIGHT = 8;
let NUM_MINES = 10;

/* add the gameOver variable here */
let gameOver = false;
let gameOverElement = document.getElementById('game-over');

/* add the minesLeft variable here and initialize it to the total number of mines */
let minesLeft = NUM_MINES;
/* add the minesLeftElement variable here and initialize it to null */
let minesLeftElement = null;
let firstMove = true;
let timer = 0;
let timerElement = null
let timerID = null;


// define a function to reveal a cell
function reveal(x, y) {
  if (grid[x][y].isFlagged || grid[x][y].isRevealed || gameOver) {
    return;
  }

  grid[x][y].isRevealed = true;

  // Update the cell element to remove the background image
  const cellElement = document.querySelector(`.grid .cell:nth-child(${y * WIDTH + x + 1})`);
  cellElement.classList.remove('hidden');
  cellElement.classList.add('revealed');
  cellElement.style.backgroundImage = 'none';

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
              if (i + dx >= 0 && i + dx < WIDTH && j + dy >= 0 && j + dy < HEIGHT) {
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
    displayGameOverMessage()

    
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
    displayAllClearMessage()

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

      displayAllClearMessage()
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
            if (!grid[x + dx][y + dy].isFlagged && !grid[x + dx][y + dy].isRevealed) {
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
  const gridElement = document.querySelector('.grid');

  // Set the initial grid dimensions
  gridElement.style.width = `${width * 30}px`;
  gridElement.style.height = `${height * 30}px`;

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
        surroundingMines: 0
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
            if (x + dx >= 0 && x + dx < WIDTH && y + dy >= 0 && y + dy < HEIGHT) {
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
    'public/aerakimesh-icon-color.png',
    'public/akri-icon-color.png',
    'public/antrea-icon-color.png',
    'public/argo-icon-color.png',
    'public/armada-icon-color.png',
    'public/artifachub-icon-color.png',
    'public/athenz-icon-color.png',
    'public/1gpt.png',
    'public/3dmurk.png',
    'public/backstage-icon-color.png',
    'public/bfe-icon-color.png',
    'public/buildpacks-icon-color.png',
    'public/capsule-icon-color.png',
    'public/carina-icon-color.png',
    'public/carvel-icon-color.png',
    'public/cdk8s-icon-color.png',
    'public/cert-manager-icon-color.png',
    'public/chaosblade-icon-color.png',
    'public/murk.png',
    'public/chaosmesh-icon-color.png',
    'public/chubaofs-icon-color.png',
    'public/cilium_icon-color.png',
    'public/cloudcustodian-icon-color.png',
    'public/cloudevents-icon-color.png',
    'public/clusternet-icon-color.png',
    'public/clusterpedia-icon-color.png',
    'public/cncf-distribution-icon-color.png',
    'public/cni-icon-color.png',
    'public/confidential-containers-icon-color.png',
    'public/connect-rpc-color.png',
    'public/containerd-icon-color.png',
    'public/containerssh-icon-dark.png',
    'public/contour-icon-color.png',
    'public/copa-icon-color.png',
    'public/coredns-icon-color.png',
    'public/cortex-icon-color.png',
    'public/crio-icon-color.png',
    'public/crossplane-icon-color.png',
    'public/cubefs-icon-color.png',
    'public/curve_icon_color.png',
    'public/dapr-icon-color.png',
    'public/devfile-icon-color.png',
    'public/devstream-icon-color.png',
    'public/dex-icon-color.png',
    'public/dragonfly-icon-color.png',
    'public/easegress-icon-color.png',
    'public/emissary-ingress-icon-color.png',
    'public/envoy-icon-color.png',
    'public/eraser-icon-color.png',
    'public/eso-icon-color.png',
    'public/etcd-icon-color.png',
    'public/fabedge-color.png',
    'public/falco-icon-color.png',
    'public/fluentbit-icon-color.png',
    'public/fluid-icon-color.png',
    'public/flux-horizontal-color.png',
    'public/grpc-icon-color.png',
    'public/grpc-pancake-color.png',
    'public/harbor-icon-color.png',
    'public/headlamp-icon-color.png',
    'public/helm-icon-color.png',
    'public/hexa-icon-color.png',
    'public/hwameistor-icon-color.png',
    'public/in-toto-icon-color.png',
    'public/inclavare-icon-color.png',
    'public/inspektor-gadget-icon-color.png',
    'public/istio-icon-color.png',
    'public/jaeger-icon-color.png',
    'public/k3s-icon-color.png',
    'public/k8gb-icon-color.png',
    'public/k8sgpt-icon-color.png',
    'public/k8up-icon-color.png',
    'public/kairos-icon-color.png',
    'public/karmada-icon-color.png',
    'public/kcl-icon-color.png',
    'public/kcp-icon-color.png',
    'public/keda-icon-color.png',
    'public/kepler-icon-color.png',
    'public/keptn-icon-color.png',
    'public/keycloak-icon-color.png',
    'public/keylime-icon-color.png',
    'public/knative-icon-color.png',
    'public/konveyor-icon-color.png',
    'public/koordiantor-icon-color.png',
    'public/krkn-icon-color.png',
    'public/krustlet-icon-color.png',
    'public/kuadrant-icon-color.png',
    'public/kuasar-icon-white.png',
    'public/kube-burner-icon-color.png',
    'public/kube-ovn-icon-color.png',
    'public/kube-rs-icon-black.png',
    'public/kubean-icon-colordark.png',
    'public/kubearmor-icon-color.png',
    'public/kubedl-icon-color.png',
    'public/kubeedge-icon-color.png',
    'public/kubeflow-icon.png',
    'public/kuberhealthy-icon-color.png',
    'public/kubernetes-icon-color.png',
    'public/kubescape-icon-color.png',
    'public/kubeslice-icon-color.png',
    'public/kubestellar-icon-color.png',
    'public/kubevela-icon-color.png',
    'public/kubevirt-icon-color.png',
    'public/kubewarden-icon.png',
    'public/kudo-icon-color.png',
    'public/kueue-icon-color.png',
    'public/kuma-icon-color.png',
    'public/kured-icon-color.png',
    'public/kyverno-icon-color.png',
    'public/lima-horizontal-color.png',
    'public/linkerd-icon-color.png',
    'public/litmus-icon-color.png',
    'public/logging-operator-icon-color.png',
    'public/longhorn-icon-color.png',
    'public/merbridge-icon-color.png',
    'public/meshery-logo-light.png',
    'public/metal3-icon-color.png',
    'public/metallb-icon-color.png',
    'public/microcks-icon-color.png',
    'public/murk.png',
    'public/nats-icon-color.png',
    'public/networkservicemesh-icon-color.png',
    'public/nocalhost-icon-color.png',
    'public/notary-project-icon-color.png',
    'public/ocm-icon-color.png',
    'public/opa-icon-color.png',
    'public/opcr-icon-color.png',
    'public/opencost_icon_color.png',
    'public/openfeature-icon-white.png',
    'public/openfga-icon-color.png',
    'public/openfunction-icon-color.png',
    'public/openagitops-icon-color.png',
    'public/openkruise-icon-black.png',
    'public/opentelemetry-icon-color.png',
    'public/openyurt-icon-color.png',
    'public/operatorframework-icon-color.png',
    'public/oras-horizontal-color.png',
    'public/paralus-icon-color.png',
    'public/parsec-icon-color.png',
    'public/pipecd-icon-color.png',
    'public/piraeus-icon-color.png',
    'public/pixie-icon-color.png',
    'public/porter-icon-color.png',
    'public/pravega-icon-color.png',
    'public/prometheus-icon-color.png',
    'public/radius-icon-color.png',
    'public/rook-icon-color.png',
    'public/schemahero-icon-color.png',
    'public/serverless-devs-icon-color.png',
    'public/serverlessworkflow-icon-color.png',
    'public/skooner-icon-color.png',
    'public/slimtoolkit-icon-color.png',
    'public/smp-light.png',
    'public/spiderpool-icon-color.png',
    'public/spiffe-icon-color.png',
    'public/spire-icon-color.png',
    'public/strimzi-icon-color.png',
    'public/submariner-icon-color.png',
    'public/superedge-icon-color.png',
    'public/telepresence-icon-color.png',
    'public/teller-icon-color.png',
    'public/thanos-icon-color.png',
    'public/tikv-icon-color.png',
    'public/tinkerbell-icon-color-light.png',
    'public/tremor-icon-color.png',
    'public/trickster-icon-color.png',
    'public/tuf-icon-color.png',
    'public/vineyard-icon-color.png',
    'public/virtualkubelet-icon-color.png',
    'public/vitess-icon-color.png',
    'public/volcano-icon-color.png',
    'public/wasm-edge-runtime-icon-color.png',
    'public/wasmcloud-icon_green.png',
    'public/werf-icon-color.png',
    'public/xline-icon-color.png',
    'public/xregistry-icon-color-whitetext.png',
    'public/zot-color-icon.png',
  ];

  // Shuffle the images
  shuffleArray(backgroundImages);

  // Ensure each image is used at least once
  let imageIndex = 0;
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const cellElement = document.createElement('div');
      cellElement.classList.add('cell');
      cellElement.classList.add('hidden');

      // Assign an image to the cell
      const image = backgroundImages[imageIndex];
      cellElement.style.backgroundImage = `url(${image})`;

      // Move to the next image, and wrap around if necessary
      imageIndex = (imageIndex + 1) % backgroundImages.length;

      cellElement.addEventListener('click', () => {
        if (gameOver) {
          return;
        }
        reveal(x, y);
        render(gridElement);
      });
      cellElement.addEventListener('contextmenu', (event) => {
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
  timerElement = document.getElementById('timer'); 

  // Set the gameOverElement and allClearElement variables
  gameOverElement = document.querySelector('.game-over');
  allClearElement = document.querySelector('.all-clear');  

  // Initialize the minesLeftElement
  minesLeftElement = document.getElementById('mines-left');
}

// define a function to render the game grid
function render(gridElement) {
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const cellElement = gridElement.children[y * WIDTH + x];
      cellElement.classList.remove('hidden', 'revealed', 'mine', 'flagged', 'revealed-mine', 'empty');
      cellElement.innerText = '';

      if (grid[x][y].isRevealed) {
        cellElement.classList.add('revealed');
        if (grid[x][y].isMine) {
          cellElement.classList.add('revealed-mine');
          cellElement.innerText = '💣';
          cellElement.style.backgroundColor = 'red';
        } else if (grid[x][y].surroundingMines === 0) {
          cellElement.classList.add('empty');
        } else {
          cellElement.innerText = grid[x][y].surroundingMines;
        }
      } else if (grid[x][y].isFlagged) {
        cellElement.classList.add('flagged');
        cellElement.innerText = '⛳️';
      } else {
        cellElement.classList.add('hidden');
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
      displayAllClearMessage()
    } else {
      displayGameOverMessage()
    }
  } else {
    // Show the timer
    const timerElement = document.getElementById('timer');
    timerElement.textContent = timer;
  }
}

const gridElement = document.getElementById('grid');
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
  minesLeftElement.textContent = '';
  // Remove the cells from the grid
  while (gridElement.firstChild) {
    gridElement.removeChild(gridElement.firstChild);
  }

  // Set the grid element's new dimensions
  gridElement.style.gridTemplateColumns = `repeat(${width}, 1fr)`;
  gridElement.style.gridTemplateRows = `repeat(${height}, 1fr)`;  
  // Set the grid element's size
  // so that the cells are always 30px wide and high
  gridElement.style.width = `${WIDTH * 30}px`;
  gridElement.style.height = `${HEIGHT * 30}px`;

  // Clear game over message
  const gameOverElement = document.getElementById('game-over');
  if (gameOverElement) {
    gameOverElement.parentNode.removeChild(gameOverElement);
  }

  // Clear all clear message
  const allClearElement = document.getElementById('all-clear');
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
const beginnerButton = document.getElementById('beginner');
const intermediateButton = document.getElementById('intermediate');

// attach event listeners to the level buttons
document.getElementById('beginner').addEventListener('click', () => {
  changeLevel(8, 8, 10);
});
document.getElementById('intermediate').addEventListener('click', () => {
  changeLevel(16, 16, 40);
});
document.getElementById('expert').addEventListener('click', () => {
  changeLevel(30, 16, 99);
});

function displayGameOverMessage() {
  // Get the game over element, if it exists
  let gameOverElement = document.getElementById('game-over');

  // If the element doesn't exist, create it
  if (!gameOverElement) {
    gameOverElement = document.createElement('div');
    gameOverElement.id = 'game-over';
    gameOverElement.style.fontSize = '40px';
    gameOverElement.style.color = 'red';
    gameOverElement.style.position = 'absolute';
    gameOverElement.style.left = '50%';
    gameOverElement.style.top = '50%';
    gameOverElement.style.transform = 'translate(-50%, -50%)';
    gameOverElement.style.backgroundColor = 'white';
    gameOverElement.style.border = '5px solid red';
    gameOverElement.style.padding = '10px';    
    document.body.appendChild(gameOverElement);
  }

  // If the game is over, display the message
  if (gameOver) {
    gameOverElement.innerText = 'Game Over | Vendor Locked';
  } else {
    // Otherwise, clear the message
    gameOverElement.innerText = '';
  }
}

function displayAllClearMessage() {
  let allClearElement = document.getElementById('all-clear');
  if (allClearElement === null) {
    allClearElement = document.createElement('div');
    allClearElement.id = 'all-clear';
    // Apply the same styles as the Game Over message
    allClearElement.style.fontSize = '40px';
    allClearElement.style.color = 'green';
    allClearElement.style.position = 'absolute';
    allClearElement.style.left = '50%';
    allClearElement.style.top = '50%';
    allClearElement.style.transform = 'translate(-50%, -50%)';
    allClearElement.style.padding = '10px';
    allClearElement.style.backgroundColor = 'white';
    allClearElement.style.border = '5px solid green';    
    document.body.appendChild(allClearElement);
  }
  allClearElement.innerText = 'All Clear!';
}

