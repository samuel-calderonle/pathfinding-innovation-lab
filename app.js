const COLS = 20; const ROWS = 20; const TILE_SIZE = 15;
let grid = Array(ROWS).fill().map(() => Array(COLS).fill(0));
let startVector = { r: 4, c: 3 }; let endVector = { r: 15, c: 16 };
let isDrawing = false; let drawMode = 1;

const canvases = { Dijkstra: document.getElementById('canvasDijkstra'), AStar: document.getElementById('canvasAStar'), Invention: document.getElementById('canvasInvention') };
const contexts = { Dijkstra: canvases.Dijkstra.getContext('2d'), AStar: canvases.AStar.getContext('2d'), Invention: canvases.Invention.getContext('2d') };

function getGridCoordinates(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    return { c: Math.floor((event.clientX - rect.left) / TILE_SIZE), r: Math.floor((event.clientY - rect.top) / TILE_SIZE) };
}

function updateCellState(e) {
    if (!isDrawing) return;
    const coords = getGridCoordinates(e.target, e);
    if (coords.r >= 0 && coords.r < ROWS && coords.c >= 0 && coords.c < COLS) {
        if ((coords.r === startVector.r && coords.c === startVector.c) || (coords.r === endVector.r && coords.c === endVector.c)) return;
        grid[coords.r][coords.c] = drawMode;
        renderAllEnvironments();
    }
}

window.addEventListener('mouseup', () => { if (isDrawing) { isDrawing = false; executeBenchmarkSuite(); } });
Object.values(canvases).forEach(canvas => {
    canvas.addEventListener('contextmenu', e => e.preventDefault());
    canvas.addEventListener('mousedown', (e) => { isDrawing = true; drawMode = e.button === 2 ? 0 : 1; updateCellState(e); });
    canvas.addEventListener('mousemove', updateCellState);
});

document.getElementById('clearBtn').addEventListener('click', () => {
    grid = Array(ROWS).fill().map(() => Array(COLS).fill(0));
    renderAllEnvironments(); executeBenchmarkSuite();
});
document.getElementById('runBtn').addEventListener('click', executeBenchmarkSuite);

