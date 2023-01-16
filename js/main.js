
/* 
    almost ][ - 2k22-2k23 

    TODO:
    - tom harte's processor tests
    - joystick handling code
    - audio migrated to AudioWorklet

    DONE:

    - solve the infinite memory usage in audio processor
    - alternative hi-res rendering method + gui switch
        
*/

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
var glbSoundOn=true;
var glb16kExp=true;
var glbDrawAlgo=true;
var glbDiskLoading=false;
var glbTapeLoading=false;
var glbGlow=0.0;

// fps counter
var frameTime = 0;
var lastLoop = new Date;
var thisLoop=undefined;
var glbScheduleInterval=16;

const appleiiFps=60;
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

function soundOnOffCallback(s)
{
    glbSoundOn=s;
}

function exp16Callback(s)
{
    glb16kExp=s;
}

function drawAlgoCallback(s)
{
    glbDrawAlgo=s;
}

function go()
{
    clearTimeout(glbTimeoutId);
    glbLaunchGUI.isActive=false;

    glbMMU.loadRoms(glbTypeOfRom);
    glbMMU.setLgc(glb16kExp);
    //document.getElementById("partyStarter").disabled = true;
    //document.getElementById("romversionSelect").disabled=true;
    setTimeout(preload,100);
}

function testCPUFunction()
{
    clearTimeout(glbTimeoutId);
    glbLaunchGUI.isActive=false;

    //var testRunner=new cpuTestRunner("tomhartetests/20.json"); // retest
    //{ "name": "20 55 13", "initial": { "pc": 379, "s": 125, "a": 158, "x": 137, "y": 52, "p": 230, "ram": [ [379, 32], [380, 85], [381, 19], [341, 173]]}, "final": { "pc": 341, "s": 123, "a": 158, "x": 137, "y": 52, "p": 230, "ram": [ [341, 173], [379, 32], [380, 125], [381, 1]]}, "cycles": [ [379, 32, "read"], [380, 85, "read"], [381, 19, "read"], [381, 1, "write"], [380, 125, "write"], [381, 1, "read"]] },
    //var testRunner=new cpuTestRunner("tomhartetests/40.json"); // retest RTI
    var testRunner=new cpuTestRunner("tomhartetests/1c.json"); // retest


}

function preload()
{
    // wait for rom's loading 

    if ((glbMMU.romsLoaded)&&(glbDiskii.romsLoaded))
    {
        glbCPU=new cpu6502(glbMMU);
        glbCPU.powerUp();   
        glbVDC=new apple2vdc(glbDrawAlgo);
        glbMMU.setVDC(glbVDC);
        glbSpeaker=new soundBeeper(appleiiCPUSpeed,appleiiFps,glbSoundOn);
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
    var ctx = cnvs.getContext("2d", { willReadFrequently: true });

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
    while (iniCycles<glbSpeaker.bufferLen)
    {
        var cycElapsed=glbCPU.executeOneOpcode();
        glbTotCycles+=cycElapsed;
        iniCycles+=cycElapsed;
        glbSpeaker.feed(cycElapsed);
        glbMMU.setCycles(glbTotCycles);
    }

    glbVDC.draw(glbMMU);
    glbMMU.update();

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

    if (fpeez<46)
    {
        // accelerate!
        if (glbScheduleInterval>1) glbScheduleInterval--;
    }
    else if (fpeez>46)
    {
        // brake!!!
        glbScheduleInterval++;
    }

    setTimeout(emulate,glbScheduleInterval);
    //setTimeout(emulate,16);
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
    glbTimeoutId=setTimeout(guiLoop,5);
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
        else if (e.key=="End")
        {
            glbMMU.joyLeft();
            e.preventDefault();
        }
        else if (e.key=="PageDown")
        {
            glbMMU.joyRight();
            e.preventDefault();
        }
        else if (e.key=="Home")
        {
            glbMMU.joyUp();
            e.preventDefault();
        }
        else if (e.key=="PageUp")
        {
            glbMMU.joyDown();
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

    document.onkeyup = function(e)
	{
		if (e.key=="End")
		{
            glbMMU.joyLeftRelease();
            e.preventDefault();
        }
        else if (e.key=="PageDown")
        {
            glbMMU.joyRightRelease();
            e.preventDefault();
        }
        else if (e.key=="Home")
        {
            glbMMU.joyUpRelease();
            e.preventDefault();
        }
        else if (e.key=="PageUp")
        {
            glbMMU.joyDownRelease();
            e.preventDefault();
        }
    }

    glbDiskii=new disk2();
    glbMMU=new a2mmu();

    glbLaunchGUI=new launchGUI(go,testCPUFunction,romselCallback,soundOnOffCallback,exp16Callback,drawAlgoCallback);
    glbTimeoutId=setTimeout(guiLoop,10);
}
