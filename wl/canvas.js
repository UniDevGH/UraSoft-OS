const $ = mdui.$;

var canvas = $('#canvas')[0];
var cxt = canvas.getContext('2d');

var bgcolor = '#323030';
canvas.style.backgroundColor = bgcolor;

// init
var undoStack = [];
var redoStack = [];
var line = { lw: 3, sc: '#fff', fc: '#fff' };
var type = 1;
var fullscreen = false;

btncolor = '#f0f8ffdd';
btncoloron = '#a7dcfddd';

function setLine(obj) {
    cxt.lineWidth = obj.lw;
    cxt.strokeStyle = obj.sc;
    cxt.fillStyle = obj.fc;
}

function setBrush() {
    type = 1;
    refreshToolBtn();
    cxt.beginPath();
    setLine(line);
    var flag = false;
    canvas.onmousedown = function (e) {
        addUndo();
        flag = true;
        var startx = e.pageX ;
        var starty = e.pageY;
        cxt.moveTo(startx, starty);
    }
    canvas.onmousemove = function (e) {
        var endx = e.pageX;
        var endy = e.pageY;
        if (flag) {
            cxt.lineTo(endx, endy);
            cxt.stroke();
        }
    }
    canvas.onmouseup = function () {
        flag = false;
    }
    cxt.closePath();
}

function setEraser() {
    type = 2;
    refreshToolBtn();
    cxt.beginPath();
    setLine({ lw: 20, sc: bgcolor, fc: bgcolor });
    var flag = false;
    canvas.onmousedown = function (e) {
        addUndo();
        flag = true;
        var startx = e.pageX;
        var starty = e.pageY;
        cxt.moveTo(startx, starty);
    }
    canvas.onmousemove = function (e) {
        var endx = e.pageX;
        var endy = e.pageY;
        if (flag) {
            cxt.arc(e.pageX, e.pageY, 10, 0, 2 * Math.PI); // x, y, radius
            cxt.stroke();
        }

    }
    canvas.onmouseup = function () {
        flag = false;
    }
    cxt.closePath();
}

function clearCanvas() {
    cxt.beginPath();
    cxt.strokeStyle = bgcolor;
    cxt.fillStyle = bgcolor;
    cxt.fillRect(0, 0, 10000, 10000);
    setLine(line)
    cxt.closePath();
}

function saveCanvas() {
    data = canvas.toDataURL();
    window.localStorage.data = data;
    console.log(window.localStorage.data);
}

function addUndo() {
    data = canvas.toDataURL();
    const img = new Image();
    img.src = data;
    undoStack.push(img);
    if (undoStack.length > 20) {
        undoStack.shift(); // 至多撤销20条
    }
}

function addRedo() {
    data = canvas.toDataURL();
    const img = new Image();
    img.src = data;
    redoStack.push(img);
    if (redoStack.length > 20) {
        redoStack.shift();
    }
}

function undo() {
    const img = undoStack.pop();
    if (img) {
        addRedo();
        clearCanvas();
        cxt.drawImage(img, 0, 0);
    }
}

function redo() {
    const img = redoStack.pop();
    if (img) {
        addUndo();
        clearCanvas();
        cxt.drawImage(img, 0, 0);
    }
}

function exitFullScreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    } else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
    }
    fullscreen = false;
    refreshFsBtn();
}

function requestFullscreen() {
    const docElm = document.documentElement
    if (docElm.requestFullscreen) {
        docElm.requestFullscreen();
    } else if (docElm.msRequestFullscreen) {
        docElm.msRequestFullscreen();
    } else if (docElm.mozRequestFullScreen) {
        docElm.mozRequestFullScreen();
    } else if (docElm.webkitRequestFullScreen) {
        docElm.webkitRequestFullScreen();
    }
    fullscreen = true;
    refreshFsBtn();
}

function refreshFsBtn() {
    if (fullscreen) {
        document.getElementById('btn-fs').style.display = 'none';
        document.getElementById('btn-efs').style.display = 'block';
    } else {
        document.getElementById('btn-fs').style.display = 'block';
        document.getElementById('btn-efs').style.display = 'none';
    }
}

function refreshToolBtn() {
    if (type == 1) {
        document.getElementById('btn-brush').style.cssText += 'background-color: ' + btncoloron + ' !important';
        document.getElementById('btn-eraser').style.cssText += 'background-color: ' + btncolor + ' !important';
    } else if (type == 2) {
        document.getElementById('btn-brush').style.cssText += 'background-color: ' + btncolor + ' !important';
        document.getElementById('btn-eraser').style.cssText += 'background-color: ' + btncoloron + ' !important';
    }
}

function closeWindow() {
    let userAgent = navigator.userAgent;
    if (userAgent.indexOf('Firefox') > -1 || userAgent.indexOf('Chrome') > -1) {
        window.location.href = 'about:blank';
        window.close();
    } else {
        window.opener = null;
        window.open('', '_self');
        window.close();
    }
}

function setLineWidth() {
    let slider = document.getElementById('slider-lw');
    line.lw = slider.value;
    setLine(line);
}

function setLineColor() {
    let color = document.getElementById('select-color');
    line.sc = line.fc = color.value;
    setLine(line);
}

// 大小改变
window.onresize = function () {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    undo();
    setLine(line);
}

// 打开页面
window.onload = function () {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    console.log(window.localStorage.data);
    if (window.localStorage.data) {
        const img = new Image();
        img.src = window.localStorage.data;
        cxt.beginPath();
        cxt.drawImage(img, 0, 0);
        cxt.closePath();
    }
    setBrush();
    refreshFsBtn();
}

// 键盘事件
document.onkeydown = function (e) {
    if (e.ctrlKey || e.metaKey) {
        if (e.keyCode == '90') {
            undo();
        } else if (e.keyCode == '89') {
            redo();
        } else if (e.altKey) {
            // 切换画笔
            type = (type == 1) ? 2 : 1;
            (type == 1) ? setBrush() : setEraser();
        }
    }
}