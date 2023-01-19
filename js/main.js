
/* 
    almost ][ - 2k22-2k23 

    TODO:
    - joystick handling code
    - mixed hi res mode
    - audio migrated to AudioWorklet
    - fix the damn 16k interface

    DONE:

    - tom harte's processor tests (documented opcodes)
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
var glbMaxSpeed=false;

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

const appleiiFps=59.9227;
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

    const documentedOpcodes=[
        0x00,0x01,0x05,0x06,0x08,0x09,0x0a,0x0d,0x0e,0x10,0x11,0x15,0x16,0x18,0x19,0x1d,0x1e,
        0x20,0x21,0x24,0x25,0x26,0x28,0x29,0x2a,0x2c,0x2d,0x2e,0x30,0x31,0x35,0x36,0x38,0x39,0x3d,0x3e,
        0x40,0x41,0x45,0x46,0x48,0x49,0x4a,0x4c,0x4d,0x4e,0x50,0x51,0x55,0x56,0x58,0x59,0x5d,0x5e,
        0x60,0x61,0x65,0x66,0x68,0x69,0x6a,0x6c,0x6d,0x6e,0x70,0x71,0x75,0x76,0x78,0x79,0x7d,0x7e,
        0x81,0x84,0x85,0x86,0x88,0x8a,0x8c,0x8e,0x8d,0x90,0x91,0x94,0x95,0x96,0x98,0x99,0x9a,0x9d,
        0xa0,0xa1,0xa2,0xa4,0xa5,0xa6,0xa8,0xa9,0xaa,0xac,0xae,0xad,0xb0,0xb1,0xb4,0xb5,0xb6,0xb8,0xb9,0xba,0xbc,0xbd,0xbe,
        0xc0,0xc1,0xc4,0xc5,0xc6,0xc8,0xc9,0xca,0xcc,0xcd,0xce,0xd0,0xd1,0xd5,0xd6,0xd8,0xd9,0xdd,0xde,
        0xe0,0xe1,0xe4,0xe5,0xe6,0xe8,0xe9,0xea,0xec,0xed,0xee,0xf0,0xf1,0xf5,0xf6,0xf8,0xf9,0xfd,0xfe
    ];

    for (var testNum=0;testNum<documentedOpcodes.length;testNum++)
    {
        const testJson="tomhartetests/"+documentedOpcodes[testNum].toString(16).padStart(2,'0')+".json";
        var testRunner=new cpuTestRunner(testJson);
    }
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
    var cycles2feed=Math.floor((glbSpeaker.callFreq*glbSpeaker.bufferLen)/appleiiFps);
    while (iniCycles<cycles2feed)
    {
        var cycElapsed=glbCPU.executeOneOpcode();
        glbTotCycles+=cycElapsed;
        iniCycles+=cycElapsed;
        if (!glbMaxSpeed) glbSpeaker.feed(cycElapsed);
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

    glbLaunchGUI.draw(document.getElementById("a2display"));

    // calc fps
    const filterStrength = 20;
    var thisFrameTime = (thisLoop=new Date) - lastLoop;
    frameTime+= (thisFrameTime - frameTime) / filterStrength;
    lastLoop = thisLoop;

    var fpsOut = document.getElementById('fpsSpan');
    var fpeez=(1000/frameTime).toFixed(1);
    fpsOut.innerHTML = "going at " + fpeez + " fps";

    if (!glbMaxSpeed)
    {
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
    }

    if (!glbMaxSpeed)
    {
        setTimeout(emulate,glbScheduleInterval);
    }
    else
    {
        setTimeout(emulate,0);
    }
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

function fullscreenchanged(event) 
{
    if (!document.fullscreenElement) 
    {
        document.getElementById("titleDiv").style.display="block";
        document.getElementById("taglineDiv").style.display="block";
        document.getElementById("a2display").style.position="relative";
        //document.getElementById("a2display").style.left=0;
        //document.getElementById("a2display").style.top=0;
        document.getElementById("a2display").style.width="";
        document.getElementById("a2display").style.height="";
    }
  };

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
        else if (e.key=="\\")
        {
            glbMaxSpeed=true;
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
        else if (e.key=="\\")
        {
            glbMaxSpeed=false;
        }
    }

    document.addEventListener('fullscreenchange', fullscreenchanged);

    glbDiskii=new disk2();
    glbMMU=new a2mmu();

    glbLaunchGUI=new launchGUI(go,testCPUFunction,romselCallback,soundOnOffCallback,exp16Callback,drawAlgoCallback);
    glbTimeoutId=setTimeout(guiLoop,10);
}
