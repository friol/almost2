/* disk media */

class disk
{
    constructor()
    {
        this.theDisk=[];
    }

    loadMedia(abuf)
    {
        var uint8ArrayNew  = new Uint8Array(abuf);

        for (var c=0;c<232960;c++)
        {
            this.theDisk.push(uint8ArrayNew[c]);
        }
    }
}
