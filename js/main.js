/* almost ][ - 2k22 */

var glbMMU;
var glbCPU;
var glbVDC;
var glbCassette;
var glbTotCycles=0;
var glbTapeSprite;

// fps counter
var frameTime = 0;
var lastLoop = new Date;
var thisLoop=undefined;

//

function updateDebugger()
{
    var listOfOpcodes=[];
    glbCPU.debugOpcodes(15,listOfOpcodes);
    glbCPU.drawDebugInfo(listOfOpcodes,10,30);
}

function initCPU()
{
    glbCPU.powerUp();   
}

function go()
{
    // good tapes: https://cowgod.org/apple2/tapes/
    glbCassette=new cassette();
    glbCassette.loadMedia("tapes/applevision.wav");
    //glbCassette.loadMedia("tapes/supermath.wav");
    //glbCassette.loadMedia("tapes/color-demos.wav");
    //glbCassette.loadMedia("tapes/breakout.wav");
    //glbCassette.loadMedia("tapes/hangman.wav"); 
    //glbCassette.loadMedia("tapes/Telepong.wav"); 
    glbMMU.setCassette(glbCassette);
    glbMMU.setVDC(glbVDC);

    document.getElementById("tapeImg").src="img/minitape.gif";

    setTimeout(emulate,100);
}

function emulate()
{
    for (var c=0;c<10000;c++)
    {
        glbTotCycles+=glbCPU.executeOneOpcode();
        glbMMU.setCycles(glbTotCycles);
    }
    //updateDebugger();
    glbVDC.draw(glbMMU);

    // calc fps
    const filterStrength = 20;
    var thisFrameTime = (thisLoop=new Date) - lastLoop;
    frameTime+= (thisFrameTime - frameTime) / filterStrength;
    lastLoop = thisLoop;

    var fpsOut = document.getElementById('fpsSpan');
    var fpeez=(1000/frameTime).toFixed(1);
    fpsOut.innerHTML = fpeez + " fps";

    setTimeout(emulate,10);
}

window.onload = (event) => 
{
    glbMMU=new a2mmu();
    glbCPU=new cpu6502(glbMMU);
    glbVDC=new apple2vdc();

    document.onkeydown = function(e)
	{
		if (e.key=="F10")
		{
            /*for (var c=0;c<1000;c++)
            {
                glbCPU.executeOneOpcode();
            }
            updateDebugger();
            drawTextMode();
            e.preventDefault();*/
        }
		else if ((e.ctrlKey==true)&&(e.key=="c"))
		{
            // CTRL-C
            glbMMU.pressKey(3);
            e.preventDefault();
        }
		else if ((e.key>="a")&&(e.key<="z"))
		{
            glbMMU.pressKey(e.key.toUpperCase().charCodeAt(0));
            e.preventDefault();
        }
		else if ((e.key>="0")&&(e.key<="9"))
		{
            glbMMU.pressKey(e.key.charCodeAt(0));
            e.preventDefault();
        }
        else if ((e.key=="\\")||(e.key==";")||(e.key=="?")||(e.key=="^")||(e.key==">")||(e.key=="<")||(e.key=="#")||(e.key=="\/")||(e.key=="*")||(e.key==",")||(e.key=="!")||(e.key=="$")||(e.key=="(")||(e.key==")")||(e.key=="=")||(e.key=="\"")||(e.key==" ")||(e.key=="+")||(e.key=="-")||(e.key==":")||(e.key=="."))
        {
            glbMMU.pressKey(e.key.charCodeAt(0));
            e.preventDefault();
        }
		else if (e.key=="Enter")
		{
            glbMMU.pressKey(13);
            e.preventDefault();
        }
		else if (e.key=="Backspace")
		{
            glbMMU.pressKey(8);
            e.preventDefault();
        }
        else if (e.key=="ArrowDown")
        {
            glbMMU.pressKey(10);
            e.preventDefault();
        }
        else if (e.key=="ArrowUp")
        {
            glbMMU.pressKey(11);
            e.preventDefault();
        }
    }

    setTimeout(initCPU,100);
}
