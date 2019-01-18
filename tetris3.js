var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                            window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
var canvas = document.getElementById ("canvas-id");
var screenSizeX = window.innerWidth, screenSizeY = window.innerHeight;
canvas.width = screenSizeX;
canvas.height = screenSizeY;
var context = canvas.getContext ("2d");
 
var barSizeY = 4;
var field = [], fieldSizeY = 30, fieldSizeX = 15, fieldColor = [];
var figures = [], figureSize = 10, figureNumber = 7;
var stoppedCell = 1, emptyCell = 0, figureCell = 2;//ostanalite otgovarqt na cvqt.
var currX, currY, currType, currFigure = [], currColor;
var enemyX = [], enemyY = [], enemyNumber = 7, enemyStartPosition = 15, enemyD = [], enemySpeed = [];
 
var isCurrStopped = false, isMovedLeft = false, isMovedRight = false;
var isPaused = false, isAlive = true, isStarted = true;
var left = 0, right = 1, speed = 4, updates = 0, points = 0, pointsForLine = 10;
var scale = 20; 
 
var backgroundColor = "#ffff66", enemyColor = "#000", linesColor = "#000099";
var colors = ["#8080ff", "#000099", "#ff0000",  "#e68a00", "#ff3399", "#fff000", "#00b300"];
//colors[0] - fon na poleto
//colors[1] - ramka
var colorNumber = 5, firstColor = 2;

window.addEventListener ("resize", function ()
{
	screenSizeX = window.innerWidth;
	screenSizeY = window.innerHeight;
	canvas.width = screenSizeX;
	canvas.height = screenSizeY;
}, true);
 
function setEnemyPosition (i)
{
    enemySpeed [i] = Math.floor (Math.random () * 10 / 6) + 1;
    enemyX [i] = -enemyStartPosition;
    enemyY [i] = Math.floor (Math.random () * (fieldSizeY - 1 - barSizeY)) + barSizeY;
    enemyD [i] = 1;
    if (Math.random () > 0.5)
	{
        enemyX [i] *= -1;
		enemyX [i] += fieldSizeX;
        enemyD [i] *= -1;
    }
}
 
 function centerCurrFigure ()
 {
	var minX = figureSize + 1, minY = figureSize + 1, maxX = -1, maxY = -1;
	var copy = [], mid = Math.floor (figureSize / 2), diffX, diffY, newX, newY;
	for (var x = 0; x < figureSize; x ++)
	{
		copy [x] = [];
		for (var y = 0; y < figureSize; y ++)
		{
			copy [x][y] = emptyCell;
			if (currFigure [x][y] == figureCell)
			{
				if (x < minX)
				{
					minX = x;
				}
				if (x > maxX)
				{
					maxX = x;
				}
				if (y < minY)
				{
					minY = y;
				}
				if (y > maxY)
				{
					maxY = y;
				}
			}
		}
	}
	diffX = maxX - minX + 1;
	diffY = maxY - minY + 1;
	newX = mid - Math.floor (diffX / 2);
	newY = mid - Math.floor (diffY / 2);
	var i = minX, j = minY;
	for (var x = newX; x < figureSize && i < figureSize; x ++)
	{
		j = minY;
		for (var y = newY; y < figureSize && j < figureSize; y ++)
		{
			copy [x][y] = currFigure [i][j];
			j ++;
		}
		i ++;
	}
	for (var x = 0; x < figureSize; x ++)
	{
		for (var y = 0; y < figureSize; y ++)
		{
			currFigure [x][y] = copy [x][y];
		}
	}
	currX -= (newX - minX);
	currY -= (newY - minY);
 }
 
