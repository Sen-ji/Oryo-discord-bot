const Discord = require('discord.js')
const bot = new Discord.Client()
const fs = require("fs")
const cat = require('./sav.json')
var serveur;
var general;

const {
    Token
} = require("./config")

bot.on('ready', function () {
    serveur = bot.channels.cache.get("682421626846969907").guild
    general = bot.channels.cache.get("687461489711382594")
    bot.channels.cache.forEach(element => {
        if (element.id != "682421626846969907" && element.id != "687461489711382594" && element.id != "688066841557598258" && element.id != "689900394372923543") {
           // element.delete()
        }
    });
    serveur.roles.cache.forEach(element => {
        if (element.id != "682422708302381066" && element.id != "682421626846969906") {
            element.delete()
        }
    });
})

bot.on('message', function (message) {

    mes = message.content.split(" ");
    if (mes[0] == "add") {
        addchannel(message.author.id)
    }else if (mes[0] == "del" ) {
        delchannel(message.author.id)
    }  
    if (message.channel.name == "terminal" && message.author.id == "191277501035708417") {
        try {
            message.channel.send(eval(message.content))
        }
        catch (error) {
            console.error("error terminal discord" + error)
        }
    }
})
bot.on('voiceStateUpdate', (oldState, newState) => {
    let channelJoin = newState.channel
    let channelLeave = oldState.channel
    if (channelJoin !== null) { 
        var vide = 0;
        for (var channel in cat) {
            if ( cat[channel]!=null&&cat[channel].id.indexOf(channelJoin.id) != -1) {
                channelSubber = cat[channel].id[0]
                for (var i = 0; i < cat[channel].id.length - 1; i++) {
                    if (serveur.channels.cache.get(cat[channel].id[i]).members.first(1)[0] == undefined) {
                        vide++;
                    }
                }
                if (vide == 0) {
                    makeSubChannel(channelJoin.name, channelJoin.parentID, channel)
                }
            }
        }
    }
    if (channelLeave !== null ) { 
  
        for (var channel in cat) {
            if (cat[channel]!=null&& cat[channel].id.indexOf(channelLeave.id) != -1) {
                if (cat[channel].id.length >= 2 && serveur.channels.cache.get(channelLeave.id).members.first(1)[0] == undefined) {
                    serveur.channels.cache.get(channelLeave.id).delete()
                    
                    cat[channel].id.splice(cat[channel].id.indexOf(channelLeave.id), 1)

                    fs.writeFileSync("sav.json", JSON.stringify(cat))
                    if (cat[channel].id.length == 1 && channelJoin!=null && channelJoin.name == channelLeave.name)
                    makeSubChannel(channelLeave.name, channelLeave.parentID,channel)
                   
                
                }
            }
        }
    }
})

function addchannel(author){
    serveur.channels.cache.forEach(element => {
        if(element.type =="voice" &&element.members.get(author)!=null){
            var exist = 0
            for(var channel in cat){
                if(cat[channel]!=null &&cat[channel].id.indexOf(element.id) != -1)
                exist = 1
            }
            if(exist ==0){
                cat[element.id] = { 
                }
                cat[element.id].id = [element.id]
                cat[element.id].name = element.name
                console.log(element.userLimit)
                cat[element.id].userLimit = element.userLimit
                makeSubChannel(element.name,element.parentID,element.id)
                general.send("channel add")
                
            }   
        }
    });
}

function delchannel(author){
    serveur.channels.cache.forEach(element => {
        if(element.type =="voice" &&element.members.get(author)!=null){
            //donc faut del le "cat" qui contient element
            for(var channel in cat){
                if(cat[channel]!=null &&cat[channel].id.indexOf(element.id) != -1&&cat[channel].id.length>1){

                    for(var i = 1;i<cat[channel].id.length;i++){
                    
                        serveur.channels.cache.get(cat[channel].id[i]).delete()
                       
                    }
                    cat[channel]=null
                    fs.writeFileSync("sav.json", JSON.stringify(cat))
                    general.send("channel retirer")
                }
                
            }
        }
    });
}


function makeSubChannel(name, parent, groupeSubber) {
    serveur.channels.create(name, { type: "voice" })
        .then(channel => {
            channel.setParent(serveur.channels.cache.get(parent))
            setTimeout(function () {
                channel.setPosition(cat[groupeSubber].id.length + serveur.channels.cache.get(cat[groupeSubber].id[0]).position - 2)
                channel.setUserLimit(cat[groupeSubber].userLimit)
                fs.writeFileSync("sav.json", JSON.stringify(cat))
            }, 500);
            cat[groupeSubber].id.push(channel.id)

        })
        .catch(console.error);

}

bot.login(Token);