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

function go()
{
    document.getElementById("partyStarter").disabled = true;
    setTimeout(preload,100);
}

function preload()
{
    // wait for rom's loading 
    
    if (glbMMU.romsLoaded)
    {
        glbCPU=new cpu6502(glbMMU);
        glbCPU.powerUp();   
        glbVDC=new apple2vdc();
        glbMMU.setVDC(glbVDC);
        setTimeout(emulate,10);
    }
    else
    {
        // roms not loaded. wait another 100ms
        setTimeout(preload,100);
    }
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
    if (glbMMU.cyclesWithoutCassetteRead>100)
    {
        document.getElementById("tapeImg").style.display="none";
    }

    // calc fps
    const filterStrength = 20;
    var thisFrameTime = (thisLoop=new Date) - lastLoop;
    frameTime+= (thisFrameTime - frameTime) / filterStrength;
    lastLoop = thisLoop;

    var fpsOut = document.getElementById('fpsSpan');
    var fpeez=(1000/frameTime).toFixed(1);
    fpsOut.innerHTML = "going at " + fpeez + " fps";

    setTimeout(emulate,10);
}

function handleFileUpload(fls)
{
	var arrayBuffer;
	var fileReader = new FileReader();
	fileReader.onload = function(event) 
	{
		var fname=document.getElementById("tapeSelector").value;

		if ((fname.toLowerCase().indexOf(".wav")<0)&&(fname.indexOf(".")>0))
		{
			alert("You can only load .wav files");
			return;
		}

		arrayBuffer = event.target.result;

        // good tapes: https://cowgod.org/apple2/tapes/
        glbCassette=new cassette();
        glbCassette.loadMedia(arrayBuffer);
        glbMMU.setCassette(glbCassette);
	};
	fileReader.readAsArrayBuffer(fls[0]);	
}

window.onload = (event) => 
{
    glbMMU=new a2mmu();

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
        else if (e.key=="Escape")
        {
            glbMMU.pressKey(27);
            e.preventDefault();
        }
    }

    const splashImg=document.getElementById("splashImg");
    var canvas = document.getElementById("a2display");
    var ctx = canvas.getContext("2d");
    ctx.drawImage(splashImg,0,0);
}