function enemyColision ()
{
    for (var i = 0; i < enemyNumber; i ++)
	{
        if (enemyX [i] < 1 || enemyX [i] > fieldSizeX - 2) ///ako oste ne e vleznalo  poleto, ne proverqva dali se buta v nesto
		{
            continue;
        }
        if (field [enemyX[i]][enemyY[i]] == stoppedCell)
		{
            setEnemyPosition(i);
        } 
		else
		{
            var isItReady = false;
            for (var y = 0; y < figureSize; y++)
			{
                if (isItReady)
				{
                    break;
                }
                for (var x = 0; x < figureSize; x++)
				{
                    if (isItReady)
					{
                        break;
                    }
 
                    if (currFigure [x][y] == figureCell && (x + currX == enemyX [i] && y + currY == enemyY [i]))
					{
                        isItReady = true;
                        if (enemyD [i] > 0)
						{
							var canItMove = true;
							for (var curr = figureSize - 1; curr > 0; curr --)
							{
								if (currFigure [curr][y] == figureCell)
								{
									if (field [currX + curr + 1][currY + y] == stoppedCell)
									{
										canItMove = false;
									}
									break;
								}
							}
							if (canItMove)
							{
								for (var curr = figureSize - 1; curr > 0; curr --)
								{
									currFigure [curr][y] = currFigure [curr - 1][y];
								}
								currFigure [0][y] = emptyCell;
								centerCurrFigure();
							}
                        }
						else if (enemyD [i] < 0)
						{
							var canItMove = true;
							for (var curr = 1; curr < figureSize; curr ++)
							{
								if (currFigure [curr][y] == figureCell)
								{
									if (field [currX + curr - 1][currY + y] == stoppedCell)
									{
										canItMove = false;
									}
									break;
								}
							}
							if (canItMove)
							{
								for(var curr = 0; curr < figureSize - 1; curr ++)
								{
									currFigure [curr][y] = currFigure [curr + 1][y];
								}
								currFigure [curr][figureSize - 1] = emptyCell;
								centerCurrFigure();
							}
                        }
                        setEnemyPosition (i);
                    }
                }
            }
        }
    }
}
 
function fullLine (index)
{
    for (var x = 0; x < fieldSizeX; x ++)
	{
        if (field [x][index] != stoppedCell)
		{
            return 0;
        }
    }
    for (var y = index; y > 1; y --)
	{
        for (var x = 0; x < fieldSizeX; x ++)
		{
            field [x][y] = field [x][y - 1];
            fieldColor [x][y] = fieldColor [x][y - 1];
        }
    }
 
    return 1;
}
 
function tryToRotate (which)
{
    var newCurr = [], newX, newY, maxX = 0, maxY = 0, minY = figureSize, minX = figureSize;
 
    for (var x = 0; x < figureSize; x ++)
	{
        newCurr [x] = [];
        for(var y = 0; y < figureSize; y ++)
		{
            newCurr [x][y] = 0;
            if (currFigure [x][y])
			{
                if (x > maxX)
				{
                    maxX = x;
                }
                if (y > maxY)
				{
                    maxY = y;
                }
                if (x < minX)
				{
                    minX = x;
                }
                if (y < minY)
				{
                    minY = y;
                }
            }
        }
    }
    for (var x = 0; x <= maxX; x ++)
	{
        for (var y = 0; y <= maxY; y ++)
		{
            if (which == left)
			{
                newX = (maxY - y + minY) % figureSize;
                newY = x;
            } 
			else
			{
                newX = y;
                newY = (maxX - x + minX) % figureSize;
            }
 
            newCurr [newX][newY] = currFigure [x][y];
        }
    }
    for (var x = 0; x < figureSize; x ++)
	{
        for (var y = 0; y < figureSize; y ++)
		{
            currFigure [x][y] = newCurr [x][y];
        }
    }
}
 
function rotate ()
{
    tryToRotate (left);
    for (var y = 0; y < figureSize; y ++)
	{
        for (var x = 0; x < figureSize; x ++)
		{
            if (currFigure [x][y] == figureCell && field [currX + x][currY + y] == stoppedCell)
			{
                tryToRotate (right);
                return 0;
            }
        }
    }
 
    return 1;
}
 
function move (directionX, directionY)
{
    currX += directionX;
    currY += directionY;
    for (var y = 0; y < figureSize; y ++)
	{
        for (var x = 0; x < figureSize; x ++)
		{
            if (currFigure [x][y] == figureCell && field [currX + x][currY + y] == stoppedCell)
			{				
                currX -= directionX;
                currY -= directionY;
                return 0;
            }
        }
    }
    return 1;
}
 
function chooseNewRandomFigure ()
{
    currType = Math.floor (Math.random () * figureNumber);
    currX = Math.floor (fieldSizeX / 2 - figureSize / 2);
    currY = -3;
    currColor = firstColor + Math.floor (Math.random () * colorNumber);
    for (var y = 0; y < figureSize; y ++)
	{
        for (var x = 0; x < figureSize; x ++)
		{
            currFigure [x][y] = figures [currType][x][y];
        }
    }
    isCurrStopped = false;
	centerCurrFigure();
}
 
