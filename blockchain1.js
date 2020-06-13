let SHA256=require('crypto-js/sha256');
let EC=require('elliptic').ec;
let ec=new EC('secp256k1');
class PostDetail{
    constructor(username,userID,data)
    {
        this.username=username;
        this.userID=userID;
        this.data=data;
        this.timestamp=Date(Date.now());
    }
    
    calculateHash(){
        return SHA256(this.userID+this.data+this.username+this.timestamp).toString();
    }
    signPost(signingKey)
    {
        if(signingKey.getPublic('hex')!=this.userID)
        {
            throw new Error('You cannot sign posts with other userids!');
        }
        const hashPost=this.calculateHash();
        const sig=signingKey.sign(hashPost,'base64');
        this.signature=sig.toDER('hex');
    }
    
    isPostValid(){
        if(this.userID==null)
        return false;
        if(!this.signature || this.signature.length==0)
        {
            throw new Error("No signature for this post");
        }
        const publicKey=ec.keyFromPublic(this.userID,'hex');
        return publicKey.verify(this.calculateHash(),this.signature);
    }
}
class Block{
    constructor(timestamp,postDetails,previousHash=''){
        this.timestamp=timestamp;
        this.postList=postDetails;
        this.previousHash=previousHash;
        this.hash=this.calculateHash();
        this.nonce=0;
    }
    calculateHash(){
        return SHA256(this.nonce+this.timestamp+this.previousHash+JSON.stringify(this.postList)).toString();
    }
    mineBlock()
    {
        while(this.hash.substring(0,2)!="00")
        { this.nonce++;
            this.hash=this.calculateHash();
        }
        console.log("Block mined :" + this.hash);
    }
    hasValidPosts(){
        for(const post of this.postList)
        {
            if(!post.isPostValid())
            {
                return false;
            }
        }
        return true;
    }
} 
class Blockchain{
    constructor(){
        this.chain=[this.createGenesisBlock()];
        this.pendingPosts=[];
    }

    createGenesisBlock(){
        return new Block(Date.now(),"Genesis Block","0");
    }
    getLatestBlock(){
        return this.chain[this.chain.length-1];
        }
    minePendingPosts()
    {
        let block=new Block(Date.now(),this.pendingPosts,this.getLatestBlock().hash);
        block.mineBlock();
        console.log("block successfully mined!");
        this.chain.push(block);
        this.pendingPosts=[];
    }
    addPost(PostDetail)
    {
        if(!PostDetail.userID || !PostDetail.data || !PostDetail.username)
        {
            throw new Error("Fill all details");
        }
        if(!PostDetail.isPostValid())
        {
            throw new Error("Cannot add invalid post to chain");
        }
        this.pendingPosts.push(PostDetail);
    }
    getPostsOfAddress(address)
    {  let currPosts=[];
        for(const block of this.chain){
            for(const post of block.postList){
                if(post.userID==address){
                    currPosts.push(post);
                }
            }
        }
        return currPosts;
    }
    getlatestposts(){
        return this.getLatestBlock().postList.reverse();
    }
    isChainValid(){
        for(let i=1;i<this.chain.length;i++)
        {
            if(this.chain[i].previousHash!=this.chain[i-1].hash)
            return false;
            if(this.chain[i].calculateHash()!=this.chain[i].hash)
            return false;
            if(!this.chain[i].hasValidPosts())
            return false;
        }
        return true;
    }
}
module.exports.Blockchain=Blockchain;
module.exports.PostDetail=PostDetail;

