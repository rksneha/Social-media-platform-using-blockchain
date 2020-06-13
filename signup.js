let {Blockchain,PostDetail}=require('./blockchain1');
let EC=require('elliptic').ec;
let ec=new EC('secp256k1');
let s1=new Blockchain();
var lookup={};
    var ourkeys=[];
    var lookupforname={};
var lookupforpasswords={};
global.Profile=class{
    
constructor(adharID,username,password)
{
    this.adharID=adharID;
    this.username=username;
    this.password=password;
}

signup()
{
    if(lookup[this.adharID])
    {
        return "User already exists with adharID: " + this.adharID + "! Report us if it is not your account";
    }
    const key=ec.genKeyPair();
    while(ourkeys[key])
    {
        key=ec.genKeyPair();
    }
    lookup[this.adharID]=key;
    console.log("created a userID : "+ key.getPublic('hex') + " for your account");
    ourkeys.push(key);
    lookupforname[this.adharID]=this.username;
    lookupforpasswords[this.adharID]=this.password;
    this.userID=lookup[this.adharID];
    return "Account successfully created for adharID: "+ this.adharID + "!!";
}
signIn(){
    if(!lookup[this.adharID])
    {
        return "Account does not exist. Sign Up to Create One!";
    }
    if(lookupforname[this.adharID]!=this.username)
    {
        return "Incorrect User Name. Please try again!";
    }
    if(lookupforpasswords[this.adharID]!=this.password)
    {
        return "Incorrect Password. Please try again!";
    }
    this.UserID=lookup[this.adharID];
    return "Account Signed In Successfully!";
}
blockchain(){
return s1;
}
createPost(data)
{
    const newPost=new PostDetail(this.username,this.userID.getPublic('hex'),data);
    newPost.signPost(this.UserID);
    s1.addPost(newPost);
    return "post successfully added with us! Will be posted once mined!";
}
getmyposts(){
    console.log("your posts: ")
    return s1.getPostsOfAddress(this.userID.getPublic('hex'));
}
getmyfeed(){
    console.log("Your updated feed: ");
    return s1.getlatestposts();
}
getpostsofmyfriend(adharID){
if(!lookup[adharID])
{
    return "No user exists!";
}
let friendID=lookup[adharID];
console.log("Your friend " + (lookupforname[adharID] +"'s posts : \n"));
return s1.getPostsOfAddress(friendID.getPublic('hex'));
}
}
module.exports.Profile=Profile;
let profile1=new Profile("17bit0084","sneha","betsy12");
console.log(profile1.signup());
console.log(profile1.signIn());
let profile2=new Profile("17bit0243","prithesh","nonyon29");
console.log(profile2.signup());
console.log(profile2.signIn());
console.log(profile1.createPost("Hi! I'm new to Flippr.io. But this looks cool!"));
console.log(profile1.createPost("Hi! Good afternoon!"));
console.log(profile2.createPost("good afternoon"));
console.log(profile2.createPost("beautiful day"));
s1.minePendingPosts();
console.log(profile1.getpostsofmyfriend("17bit0243"));