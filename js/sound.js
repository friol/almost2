/* apple's ii sound beeper */

class soundBeeper
{
    constructor(cpuspeed,fps,sndOn)
    {
        this.speakerState=0; // 0 low, 1 high

        try 
        {
            this.audioEnabled=sndOn;

            var self=this;
            this.webAudioAPIsupported=true;
    
            window.AudioContext = window.AudioContext||window.webkitAudioContext;
            this.context = new AudioContext();
    
            this.audioBufSize=1024;
            this.jsNode = this.context.createScriptProcessor(this.audioBufSize, 0, 1);
            this.jsNode.onaudioprocess = function(e)
            {
                self.mixFunction(e);
            }
            this.jsNode.connect(this.context.destination);

            this.callFreq=this.context.sampleRate/this.audioBufSize;
            this.bufferLen=Math.floor(cpuspeed/this.callFreq);
            this.bufferPos=0;
    
            /*this.audioBuffer=new Array(this.bufferLen*64);
            for (var s=0;s<this.bufferLen*64;s++)
            {
                this.audioBuffer[s]=0.0;
            }*/
            this.audioQueue=[];

            this.audioInitialized=true;
        }
        catch(e) 
        {
            alert('Error: Web Audio API is not supported in this browser. Buy a new one ['+e.toString()+']');
            this.webAudioAPIsupported=false;
        }        
    }

    feed(numCycles)
    {
        for (var s=0;s<numCycles;s++)
        {
            this.audioQueue.push(this.speakerState);
            //this.audioBuffer[this.bufferPos]=this.speakerState;
            //this.bufferPos+=1;
            /*if (this.bufferPos>=this.bufferLen)
            {
                alert("azz");
            }*/
        }        
    }

    toggleSpeaker(cycles)
    {
        if (this.speakerState==0) this.speakerState=1;
        else this.speakerState=0;
    }

    mixFunction(e)
    {
        if (!this.audioEnabled) 
        {
            this.bufferPos=0;
            return;
        }

        if (!this.audioInitialized) return;

        if (this.audioQueue.length<this.bufferLen) return;

        var data = e.outputBuffer.getChannelData(0);

        // resample

        var realPos=0;
        var realStep;
        realStep=this.bufferLen/data.length;
        //console.log(this.bufferPos-this.bufferLen);

        for (var s=0;s<data.length;s++)
        {
            //data[s]=this.audioBuffer[parseInt(realPos.toFixed(0),10)];
            data[s]=this.audioQueue[parseInt(realPos.toFixed(0),10)];
            realPos+=realStep;
        }

        this.audioQueue=[];
        this.bufferPos=0;
    }
}