function renderGridFrame(ctx, closedSet = new Set(), resolutionPath = [], statusLabel = "Idle", engineKey, nodeCounter = 0, computedCost = 0) {
    ctx.clearRect(0, 0, COLS * TILE_SIZE, ROWS * TILE_SIZE);
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            ctx.strokeStyle = '#222222'; ctx.strokeRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            if (grid[r][c] === 1) { ctx.fillStyle = '#555555'; ctx.fillRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE); }
        }
    }
    ctx.fillStyle = 'rgba(0, 122, 204, 0.35)';
    closedSet.forEach(key => {
        const [r, c] = key.split(',').map(Number);
        if((r !== startVector.r || c !== startVector.c) && (r !== endVector.r || c !== endVector.c)) ctx.fillRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    });
    ctx.fillStyle = '#ffc107';
    resolutionPath.forEach(node => {
        if((node.r !== startVector.r || node.c !== startVector.c) && (node.r !== endVector.r || node.c !== endVector.c)) ctx.fillRect(node.c * TILE_SIZE, node.r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    });
    ctx.fillStyle = '#28a745'; ctx.fillRect(startVector.c * TILE_SIZE, startVector.r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    ctx.fillStyle = '#dc3545'; ctx.fillRect(endVector.c * TILE_SIZE, endVector.r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    document.getElementById(`eval${engineKey}`).innerText = nodeCounter;
    document.getElementById(`cost${engineKey}`).innerText = computedCost;
    document.getElementById(`state${engineKey}`).innerText = statusLabel;
}

function renderAllEnvironments() {
    renderGridFrame(contexts.Dijkstra, new Set(), [], "Ready", "Dijkstra", 0, 0);
    renderGridFrame(contexts.AStar, new Set(), [], "Ready", "AStar", 0, 0);
    renderGridFrame(contexts.Invention, new Set(), [], "Ready", "Invention", 0, 0);
}

function resolveAdjacencyVectors(node) {
    const validVectors = []; 
    // FIXED: Corrected direction vectors array syntax to prevent syntax crash
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]; 
    
    for (let i = 0; i < directions.length; i++) {
        let tr = node.r + directions[i][0]; 
        let tc = node.c + directions[i][1];
        if (tr >= 0 && tr < ROWS && tc >= 0 && tc < COLS && grid[tr][tc] !== 1) {
            validVectors.push({ r: tr, c: tc });
        }
    }
    return validVectors;
}

let processingTokens = { Dijkstra: true, AStar: true, Invention: true };

async function executeBenchmarkSuite() {
    processingTokens.Dijkstra = false; processingTokens.AStar = false; processingTokens.Invention = false;
    await new Promise(r => setTimeout(r, 10));
    processingTokens.Dijkstra = true; processingTokens.AStar = true; processingTokens.Invention = true;
    const pipelineDelay = parseInt(document.getElementById('speedSelect').value);

    runAlgorithmEngine('Dijkstra', (q) => { q.sort((a, b) => a.g - b.g); return q.shift(); }, () => 0, pipelineDelay);
    runAlgorithmEngine('AStar', (q) => { q.sort((a, b) => (a.g + a.h) - (b.g + b.h)); return q.shift(); }, (n) => Math.abs(n.r - endVector.r) + Math.abs(n.c - endVector.c), pipelineDelay);
    
    // CUSTOM WORKSPACE INJECTION POINT (Smarter Tie-Breaker)
    runAlgorithmEngine('Invention', (q) => { 
        q.sort((a, b) => (a.g + a.h) - (b.g + b.h)); 
        return q.shift(); 
    }, (n) => { 
        const manhattanHeuristic = Math.abs(n.r - endVector.r) + Math.abs(n.c - endVector.c);
        
        // Add a tiny fraction (0.001) biased by the straight-line direction.
        // This breaks ties instantly without overestimating enough to ruin the path cost!
        const tieBreaker = 1.0 + 0.001;
        return manhattanHeuristic * tieBreaker; 
    }, pipelineDelay);

}

async function runAlgorithmEngine(engineKey, sortingSelectionHook, structuralHeuristicCallback, stepDelay) {
    let openMemorySet = [{ r: startVector.r, c: startVector.c, g: 0, h: structuralHeuristicCallback(startVector), parent: null }];
    let closedTrackingSet = new Set(); let computedSolutionPath = []; let frameIterationCount = 0; let operationSuccessful = false;

    while (openMemorySet.length > 0) {
        if (!processingTokens[engineKey]) return;
        let currentActiveNode = sortingSelectionHook(openMemorySet);
        let nodeIdentityKey = `${currentActiveNode.r},${currentActiveNode.c}`;
        if (closedTrackingSet.has(nodeIdentityKey)) continue;
        closedTrackingSet.add(nodeIdentityKey); frameIterationCount++;

        if (currentActiveNode.r === endVector.r && currentActiveNode.c === endVector.c) {
            let tracePointer = currentActiveNode.parent;
            while (tracePointer && tracePointer.parent) { computedSolutionPath.push(tracePointer); tracePointer = tracePointer.parent; }
            operationSuccessful = true; break;
        }
        let childNeighbors = resolveAdjacencyVectors(currentActiveNode);
        for (let i = 0; i < childNeighbors.length; i++) {
            let neighbor = childNeighbors[i]; if (closedTrackingSet.has(`${neighbor.r},${neighbor.c}`)) continue;
            openMemorySet.push({ r: neighbor.r, c: neighbor.c, g: currentActiveNode.g + 1, h: structuralHeuristicCallback(neighbor), parent: currentActiveNode });
        }
        if (stepDelay > 1 && frameIterationCount % 3 === 0) {
            renderGridFrame(contexts[engineKey], closedTrackingSet, [], "Searching...", engineKey, frameIterationCount, 0);
            await new Promise(r => setTimeout(r, stepDelay / 5));
        }
    }
    let pathCostTotal = computedSolutionPath.length > 0 ? computedSolutionPath.length + 1 : 0;
    if(startVector.r === endVector.r && startVector.c === endVector.c) pathCostTotal = 0;
    renderGridFrame(contexts[engineKey], closedTrackingSet, computedSolutionPath, operationSuccessful ? "Success!" : "Trapped", engineKey, frameIterationCount, pathCostTotal);
}

// A MAZE TO TEST THE ALGORITHIMS

// 1. Reset matrix to empty space
grid = Array(ROWS).fill().map(() => Array(COLS).fill(0));

// 2. Set coordinates (Start inside a tunnel, End outside to the right)
startVector = { r: 10, c: 4 };
endVector = { r: 10, c: 18 };

// 3. Draw horizontal wall channels on Row 8 and Row 12
for (let col = 3; col <= 15; col++) {
    grid[8][col] = 1;  // Top boundary of tunnel
    grid[12][col] = 1; // Bottom boundary of tunnel
}

// 4. Draw a solid vertical cap on Column 15 to seal the dead-end trap
for (let row = 8; row <= 12; row++) {
    grid[row][15] = 1;
}

// 5. Force update viewports
renderAllEnvironments();
executeBenchmarkSuite();
