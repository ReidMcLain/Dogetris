document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.grid');
    const playButton = document.getElementById('actionButton');
    const rightArrowButton = document.getElementById('rightArrowButton');
    const leftArrowButton = document.getElementById('leftArrowButton');
    const downArrowButton = document.getElementById('downArrowButton');
    const scoreDisplay = document.getElementById('score');
    let interval;
    let holdInterval;
    let holdTimeout;
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
        clearInterval(interval);
        interval = setInterval(() => {
            if (canMoveBlock('down')) {
                moveBlock('down');
            } else {
                finalizeBlock();
                setTimeout(startNextBlock, 500); // Delay before the next shape
            }
        }, 1000);
    }

    function moveBlock(direction) {
        const movementOffset = getMovementOffset(direction);
        if (canMoveBlock(direction)) {
            const oldActiveCells = [...activeCells]; // Copy old active cells to clear them later
            activeCells = activeCells.map(index => index + movementOffset);

            oldActiveCells.forEach(index => {
                clearCell(index); // Clear the cell's contents and reset its status
            });

            activeCells.forEach(index => {
                cells[index].dataset.isActive = 'true';
                populateCell(index); // Populate the cell with the new position
            });
        }
    }

    function canMoveBlock(direction) {
        const movementOffset = getMovementOffset(direction);
        const newActiveIndices = activeCells.map(index => index + movementOffset);

        return newActiveIndices.every(index => {
            // Check within vertical bounds
            const withinVerticalBounds = index >= 0 && index < cells.length;
            if (!withinVerticalBounds) return false;

            // Check within horizontal bounds
            if (direction === 'left') {
                if (index % 10 === 9) return false; // Prevent wrapping to the right
            } else if (direction === 'right') {
                if (index % 10 === 0) return false; // Prevent wrapping to the left
            }

            // Check cell existence and occupation status
            const cell = cells[index];
            if (!cell) return false; // Ensure the cell actually exists
            const isOccupied = cell.dataset.isOccupied === 'true';
            const isActive = cell.dataset.isActive === 'true';
            return !isOccupied || isActive;
        });
    }

    document.getElementById('spinButton').addEventListener('click', () => {
        rotateBlock();
    });

    document.getElementById('spinButton').addEventListener('click', rotateBlock);

    function rotateBlock() {
        if (!activeCells.length) {
            console.log("No active block to rotate");
            return; // No active block to rotate
        }

        const gridWidth = 10; // Assuming a grid width of 10
        const isHorizontal = (activeCells[1] - activeCells[0] === 1); // Check if the block is horizontal
        let middleIndex; // Central pivot for both orientations

        console.log("Current orientation:", isHorizontal ? "Horizontal" : "Vertical");
        console.log("Current activeCells:", activeCells);

        if (isHorizontal) {
            // Horizontal to Vertical: Use the middle index of the horizontal block
            middleIndex = activeCells[1];
            newPositions = [
                middleIndex - gridWidth * 2, // Two cells up
                middleIndex - gridWidth,     // One cell up
                middleIndex,                 // Middle
                middleIndex + gridWidth      // One cell down
            ];
        } else {
            // Vertical to Horizontal: Use the middle index of the vertical block
            middleIndex = activeCells[2];
            newPositions = [
                middleIndex - 1, // One cell left
                middleIndex,     // Middle
                middleIndex + 1, // One cell right
                middleIndex + 2  // Two cells right
            ];
        }

        console.log("Proposed newPositions:", newPositions);

        const canRotate = newPositions.every(index => {
            const withinBounds = index >= 0 && index < cells.length * gridWidth;
            const notOccupied = cells[index] && cells[index].dataset.isOccupied !== 'true';
            return withinBounds && notOccupied;
        });

        if (canRotate) {
            // Clear old positions
            activeCells.forEach(index => clearCell(index));

            // Populate new positions
            newPositions.forEach(index => {
                populateCell(index);
                cells[index].dataset.isOccupied = 'true'; // Mark new positions as occupied
            });
            activeCells = newPositions;
            console.log("Rotation successful", "New activeCells:", activeCells);
        } else {
            console.log("Rotation failed: Out of bounds or occupied");
        }
    }

    function getMovementOffset(direction) {
        switch (direction) {
            case 'down': return 10;
            case 'right': return 1;
            case 'left': return -1;
        }
    }

    function populateCell(index) {
        if (index < cells.length && !cells[index].hasChildNodes()) {
            const img = document.createElement('img');
            img.src = 'dogetris.png';
            img.style.width = '100%';
            img.style.height = '100%';
            cells[index].appendChild(img);
            cells[index].dataset.isActive = 'true';
        }
    }

    function clearCell(index) {
        if (index >= 0 && index < cells.length) {
            cells[index].innerHTML = ''; // Clear any inner HTML, such as images
            cells[index].dataset.isOccupied = 'false';
            cells[index].dataset.isActive = 'false';
        }
    }

    function finalizeBlock() {
        activeCells.forEach(index => {
            cells[index].dataset.isOccupied = 'true';
            cells[index].dataset.isActive = 'false';
        });
        activeCells = [];
        clearInterval(interval);
        checkForCompleteRows();
    }

    function startNextBlock() {
        activeCells = [5, 15, 25, 35]; // Start a new 1x4 block at the top center
        activeCells.forEach(index => {
            cells[index].dataset.isActive = 'true';
            populateCell(index);
        });
        startMovement();
    }

    function isPlaying() {
        return activeCells.some(index => cells[index].dataset.isActive === 'true');
    }

    function incrementScore(points) {
        score += points;
        scoreDisplay.textContent = score.toString();
    }

    function checkForCompleteRows() {
        for (let row = 19; row >= 0; row--) {
            let isComplete = true;
            for (let col = 0; col < 10; col++) {
                const cellIndex = row * 10 + col;
                if (cells[cellIndex].dataset.isOccupied === 'false') {
                    isComplete = false;
                    break;
                }
            }
            if (isComplete) {
                for (let col = 0; col < 10; col++) {
                    const cellIndex = row * 10 + col;
                    clearCell(cellIndex);
                }
                incrementScore(10); // Increment score for each complete row
                moveAllCellsDown(row);
                row++; // Recheck the same row index since all above have moved down
            }
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
                    cells[nextIndex].dataset.isOccupied = 'true';
                }
            }
        }
    }

    playButton.addEventListener('click', () => {
        if (!isPlaying()) {
            startNextBlock();
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
            moveBlock(direction);
            holdTimeout = setTimeout(() => {
                holdInterval = setInterval(() => {
                    if (getActiveIndices().length > 0) {
                        moveBlock(direction);
                    }
                }, 100); // Speed up the movement
            }, 1000); // Start speeding up after 1 second hold
        }
    }

    function stopHold() {
        clearTimeout(holdTimeout);
        clearInterval(holdInterval);
    }

    function getActiveIndices() {
        return activeCells;
    }
});