function stopFigure ()
{
	var blockCount = 0;
    for (var y = 0; y < figureSize; y ++)
	{
        for (x = 0; x < figureSize; x ++)
		{
            if (currFigure [x][y] == figureCell)
			{
				blockCount ++;
                field [x + currX][y + currY] = stoppedCell;
                fieldColor [x + currX][y + currY] = currColor;
            }
        }
    }
	for(var y = 0; y <= 4; y ++)
	{
		for (var x = 1; x < fieldSizeX-1; x ++)
		{
			if (field [x][y] == stoppedCell)
			{
				isAlive = false;
			}
		}
	}
	return blockCount;
}
 
function restart ()
{
    isCurrStopped = false;
    isMovedLeft = false;
    isMovedRight = false;
    isPaused = false;
    isAlive = true;
    updates = 0;
    points = 0;
 
    for (var i = 0; i < figureNumber; i ++)
    {
        figures [i] = [];
        for (var x = 0; x < figureSize; x ++)
        {
            figures [i][x] = [];
            for (var y = 0; y < figureSize; y ++)
            {
                figures [i][x][y] = 0;
            }
        }
    }
 
    for (var y = 0; y < fieldSizeX; y ++)
    {
        field [y] = [];
        fieldColor [y] = [];
        for (var x = 0; x < fieldSizeY; x ++)
        {
            field [y][x] = 0;
            fieldColor [y][x] = 0;
        }
    }
 
    var midd = Math.floor (figureSize / 2);
	
    //kvadrat
    figures [0][midd - 1][midd - 1] = figureCell;
    figures [0][midd - 1][midd] = figureCell;
    figures [0][midd][midd - 1] = figureCell;
    figures [0][midd][midd] = figureCell;
 
    //pochti kur
    figures [1][midd - 2][midd] = figureCell;
    figures [1][midd - 1][midd] = figureCell;
    figures [1][midd][midd] = figureCell;
    figures [1][midd - 1][midd - 1] = figureCell;
 
    //kur
    figures [2][midd - 2][midd] = figureCell;
    figures [2][midd - 1][midd] = figureCell;
    figures [2][midd][midd] = figureCell;
    figures [2][midd - 1][midd - 1] = figureCell;
    figures [2][midd - 1][midd - 2] = figureCell;
 
    //liniq
    figures [3][midd - 2][midd - 1] = figureCell;
    figures [3][midd - 1][midd - 1] = figureCell;
    figures [3][midd][midd - 1] = figureCell;
    figures [3][midd + 1][midd - 1] = figureCell;
 
    //stranno
    figures [4][midd - 2][midd - 1] = figureCell;
    figures [4][midd - 1][midd - 1] = figureCell;
    figures [4][midd - 1][midd] = figureCell;
    figures [4][midd][midd] = figureCell;
 
    //G sturchasto
    figures [5][midd - 2][midd - 1] = figureCell;
    figures [5][midd - 2][midd] = figureCell;
    figures [5][midd - 1][midd] = figureCell;
    figures [5][midd][midd] = figureCell;
 
    //G lezasto
    figures [6][midd - 2][midd - 1] = figureCell;
    figures [6][midd - 1][midd - 1] = figureCell;
    figures [6][midd][midd - 1] = figureCell;
    figures [6][midd][midd] = figureCell;
 
 
    for (var x = 0; x < figureSize; x ++)
    {
        currFigure [x] = [];
        for (var y = 0; y < figureSize; y ++)
        {
            currFigure [x][y] = 0;
        }
    }
    chooseNewRandomFigure ();
 
    for (var y = 0; y < fieldSizeY; y ++)
    {
        field [0][y] = stoppedCell;
        field [fieldSizeX - 1][y] = stoppedCell;
        fieldColor [0][y] = stoppedCell;
        fieldColor [fieldSizeX - 1][y] = stoppedCell;
    }
 
    for (var x = 0; x < fieldSizeX; x ++)
    {
        // field [x][0] = stoppedCell;
        field [x][fieldSizeY - 1] = stoppedCell;
        fieldColor [x][fieldSizeY - 1] = stoppedCell;
    }
    for (var i = 0; i < enemyNumber; i ++)
    {
        setEnemyPosition(i);
    }
}
restart ();
 
