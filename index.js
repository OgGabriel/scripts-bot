const Discord = require('discord.js')
const { Client, MessageEmbed, Message } = require('discord.js')
const prefix = '.'

let IPinfo = require("node-ipinfo");
let ipinfotoken = "token ip info"
const https = require('https')
const http = require('http')
const axios = require('axios')

let cor = '#7289da'
let vermelho = '#ff0000'


const bot = new Client({ partials: ["MESSAGE", "CHANNEL", "REACTION"] })

bot.once('ready', () => {
    console.log('scripts.bot online!')
})

bot.on('message', async message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return
    if (message.channel.id == '781240738985803788') return message.delete() && message.reply('você não pode digitar comandos aqui')

    const args = message.content.slice(prefix.length).split(/ +/)
    const cmd = args.shift().toLowerCase()

    let cmds = ['help', 'ip', 'mcname']

    function erro(msg) {
        message.channel.send(new MessageEmbed().setTitle('❌ ERRO').setDescription(msg).setColor(vermelho))
        message.react('😴')
    }

    function msgemb(title, msg) {
        message.channel.send(new MessageEmbed().setTitle(title).setDescription(msg).setColor(cor))
    }

    function msgembd(msg) {
        message.channel.send(new MessageEmbed().setDescription(msg).setColor(cor))
    }

    function log(message) {
        bot.channels.cache.get('781677030990807041').send(new MessageEmbed().setDescription(message).setColor(cor))
    }

    // ainda nao funciona

    if (cmd == 'trava') {
        let tag = message.author.username
        if (bot.channels.cache.find(c => c.name.includes('trava-' + tag))) return erro('Você já possui uma thread de trava existente')
        message.react('🤡')
        message.guild.channels.create(`trava-${tag}`, {
            permissionOverwrites: [
                {
                    id: message.guild.id,
                    deny: ["VIEW_CHANNEL"]
                },
                {
                    id: message.author.id,
                    allow: ["SEND_MESSAGES", "VIEW_CHANNEL"]
                }
            ],
            type: 'text',
            parent: '781676666253869076'
        }).then(async channel => {
            msgemb(`**🤡 rajada.js**`, `Vá para <#${channel.id}> para prosseguir com o setup`)
            channel.setTopic('rajada.js powered by pedrokp')
            channel.send(`<@${message.author.id}>`, new MessageEmbed()
                .setTitle("**🤡 rajada.js **")
                .setDescription(`Você abriu uma thread de trava, siga as instruções para conseguir usar sem problemas.`)
                .addField('**O que eu preciso para enviar travas?**', 'Você precisa de um token de uma conta e que essa conta esteja no servidor ou possua um chat aberto com uma pessoa')
                .addField('**Como pegar a id de um canal?**', 'Se você não tiver as opções de desenvolvedor ativadas, copie o link de uma mensagem no chat que você quer enviar os travas e siga o exemplo abaixo:')
                .addField('**Exemplo:**', 'https://discord.com/channels/**751514059135778917/772937477496635453/781659461865439282 => "751514059135778917" ')
                .addField('**Use ~~com~~ moderação 🤡**', 'Para iniciar o setup, digite: ``.ts``')
                .setColor(cor))

            log(`<@${message.author.id}> iniciou uma thread de trava`)
        }).catch((err) => console.log(err))
    }

    else if (cmd == 'ts') {
        if (!message.channel.name.startsWith('trava')) return
        const filter = m => m.author.id === message.author.id;
        const questions = ["Qual é o token da conta?", "Qual é o ID do canal?", "Qual trava deseja enviar (macaco/cavalo/amor)", "Digite 'enviar' para enviar."]
        msgembd("Qual é o token da conta?")
        const arr = []
        let i = 0
        const collector = message.channel.createMessageCollector(filter)
        collector.on("collect", m => {
            if (i < questions.length - 1) {
                arr.push(String(m.content))
                i++
                msgembd(questions[i])
            } else {
                collector.stop()
            }
        })
        collector.on('end', () => {
            msgembd('Iniciando rajada em 5 segundos...')
            let token = arr[0]
            let channelid = arr[1]
            if (arr[2] == 'macaco' || arr[2] == 'cavalo' || arr[2] == 'amor') {
                //message.channel.overwritePermissions()
                payload = {'content':'teste'}
                headers = {'Authorization':token,'User-Agent':'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) discord/0.0.12 Chrome/78.0.3904.130 Electron/7.3.2 Safari/537.36'}
                url = 'https://discord.com/api/v8/channels/'+channelid+'/messages'
                axios.post(url, {
                    headers: (headers),
                    data: (payload)
                }).then( res => {
                    if (res.status_code == 200) return msgembd('Trava enviado com sucesso')
                    else if (res.status_code == 429) return erro('Rate limit')
                    else return erro('Erro desconhecido.')
                })

            } else {
                erro('Você não selecionou uma opção de trava válida, deletando canal em 5 segundos...')
                setTimeout(() => {
                    message.channel.overwritePermissions()
                    message.channel.delete()
                }, 5000);
            }
        })
    }

    else if (cmd == 'phone'){
        if (args.length <= 0) return erro('Escolha um número para checar')
        let numero = args.join(' ')
        http.get('http://apilayer.net/api/validate?access_key=28d4cde8feff57baca843c7c0f29f36c&number='+numero.replace(' ', '%20')+'&country_code=&format=0', res => {
            if (res.statusCode != 200) return erro('Houve um erro na API e portanto, não foi possível rastrear esse telefone')
            let responseText = ''

            res.on('data', data => {
                    responseText += data
            })
    
            res.on('end', () => {
                    message.channel.send(responseText, { code: 'json' } )
            })
        })
    }

    else if (cmd == 'mcname') {
        if (args.length <= 0) return erro('Escolha um nome para checar')
        if (args[0].length < 3) return erro('O mínimo de caracteres de um nick é 3')
        if (args[0].length > 16) return erro('O máximo de caracteres de um nick é 16')
        let name = args[0]
        https.get('https://api.mojang.com/users/profiles/minecraft/' + name, res => {
            if (res.statusCode != 200) return msgemb(`**🔎 ${name}**`, `O nick \`\`${name}\`\` ainda  **não existe**`)
            msgemb(`**🔎 ${name}**`, `O nick \`\`${name}\`\`  **já existe**`)
        })
    }

    else if (cmd == 'help') {
        message.channel.send(new MessageEmbed()
        .setTitle('🆘 AJUDA')
        .setDescription('**Lista de comandos:** \n``.' + cmds.join(' \n.') + "``")
        .setColor(cor)
        )
    }

    else if (cmd == 'iplookup' || cmd == 'ip') {
        if (args.length <= 0 ) return erro('Você precisa indicar um IP')
        if (!args[0].includes('.')) return erro('Indique um IP válido')
        let ip = args[0]
        let ipinfo = new IPinfo(ipinfotoken);
            ipinfo.lookupIp(ip)
            .then((response) => {
                if (response.hostname && response.city && response.region && response.country && response.loc && response.postal) {
                let resultembed = new MessageEmbed()
                .setTitle(`**🔎 ${ip}**`)
                .addField('  Hostname: ', response.hostname)
                .addField('  Cidade: ', response.city)
                .addField('  Região: ', response.region)
                .addField('  País: ', response.country)
                .addField('  Estimativa de coordenadas: ', response.loc)
                .addField('  CEP estimado: ', response.postal)
                .setColor(cor)
                message.channel.send(resultembed)
                message.react('💯')
            } else {
                erro('Não foi possível localizar ' + ip)
            }
        })
            .catch((err) => {
                message.react('💤')
                erro('Não foi possível localizar ' + ip)
                console.log(err)
        })
    }

})

bot.on("guildMemberAdd", member => {
    member.roles.add('781241399801937940')

})

bot.login('token')