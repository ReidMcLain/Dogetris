document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.grid');
    const playButton = document.getElementById('actionButton');
    const rightArrowButton = document.getElementById('rightArrowButton');
    const leftArrowButton = document.getElementById('leftArrowButton');
    const downArrowButton = document.getElementById('downArrowButton');
    const scoreDisplay = document.getElementById('score');
    let interval;  // Store the interval ID for clearing later
    let holdInterval;  // Store the interval ID for the button hold actions
    let holdTimeout;  // Store the timeout ID for detecting the hold
    let score = 0;
    let activeCells = [];

    // Create 200 cells and append them to the grid, each with an index, isOccupied, and isActive properties
    for (let i = 0; i < 200; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.index = i;
        cell.dataset.isOccupied = 'false';
        cell.dataset.isActive = 'false';
        grid.appendChild(cell);
    }

    const cells = document.querySelectorAll('.cell'); // Retrieve all cells

    function startMovement() {
        clearInterval(interval);  // Clear any existing interval
        interval = setInterval(() => {
            const activeIndices = getActiveIndices();
            console.log('Active Indices:', activeIndices);
            if (activeIndices.length > 0) {
                const canMoveDown = activeIndices.slice(2).every(index => {
                    const nextIndex = index + 10;
                    console.log(`Checking if cell ${nextIndex} is occupied or out of bounds`);
                    if (nextIndex >= cells.length) {
                        console.log(`Cell ${nextIndex} is out of bounds`);
                        return false;
                    }
                    if (cells[nextIndex].dataset.isOccupied === 'false') {
                        console.log(`Cell ${nextIndex} is free`);
                        return true;
                    }
                    console.log(`Cell ${nextIndex} is occupied`);
                    return false;
                });
                console.log('Can Move Down:', canMoveDown);
                if (canMoveDown) {
                    moveDogeDown();
                } else {
                    console.log('Stopping Movement');
                    stopMovement();
                    checkForCompleteRows(); // Check for complete rows before starting the next doge
                    startNextDoge();  // Start the next doge when the current one stops
                }
            }
        }, 1000);
    }

    playButton.addEventListener('click', () => {
        if (!isPlaying()) {
            console.log('Starting new game');
            populateInitialBlock();  // Start by populating the initial 2x2 block
            startMovement();
        }
    });

    rightArrowButton.addEventListener('mousedown', () => handleHold('right'));
    rightArrowButton.addEventListener('mouseup', stopHold);
    rightArrowButton.addEventListener('mouseleave', stopHold);

    leftArrowButton.addEventListener('mousedown', () => handleHold('left'));
    leftArrowButton.addEventListener('mouseup', stopHold);
    leftArrowButton.addEventListener('mouseleave', stopHold);

    downArrowButton.addEventListener('mousedown', () => handleHold('down'));
    downArrowButton.addEventListener('mouseup', stopHold);
    downArrowButton.addEventListener('mouseleave', stopHold);

    function handleHold(direction) {
        if (getActiveIndices().length > 0) {
            move(direction);
            holdTimeout = setTimeout(() => {
                holdInterval = setInterval(() => {
                    if (getActiveIndices().length > 0) {
                        move(direction);
                    }
                }, 100); // Speed up the movement
            }, 1000); // Start speeding up after 1 second hold
        }
    }

    function stopHold() {
        clearTimeout(holdTimeout);
        clearInterval(holdInterval);
    }

    function move(direction) {
        console.log('Moving:', direction);
        if (direction === 'right') {
            moveDogeRight();
        } else if (direction === 'left') {
            moveDogeLeft();
        } else if (direction === 'down') {
            moveDogeDown();
        }
    }

    function moveDogeDown() {
        const activeIndices = getActiveIndices();
        console.log('Moving Down, Active Indices:', activeIndices);
        if (activeIndices.length > 0) {
            const canMoveDown = activeIndices.slice(2).every(index => {
                const nextIndex = index + 10;
                return nextIndex < cells.length && cells[nextIndex].dataset.isOccupied === 'false';
            });
            console.log('Can Move Down:', canMoveDown);
            if (canMoveDown) {
                // Clear top two cells
                clearCell(activeIndices[0]);
                clearCell(activeIndices[1]);
                // Populate new bottom two cells
                populateCell(activeIndices[2] + 10);
                populateCell(activeIndices[3] + 10);
                // Update active cells to new indices
                activeCells = [
                    activeIndices[2],
                    activeIndices[3],
                    activeIndices[2] + 10,
                    activeIndices[3] + 10
                ];
                console.log('New Active Cells:', activeCells);
            }
        }
    }

    function moveDogeRight() {
        const activeIndices = getActiveIndices();
        console.log('Moving Right, Active Indices:', activeIndices);
        const rightmostCells = [activeIndices[1], activeIndices[3]];
        const canMoveRight = rightmostCells.every(index => {
            const nextIndex = index + 1;
            const withinBounds = (index % 10) < 9; // Check if within the grid's right boundary
            const notOccupied = withinBounds && cells[nextIndex].dataset.isOccupied === 'false';
            console.log(`Checking cell ${nextIndex}: within bounds - ${withinBounds}, occupied - ${cells[nextIndex].dataset.isOccupied}`);
            console.log(`Cell ${nextIndex} - within bounds: ${withinBounds}, not occupied: ${notOccupied}`);
            return withinBounds && notOccupied;
        });
        console.log('Can Move Right:', canMoveRight);
        if (canMoveRight) {
            // Clear leftmost cells of the block
            clearCell(activeIndices[0]);
            clearCell(activeIndices[2]);
            // Populate new cells to the right
            populateCell(activeIndices[1] + 1);
            populateCell(activeIndices[3] + 1);
            // Update active cells to new indices
            activeCells = [
                activeIndices[0] + 1,
                activeIndices[1] + 1,
                activeIndices[2] + 1,
                activeIndices[3] + 1
            ];
            console.log('New Active Cells:', activeCells);
        }
    }

    function moveDogeLeft() {
        const activeIndices = getActiveIndices();
        console.log('Moving Left, Active Indices:', activeIndices);
        const leftmostCells = [activeIndices[0], activeIndices[2]];
        const canMoveLeft = leftmostCells.every(index => {
            const nextIndex = index - 1;
            const withinBounds = (index % 10) > 0; // Check if within the grid's left boundary
            const notOccupied = withinBounds && cells[nextIndex].dataset.isOccupied === 'false';
            console.log(`Checking cell ${nextIndex}: within bounds - ${withinBounds}, occupied - ${cells[nextIndex].dataset.isOccupied}`);
            console.log(`Cell ${nextIndex} - within bounds: ${withinBounds}, not occupied: ${notOccupied}`);
            return withinBounds && notOccupied;
        });
        console.log('Can Move Left:', canMoveLeft);
        if (canMoveLeft) {
            // Clear rightmost cells of the block
            clearCell(activeIndices[1]);
            clearCell(activeIndices[3]);
            // Populate new cells to the left
            populateCell(activeIndices[0] - 1);
            populateCell(activeIndices[2] - 1);
            // Update active cells to new indices
            activeCells = [
                activeIndices[0] - 1,
                activeIndices[1] - 1,
                activeIndices[2] - 1,
                activeIndices[3] - 1
            ];
            console.log('New Active Cells:', activeCells);
        }
    }

    function getActiveIndices() {
        return Array.from(cells).reduce((indices, cell, index) => {
            if (cell.dataset.isActive === 'true') {
                indices.push(index);
            }
            return indices;
        }, []);
    }

    function populateInitialBlock() {
        activeCells = [4, 5, 14, 15];  // Initialize the 2x2 block
        console.log('Populating Initial Block:', activeCells);
        activeCells.forEach(index => populateCell(index));
    }

    function populateCell(index) {
        if (index < cells.length) {
            const img = document.createElement('img');
            img.src = 'dogetris.png';
            img.style.width = '100%';
            img.style.height = '100%';

            if (cells[index].hasChildNodes()) {
                cells[index].innerHTML = ''; // Ensure the cell is empty before adding new content
            }
            cells[index].appendChild(img);
            cells[index].dataset.isOccupied = 'true';
            cells[index].dataset.isActive = 'true'; // Mark the cell as active
            console.log(`Populated cell ${index}`);
        }
    }

    function clearCell(index) {
        if (index >= 0 && index < cells.length) {
            cells[index].innerHTML = '';
            cells[index].dataset.isOccupied = 'false';
            cells[index].dataset.isActive = 'false'; // Also mark the cell as not active
            console.log(`Cleared cell ${index}`);
        }
    }

    function stopMovement() {
        console.log('Stopping Movement, Active Cells:', activeCells);
        activeCells.forEach(index => cells[index].dataset.isActive = 'false');
        activeCells = [];
        clearInterval(interval);
    }

    function isPlaying() {
        return activeCells.length > 0;
    }

    function startNextDoge() {
        if (!isPlaying()) {
            console.log('Starting Next Doge');
            populateInitialBlock();  // Start by populating the initial 2x2 block
            startMovement();
        }
    }

    function incrementScore(points) {
        score += points;
        scoreDisplay.textContent = score;
        console.log('Score:', score);
    }

    function checkForCompleteRows() {
        for (let row = 19; row >= 0; row--) {  // Start checking from the bottom row
            let isComplete = true;
            for (let col = 0; col < 10; col++) {
                const cellIndex = row * 10 + col;
                if (cells[cellIndex].dataset.isOccupied === 'false') {
                    isComplete = false;
                    break;
                }
            }
            if (isComplete) {
                console.log('Clearing Row:', row);
                clearRow(row);
                moveAllCellsDown(row);
                incrementScore(10);
                row++; // Re-check this row since rows above have moved down
            }
        }
        startNextDoge(); // Ensure the game continues after clearing rows and applying points
    }

    function clearRow(row) {
        for (let col = 0; col < 10; col++) {
            const cellIndex = row * 10 + col;
            clearCell(cellIndex);
        }
    }

    function moveAllCellsDown(fromRow) {
        for (let row = fromRow - 1; row >= 0; row--) {
            for (let col = 0; col < 10; col++) {
                const cellIndex = row * 10 + col;
                const nextIndex = cellIndex + 10;
                if (cells[cellIndex].dataset.isOccupied === 'true') {
                    clearCell(cellIndex);
                    populateCell(nextIndex);
                }
            }
        }
    }

    // Automatically start movement if any cell is active
    if (isPlaying()) {
        startMovement();
    }
});