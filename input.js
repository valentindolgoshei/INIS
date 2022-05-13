const minWidth = 20;
const minHeight = 20;

let targets = document.querySelectorAll('.target');
let selected = null;
let captured = null;
let resized = null;

let moved = false;
let escaped = false;
let dbclicked = false;
let dbtapped = false;
let mouse = true;

let deltaX;
let deltaY;

let startX;
let startY;

let startWidth;
let startHeight;

let clickTimer = null;

function subscribe() {

    // clicks --------------------------------------------

    document.addEventListener('click', () => {
        touchBackgroung();
    });

    document.addEventListener('mousemove', (e) => {
        if (mouse) {
            moveElement(e);
        }
    });

    document.addEventListener('mouseup', () => {
        dbclicked = false;
        captured = null;
    });

    document.addEventListener('keydown', (e) => {
        if (e.key == 'Escape') {
            cancel();
            escaped = !dbclicked;
        }
    });

    // touches -----------------------------------------------

    document.addEventListener('touchmove', (e) => {
        if (!dbtapped) {
            moveElement(e.touches[0]);
        }
        else {
            resize(e);
        }
    });

    document.addEventListener('touchend', () => {
        if (!moved) {
            captured = null;
        }
    });

    document.addEventListener('touchstart', (e) => {
        mouse = false;
        switch (e.touches.length) {
            case 2:
                cancel();
                break;
            case 3:
                resized.style.width = startWidth + 'px';
                resized.style.height = startHeight + 'px';
                resized.style.left = startX + 'px';
                resized.style.top = startY + 'px';
                resized = null;
                break;
        }
    });

    targets.forEach(element => {

        // clicks -------------------------------------------------

        element.addEventListener('click', (e) => {
            touchElement(element, e);
        });

        element.addEventListener('mousedown', (e) => {
            downElement(element, e);
        });

        element.addEventListener('dblclick', (e) => {
            dbclicked = true;
            captureElement(element, e);
        });

        // touches --------------------------------------------------

        element.addEventListener('touchstart', (e) => {
            mouse = false;
            switch (e.touches.length) {
                case 1:
                    if (clickTimer == null) {
                        clickTimer = setTimeout(function () {
                            clickTimer = null;
                        }, 200)

                        dbtapped = false;
                        moved = false;
                        if (captured == null) {
                            downElement(element, e.touches[0]);
                        }
                    }
                    else {
                        clearTimeout(clickTimer);
                        clickTimer = null;
                        captureElement(element, e.touches[0]);
                        dbclicked = true;
                    }
                    break;
                case 2:
                    if (clickTimer != null) {
                        clearTimeout(clickTimer);
                        clickTimer = null;
                        dbtapped = true;
                        resized = element;
                        startX = element.offsetLeft;
                        startY = element.offsetTop;
                        startWidth = element.offsetWidth;
                        startHeight = element.offsetHeight;
                        e.stopPropagation();
                    }
                    break;
            }
        });

        element.addEventListener('touchend', (e) => {
            mouse = false;
            switch (e.touches.length) {
                case 0:
                    if (captured != null && !dbclicked) {
                        captured = null;
                    }

                    if (!dbtapped) {
                        touchElement(element, e);
                    }

                    resized = null;
                    break;
            }
        });

    });
}

subscribe();

function captureElement(element, e) {
    startX = element.offsetLeft;
    startY = element.offsetTop;
    deltaX = element.offsetLeft - e.clientX;
    deltaY = element.offsetTop - e.clientY;
    captured = element;
}

function touchElement(element, e) {
    if (!moved) {
        if (selected != null) {
            selected.classList.remove('selected');
        }

        selected = element;
        selected.classList.add('selected');
    }

    e.stopPropagation();
}

function touchBackgroung() {
    if (!escaped) {
        if (selected != null) {
            selected.classList.remove('selected');
            selected = null;
        }
    }

    escaped = false;
}

function downElement(element, e) {
    if (captured == null) {
        captureElement(element, e);
        moved = false;
        dbclicked = false;
    }
}

function moveElement(e) {
    if (captured != null) {
        captured.style.left = (e.clientX + deltaX) + 'px';
        captured.style.top = (e.clientY + deltaY) + 'px';
        moved = true;
    }
}

function cancel() {
    if (captured != null) {
        captured.style.left = startX + 'px';
        captured.style.top = startY + 'px';
        captured = null;
    }
}

function resize(e) {
    let width = Math.abs(e.touches[0].clientX - e.touches[1].clientX);
    let height = Math.abs(e.touches[0].clientY - e.touches[1].clientY);

    resized.style.width = Math.max(width, minWidth) + 'px';
    resized.style.height = Math.max(height, minHeight) + 'px';

    resized.style.left = Math.min(e.touches[0].clientX, e.touches[1].clientX) + 'px';
    resized.style.top = Math.min(e.touches[0].clientY, e.touches[1].clientY) + 'px';
}