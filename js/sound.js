/* apple's ii sound beeper */

class soundBeeper
{
    constructor(cpuspeed,fps)
    {
        this.cushion=10;
        this.bufferLen=Math.floor(cpuspeed/fps)+this.cushion;
        this.bufferPos=0;

        this.audioBufSize=1024;

        this.audioBuffer=new Array(this.bufferLen);
        for (var s=0;s<this.bufferLen;s++)
        {
            this.audioBuffer[s]=0.0;
        }

        this.speakerState=0; // 0 low, 1 high

        try 
        {
            this.audioEnabled=true;
            //this.audioEnabled=false;
            //return;

            var self=this;
            this.webAudioAPIsupported=true;
    
            window.AudioContext = window.AudioContext||window.webkitAudioContext;
            this.context = new AudioContext();
    
            this.jsNode = this.context.createScriptProcessor(this.audioBufSize, 0, 1);
            this.jsNode.onaudioprocess = function(e)
            {
                self.mixFunction(e);
            }
    
            this.jsNode.connect(this.context.destination);

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
            if (this.bufferPos<this.bufferLen)
            {
                this.audioBuffer[this.bufferPos]=this.speakerState;
                this.bufferPos+=1;
            }
        }        
    }

    toggleSpeaker()
    {
        if (this.speakerState==0) this.speakerState=1;
        else this.speakerState=0;
    }

    mixFunction(e)
    {
        if (!this.audioEnabled) return;
        if (!this.audioInitialized) return;

        var data = e.outputBuffer.getChannelData(0);

        // resample
        var realPos=0.0;
        var realStep=this.bufferLen/this.audioBufSize;

        for (var i=0;i<this.audioBufSize;i++)
        {
            data[i]=this.audioBuffer[Math.floor(realPos)];
            realPos+=realStep;
        }

        this.bufferPos=0;
    }
}
