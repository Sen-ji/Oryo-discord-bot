const Discord = require('discord.js')
const bot = new Discord.Client()
var serveur;
var general;
var cat = {}
var groupes = {}
var parentAct

const {
    Token
} = require("./config")


bot.on('ready', function () {
    console.log("lancement du bot")
    serveur = bot.channels.cache.get("682421626846969907").guild
    general = bot.channels.cache.get("687461489711382594")
    bot.channels.cache.forEach(element => {
        if (element.id != "682421626846969907" && element.id != "687461489711382594" && element.id != "688066841557598258") {
            element.delete()
        }
    });
    serveur.roles.cache.forEach(element => {
        if (element.id != "682422708302381066" && element.id != "682421626846969906") {
            element.delete()
        }
    });
    //startGuild();


})
bot.on('message', function (message) {

    mes = message.content.split(" ");
    if (mes[0] == "add" && mes[1] != null) {
        commandAdd(mes)
    } else if (mes[0] == "del" && mes[1] != null) {
        commandDel(mes)
    } else if (mes[0] == "addRole") {
        role(mes)
    } else if (mes[0] == "newGroupe") {
        newGroupe(mes)
    } else if (mes[0] == "groupe") {
        groupe(mes)
    }
    if (message.channel.name == "terminal" && message.author.id == "191277501035708417") {
        console.log(message.author.username)
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


    if (channelJoin !== null) { //join total

        console.log("channel vocal multi rejoin")
        var channelSubber;
        var vide = 0;
/**
                 * donc structure exemple de cat :
                 * cat : {
                 *      123456 :{
                 *              name : "bonjour",
                 *              role : {},
                 *              chan : {
                 *                      123456 : {
                 *                              name : oui,
                 *                              userlimit : 0
                 *                              multi : 0
                 *                              id : ["123456"]
                 *                              },
                 *                      159987 : {
                 *                              name : non,
                 *                              multi : 1,
                 *                              userlimit : 5,
                 *                              id : ["159987","168487"]
                 *                              },
                 *                      }
                 *              }
                 *      }
                 */

        for (var channel in cat[channelJoin.parentID].chan) {
            //console.log(cat[channelJoin.parentID].chan)
            //console.log(cat[channelJoin.parentID].chan[channel])
            if (cat[channelJoin.parentID].chan[channel].multi == 1 && cat[channelJoin.parentID].chan[channel].id.indexOf(channelJoin.id) != -1) {
                channelSubber = cat[channelJoin.parentID].chan[channel].id[0]
                //console.log("channelSubber = "+ channelSubber)
                for (var i = 0; i < cat[channelJoin.parentID].chan[channel].id.length - 1; i++) {
                    console.log(cat[channelJoin.parentID].chan[channel].id[i])
                    if (serveur.channels.cache.get(cat[channelJoin.parentID].chan[channel].id[i]).members.first(1)[0] == undefined) {
                        vide++;
                    }
                }

                console.log(vide)
                if (vide == 0) {
                    makeSubChannel(cat[channelJoin.parentID].chan[channel].name, channelJoin.parentID, channel)
                }
            }


        }

        //quand quelqu'un join, il faut, s'il n'y as pas de channel vide, que ça en créer un
        //que ce channel vide soit remonter au dessus
    }
    if (channelLeave !== null ) { //leave ou switch
        console.log("channel vocal multi quitter")


        for (var channel in cat[channelLeave.parentID].chan) {
            //console.log(cat[channelLeave.parentID].chan[channel].multi)
            //console.log(cat[channelLeave.parentID].chan[channel].id.indexOf(channelLeave.id))
            if (cat[channelLeave.parentID].chan[channel].multi == 1 && cat[channelLeave.parentID].chan[channel].id.indexOf(channelLeave.id) != -1 &&cat[channelLeave.parentID].chan[channel].multi == 1) {
                console.log("le channel leave est un channel multi")
                console.log(cat[channelLeave.parentID].chan[channel].id.length)
                console.log(serveur.channels.cache.get(channelLeave.id).members.first(1)[0])
                if (cat[channelLeave.parentID].chan[channel].id.length >= 2 && serveur.channels.cache.get(channelLeave.id).members.first(1)[0] == undefined) {

                    deleteSubChannel(channelLeave.id, channelLeave.parentID, channel)
                }
            }
        }
        /*if (channelLeave != null && cat[channelLeave.name].length > 2 && serveur.channels.cache.find(c => c.id == channelLeave.id).members.first(1)[0] == null) {
            cat[channelLeave.name].splice(cat[channelLeave.name].indexOf(channelLeave.id), 1)
            channelLeave.delete();
            if (cat[channelLeave.name].length == 2 && joinName == channelLeave.name)
                makeChannel(channelLeave.name, "voice", cat[channelLeave.name][0])

        }*/
    }
})

function makeChannel(name, type, parent, chanString) {
    var id
    serveur.channels.create(name, { type: type })
        .then(channel => {
            id = channel.id
            if (parent != null) {
                console.log("création d'un channel enfant")
                channel.setParent(parent);
                cat[parent].chan[id] = {}
                cat[parent].chan[id].id = [id]
                cat[parent].chan[id].name = name
                cat[parent].chan[id].userlimit = 0
                if (chanString.split(".").length > 2 && chanString.split(".")[2] > 0) {
                    cat[parent].chan[id].userlimit = chanString.split(".")[2]
                    channel.setUserLimit(chanString.split(".")[2])
                }
                if (chanString.split(".")[1] == "vm") {
                    cat[parent].chan[id].multi = 1
                } else {
                    cat[parent].chan[id].multi = 0
                }

            }
            else {

                console.log("création d'un channel parent")
                cat[id] = {};
                cat[id].name = name
                cat[id].role = {}
                cat[id].chan = {}
                cat[id].chan[id] = {}
                cat[id].chan[id].name = name
                cat[id].chan[id].multi = 0
                cat[id].chan[id].userlimit = 0
                cat[id].chan[id].id = [id]
            }

        })
        .catch(console.error);
    setTimeout(function () {
        parentAct = id

    }, 500);

}
function makeSubChannel(name, parent, groupeSubber) {
    console.log("subchannel ! " + groupeSubber)
    serveur.channels.create(name, { type: "voice" })
        .then(channel => {
            channel.setParent(serveur.channels.cache.get(parent))
            setTimeout(function () {
                console.log("position : " + cat[parent].chan[groupeSubber].id.length + " " + serveur.channels.cache.get(cat[parent].chan[groupeSubber].id[0]).position)
                channel.setPosition(cat[parent].chan[groupeSubber].id.length + serveur.channels.cache.get(cat[parent].chan[groupeSubber].id[0]).position - 1)

            }, 500);
            cat[parent].chan[groupeSubber].id.push(channel.id)

        })
        .catch(console.error);

}
function deleteSubChannel(id, parentId, idtab) {
    //1 = id du channel leave, 2 = id de la catégorie, 3 = le nom du groupe
    console.log("function delete sub")
    console.log(id)
    serveur.channels.cache.get(id).delete()
    console.log(cat[parentId].chan[idtab])
    //if(id ==idtab)
    cat[parentId].chan[idtab].id.splice(cat[parentId].chan[idtab].id.indexOf(id), 1)
    console.log(cat[parentId].chan[idtab])

}
function startGuild() {
    general.send(`
    Merci d'avoir choisi Oryo, le bot spécialiser dans la gestion de guilde/alliance

    Pour avoir une petite présentation des nouvelles possibilité qui s'offre a vous : /demo

    Pour avoir un index de toute les commande possible /help

    Pour avoir un exemple précis sur l'utilisation d'une commande /help nomDeLaCommande
    `)
}

function commandAdd(mes) {
    if (cat[mes[1]] == null)
        makeChannel(mes[1], "category", null)
    else {
        general.send("cette catégorie existe déjà dans le contexte actuel")
    }
}
function commandDel(mes) {
    if (cat[mes[1]] != null) {
        cat[mes[1]].forEach(id => {
            serveur.channels.cache.get(id).delete()
        })
        cat[mes[1]] = null
    } else {
        general.send("cette catégorie n'existe pas, impossible de la supprimer")
    }
}
function role(mes) {
    if (mes[1])
        serveur.roles.create({
            data: {
                name: mes[1],
                color: mes[2],
            },
            reason: [3],
        }).then(role => {
            role.setName(mes[1])
            if (mes[2])
                role.setColor(mes[2].toUpperCase())
        })
            .catch(console.error);
}

function newGroupe(mes) {
    valid = true
    /** donc structure d'un groupe mes[1], c'est le nom, suivit de tout les channel
     *  un channel serra représenter comme suis : 
     *  général.t = channel de nom "général" de type texte
     *  farm.vm.5 = channel de nom "farm" de type vocal, avec une limite de 5, multi instance (toujours un, et un seul channel vide)
     *  farm.v.5 = channel de nom "farm" de type vocal, avec une limite de 5
     *  farm.v = channel de nom "farm" de type vocal, sans limite de personne
     */
    groupes[mes[1]] = []
    for (var i = 2; i < mes.length; i++) {
        if (mes[i].split(".")[1] == "v" || mes[i].split(".")[1] == "vm" || mes[i].split(".")[1] == "t")
            groupes[mes[1]].push(mes[i])
        else
            valid = false
    }
    if (valid) {
        general.send("nouveau groupe : " + groupes[mes[1]])
    } else {
        general.send("groupe non valide");
    }

}
function groupe(mes) {
    makeChannel(mes[2], "category", null)
    setTimeout(function () {
        groupes[mes[1]].forEach(channel => {
            var a = channel.split(".")
            var type
            var nb = null
            if (a[1] == "t")
                type = "text"
            else
                type = "voice"

            makeChannel(a[0], type, parentAct, channel)
        });
    }, 500);

}
bot.login(Token);