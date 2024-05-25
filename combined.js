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

    for (let i = 0; i < 200; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.index = i;
        cell.dataset.isOccupied = 'false';
        cell.dataset.isActive = 'false';
        grid.appendChild(cell);
    }

    const cells = document.querySelectorAll('.cell');

    function getMovementOffset(direction) {
        switch (direction) {
            case 'down':
                return 10;
            case 'right':
                return 1;
            case 'left':
                return -1;
        }
    }

    function startMovement() {
        clearInterval(interval);
        interval = setInterval(() => {
            if (canMoveBlock('down')) {
                moveBlock('down');
            } else {
                finalizeBlock();
                setTimeout(startNextBlock, 500);
            }
        }, 1000);
    }

    function moveBlock(direction) {
        const movementOffset = getMovementOffset(direction);
        if (canMoveBlock(direction)) {
            const oldActiveCells = [...activeCells];
            activeCells = activeCells.map(index => index + movementOffset);

            oldActiveCells.forEach(index => clearCell(index));
            activeCells.forEach(index => populateCell(index));
        }
    }

    function canMoveBlock(direction) {
        const movementOffset = getMovementOffset(direction);
        const newActiveIndices = activeCells.map(index => index + movementOffset);

        return newActiveIndices.every(index => {
            const withinVerticalBounds = index >= 0 && index < cells.length;
            const withinHorizontalBounds = (direction === 'left' && index % 10 !== 9) || (direction === 'right' && index % 10 !== 0);
            const cellExists = cells[index];
            const isOccupied = cellExists && cells[index].dataset.isOccupied === 'true';
            const isActive = cellExists && cells[index].dataset.isActive === 'true';
            return withinVerticalBounds && withinHorizontalBounds && (!isOccupied || isActive);
        });
    }

    function clearCell(index) {
        if (index >= 0 && index < cells.length) {
            cells[index].innerHTML = '';
            cells[index].dataset.isOccupied = 'false';
            cells[index].dataset.isActive = 'false';
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
            cells[index].dataset.isOccupied = 'true';
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
        // Logic to choose between spawning a 2x2 or 1x4 block
        activeCells = [5, 15, 25, 35];  // Example for a 1x4 block
        activeCells.forEach(index => populateCell(index));
        startMovement();
    }

    function checkForCompleteRows() {
        // Implementation of row checking and clearing
    }

    function handleHold(direction) {
        if (getActiveIndices().length > 0) {
            moveBlock(direction);
            holdTimeout = setTimeout(() => {
                holdInterval = setInterval(() => {
                    if (getActiveIndices().length > 0) {
                        moveBlock(direction);
                    }
                }, 100); // Speed up the movement
            }, 300); // Start speeding up after 300 ms hold
        }
    }

    function stopHold() {
        clearTimeout(holdTimeout);
        clearInterval(holdInterval);
    }

    function getActiveIndices() {
        return activeCells.filter(index => cells[index].dataset.isActive === 'true');
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

    function isPlaying() {
        return activeCells.some(index => cells[index].dataset.isActive === 'true');
    }
});