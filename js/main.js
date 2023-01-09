/* almost ][ - 2k22-2k23 */

var glbMMU;
var glbCPU;
var glbVDC;
var glbCassette;
var glbDisk;
var glbDiskii;
var glbSpeaker;
var glbTotCycles=0;
var glbTapeSprite;

var glbLaunchGUI;
var glbTimeoutId;
var glbTypeOfRom="Apple ][+";
var glbDiskLoading=false;
var glbTapeLoading=false;
var glbGlow=0.0;

// fps counter
var frameTime = 0;
var lastLoop = new Date;
var thisLoop=undefined;
var glbScheduleInterval=10;

const appleiiFps=65;
const appleiiCPUSpeed=1022720;

//

function updateDebugger()
{
    var listOfOpcodes=[];
    glbCPU.debugOpcodes(15,listOfOpcodes);
    glbCPU.drawDebugInfo(listOfOpcodes,10,30);
}

function romselCallback(s)
{
    glbTypeOfRom=s;
}

function go()
{
    clearTimeout(glbTimeoutId);
    glbLaunchGUI.isActive=false;

    glbMMU.loadRoms(glbTypeOfRom);
    //document.getElementById("partyStarter").disabled = true;
    //document.getElementById("romversionSelect").disabled=true;
    setTimeout(preload,100);
}

function preload()
{
    // wait for rom's loading 

    if ((glbMMU.romsLoaded)&&(glbDiskii.romsLoaded))
    {
        glbCPU=new cpu6502(glbMMU);
        glbCPU.powerUp();   
        glbVDC=new apple2vdc();
        glbMMU.setVDC(glbVDC);
        glbSpeaker=new soundBeeper(appleiiCPUSpeed,appleiiFps);
        glbMMU.setSpeaker(glbSpeaker);
        glbMMU.setDiskII(glbDiskii);
        setTimeout(emulate,10);
    }
    else
    {
        // roms not loaded. wait another 100ms
        setTimeout(preload,100);
    }
}

function drawDiskTapeStatus()
{
    var cnvs = document.getElementById("a2display");
    var ctx = cnvs.getContext("2d");

    if (glbDiskLoading)
    {
        var diskImg=document.getElementById("diskIcon");
        ctx.shadowBlur=10.0*Math.abs(Math.sin(glbGlow));
        ctx.shadowColor="white";
        ctx.drawImage(diskImg,525,345);

        ctx.font='9px pixelsquare';
        ctx.fillStyle = 'white';
        ctx.textBaseline = 'top';
        ctx.fillText("trk"+glbDiskii.track.toString().padStart(2, '0'),524,372);        
    }
    else if (glbTapeLoading)
    {
        var tapeImg=document.getElementById("tapeIcon");
        ctx.shadowBlur=10.0*Math.abs(Math.sin(glbGlow));
        ctx.shadowColor="white";
        ctx.drawImage(tapeImg,525,360);
    }

    glbGlow+=0.05;
}

function emulate()
{
    var iniCycles=0;
    while (iniCycles<(appleiiCPUSpeed/appleiiFps))
    {
        var cycElapsed=glbCPU.executeOneOpcode();
        glbTotCycles+=cycElapsed;
        iniCycles+=cycElapsed;
        glbSpeaker.feed(cycElapsed);
        glbMMU.setCycles(glbTotCycles);
    }
    //updateDebugger();
    glbVDC.draw(glbMMU);
    if (glbMMU.cyclesWithoutCassetteRead>100)
    {
        //document.getElementById("tapeImg").style.display="none";
        glbTapeLoading=false;
    }
    else
    {
        glbTapeLoading=true;
    }
    if (glbMMU.cyclesWithoutDiskRead>1000000)
    {
        //document.getElementById("diskImg").style.display="none";
        //document.getElementById("trackSpan").style.display="none";
        glbDiskLoading=false;
    }
    else
    {
        glbDiskLoading=true;
    }

    drawDiskTapeStatus();

    // calc fps
    const filterStrength = 20;
    var thisFrameTime = (thisLoop=new Date) - lastLoop;
    frameTime+= (thisFrameTime - frameTime) / filterStrength;
    lastLoop = thisLoop;

    var fpsOut = document.getElementById('fpsSpan');
    var fpeez=(1000/frameTime).toFixed(1);
    fpsOut.innerHTML = "going at " + fpeez + " fps";

    if (fpeez<appleiiFps)
    {
        // accelerate!
        if (glbScheduleInterval>1) glbScheduleInterval--;
    }
    else if (fpeez>appleiiFps)
    {
        // brake!!!
        glbScheduleInterval++;
    }

    setTimeout(emulate,glbScheduleInterval);
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

        console.log("Loading tape ["+fname+"]");

		arrayBuffer = event.target.result;

        glbCassette=new cassette();
        glbCassette.loadMedia(arrayBuffer);
        glbMMU.setCassette(glbCassette);
	};
	fileReader.readAsArrayBuffer(fls[0]);	
}

function handleDiskUpload(fls)
{
	var arrayBuffer;
	var fileReader = new FileReader();
	fileReader.onload = function(event) 
	{
		var fname=document.getElementById("diskSelector").value;

		if ((fname.toLowerCase().indexOf(".nib")<0)&&(fname.indexOf(".")>0))
		{
			alert("You can only load .nib files");
			return;
		}

        console.log("Loading disk ["+fname+"]");

		arrayBuffer = event.target.result;

        glbDisk=new disk();
        glbDisk.loadMedia(arrayBuffer);
        glbDiskii.setDisk(glbDisk.theDisk);
	};
	fileReader.readAsArrayBuffer(fls[0]);	
}

function guiLoop()
{
    var canvas = document.getElementById("a2display");
    glbLaunchGUI.draw(canvas);

    glbTimeoutId=setTimeout(guiLoop,10);
}

window.onload = (event) => 
{
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
        else if (e.key=="Delete")
        {
            // pushbutton zero
            glbMMU.pushbutton0();
            e.preventDefault();
        }
		else if ((e.ctrlKey==true)&&(e.key=="b"))
		{
            // CTRL-B (RESET)
            glbMMU.pressKey(2);
            e.preventDefault();
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
        else if ((e.key=="'")||(e.key=="\\")||(e.key==";")||(e.key=="?")||(e.key=="^")||(e.key==">")||(e.key=="<")||(e.key=="#")||(e.key=="\/")||(e.key=="*")||(e.key==",")||(e.key=="!")||(e.key=="$")||(e.key=="(")||(e.key==")")||(e.key=="=")||(e.key=="\"")||(e.key==" ")||(e.key=="+")||(e.key=="-")||(e.key==":")||(e.key=="."))
        {
            glbMMU.pressKey(e.key.charCodeAt(0));
            e.preventDefault();
        }
		else if (e.key=="Enter")
		{
            glbMMU.pressKey(13);
            e.preventDefault();
        }
		else if ((e.key=="ArrowLeft")||(e.key=="Backspace"))
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
        else if (e.key=="ArrowRight")
        {
            glbMMU.pressKey(21);
            e.preventDefault();
        }
        else if (e.key=="Escape")
        {
            glbMMU.pressKey(27);
            e.preventDefault();
        }
    }

    glbDiskii=new disk2();
    glbMMU=new a2mmu();

    glbLaunchGUI=new launchGUI(go,romselCallback);
    glbTimeoutId=setTimeout(guiLoop,10);
}