window.addEventListener ("keydown", function (args)
{
    //console.log (args.keyCode);
	if (!isPaused)
	{
		if (args.keyCode == 37) //strelka nalqvo
		{
			move (-1, 0);
		}
	 
		if (args.keyCode == 39)  //strelka nadqsno
		{
			move (1, 0);
		}
	 
		if (args.keyCode == 40) //strelka nadolu
		{
			move (0, 1);
		}
	 
		if (args.keyCode == 38) //strelka nagore
		{ 
			rotate ();
		}
	}
	if (args.keyCode == 82) //r
	{
		restart ();
		//rotate ();
	}
    if (args.keyCode == 80) //p
	{ 
        isPaused = !isPaused;
        //rotate ();
    }
 
}, false);
 
function update()
{
    if (isAlive && !isPaused && isStarted)
    {
        updates ++;
        for (i = 0; i < enemyNumber; i++)
        {
            if (updates % enemySpeed[i] == 0)
            {
                enemyX [i] += enemyD [i];
            }
            if (enemyX [i] > enemyStartPosition + fieldSizeX || enemyX [i] < -enemyStartPosition)
            {
                setEnemyPosition (i);
            }
        }
        enemyColision ();
        if (updates % speed == 0)
        {
            updates = 0;
            if (isCurrStopped)
            {
                chooseNewRandomFigure ();
            }
            if (!move (0, 1))
            {
                isCurrStopped = true;
            }
            if (isCurrStopped)
            {
                points += stopFigure ();
            }
            for (var y = fieldSizeY - 2; y > 0; y --)
            {
                if (fullLine (y))
                {
                    y ++;
                    points += (pointsForLine * fieldSizeX);
                }
            }
        }
    }
    setTimeout (update, 60);
}
 
function draw ()
{
	var positionX = Math.floor (screenSizeX / 2 - (fieldSizeX * scale / 2));
	var positionY = Math.floor (screenSizeY / 2 - (fieldSizeY * scale / 2));
    
	context.clearRect (0, 0, canvas.width, canvas.height);
    context.globalAlpha = 1;
 
    context.fillStyle = backgroundColor;
    context.fillRect (0, 0, screenSizeX, screenSizeY);
	
    context.fillStyle = linesColor;
    context.fillRect (positionX, positionY, fieldSizeX * scale, fieldSizeY * scale);
    for (var y = 0; y < fieldSizeY; y ++)
	{
        for (var x = 0; x < fieldSizeX; x ++)
		{
            context.fillStyle = colors [fieldColor [x][y]];
            context.fillRect (positionX + x * scale + 1, positionY + y * scale + 1, scale - 1, scale - 1);
        }
    }
	
    context.fillStyle = linesColor;
    context.fillRect (positionX, positionY, fieldSizeX * scale, barSizeY * scale);
    context.fillStyle = colors [currColor];
    for (var y = 0; y < figureSize; y ++)
	{
        for (x = 0; x < figureSize; x ++)
		{
            if (currFigure [x][y] == figureCell)
			{
                context.fillRect (positionX + (currX + x) * scale, positionY + (currY + y) * scale, scale, scale);
            }
        }
    }
 
    context.fillStyle = enemyColor;
    for (i = 0; i < enemyNumber; i++)
	{
        context.fillRect (positionX + enemyX [i] * scale, positionY + enemyY [i] * scale, scale, scale);
    }
 
    if (!isAlive)
    {
        context.fillStyle = "#000";
        context.font="40pt Monospace";
        context.fillText("GAME OVER", positionX + scale, positionY + 15 * scale);
        context.font="30pt Monospace";
        context.fillText("Press R to", positionX + 2 * scale, positionY + 19 * scale);
        context.fillText("restart", positionX + 4 * scale, positionY + 21 * scale);
    }
 
    context.fillStyle = colors [0]; 
    context.font="18pt Monospace";
    context.fillText("Points: " + points, positionX + scale, positionY + scale * 2);
    //context.fillText(points, positionX + scale * 5, positionY + scale * 2);
 
    requestAnimationFrame (draw);
}
 
update ();
draw ();
