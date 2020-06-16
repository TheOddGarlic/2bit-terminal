const WebSocket = require('ws');
const blessed = require('neo-blessed');
const fetch = require("node-fetch");

var username = "Muz",
  password = "PASS",
  debug = false,
  channels = [];

let ws = new WebSocket("wss://2bit.team/");

const screen = blessed.screen({
  smartCSR: true,
  title: '2 Bit Terminal',
  fullUnicode: true
});

var messageList = blessed.list({
  align: 'left',
  mouse: true,
  keys: true,
  width: '100%',
  height: '90%',
  top: 0,
  left: 15,
  scrollbar: {
    bg: 'blue'
  },
  items: [],
  scrollable: true,
});

var channellist = blessed.list({
  align: 'left',
  keys: true,
  width: '100%',
  height: '90%',
  top: 0,
  left: 0,
  scrollbar: {
    ch: ' ',
    inverse: true,
  },
  style: {
    item: {
      fg: "#ffffff",
      bg: "#000000"
    },
    selected: {
      fg: "#000000",
      bg: "#ffffff"
    },
  },
  invertSelected: false
});

var input = blessed.textarea({
  bottom: 0,
  height: '10%',
  inputOnFocus: true,
  padding: {
    top: 1,
    left: 1,
    bottom: 1
  },
  style: {
    fg: '#ffffff',
    bg: '#000000',

    focus: {
      fg: '#ffffff',
      bg: '#000000',
    },
  },
});

input.key('enter', function () {
  var message = this.getValue();
  try {
    sendMessage(message);
  } catch (err) {
    // error handling
  } finally {
    this.clearValue();
    screen.render();
  }
});

input.key('tab', () => {
  input.setValue(";channel ");
  screen.render();
});

screen.key(['escape', 'C-c'], function () {
  return process.exit(0);
});

screen.append(channellist)
screen.append(messageList);
screen.append(input);
input.focus();

screen.render();

let waitingForLogin = false;

ws.on("open", () => {
  ws.send(JSON.stringify({
    type: "login",
    username,
    password
  }));
  waitingForLogin = true;
  switchChannel("#general");
});

ws.on("message", (msg) => {
  //msg = msg.data;
  if (isJSON(msg)) {
    msg = JSON.parse(msg);
    if (msg.type == "message") {
      newMessage(msg);
    }
    if (msg.type == "channels") {
      if (debug) {
        messageList.addItem("> Updating channels...");
        messageList.scrollTo(100);
        screen.render();
      }
      msg.channels.forEach((channel) => {
        channels.push("#" + channel.name);
        channellist.pushItem("#" + channel.name);
      })
      screen.render();
    }
    if (msg.type == "update") {
      messageList.addItem("> Updating messages...");
      screen.render();
      msg.messages.forEach(m => newMessage(m));
    }
  } else {
    if (waitingForLogin == true) {
      if (msg == "Logged in.") {
        waitingForLogin = false;
        setInterval(ping, 60000)
      }
    } else {
      // if (waitingForChannelSwitch == true) {
      //     if (!msg.startsWith("Switched")) {
      //         document.getElementById("channels").value = oldChannel;
      //         console.log(msg);
      //         document.getElementById("messages").innerHTML +=
      //             "<br><i>&gt; " + msg + "</i>";
      //         window.scrollTo(0, document.body.scrollHeight);
      //         waitingForChannelSwitch = false;
      //     } else {
      //         console.log(msg);
      //         document.getElementById("messages").innerHTML +=
      //             "<br><i>&gt; " + msg + "</i>";
      //         window.scrollTo(0, document.body.scrollHeight);
      //         waitingForChannelSwitch = false;
      //         document.getElementById('chat').placeholder = 'Message ' + (document.getElementById('channels').value === '#lgs' ? '#hell' : document.getElementById('channels').value);
      //     }
      //} else {
      if (msg !== "Received ping") {
        messageList.addItem("> " + msg);
        messageList.scrollTo(100);
        screen.render();
      } else {
        if (!debug) return;
        messageList.addItem("> Pong!");
        messageList.scrollTo(100);
        screen.render();
      }
      //}
    }
  }
});

function isJSON(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

const boldsRegex = /(<strong>)(.*?)(<\/strong>)/g;
const italicsRegex = /(<i>)(.*?)(<\/i>)/g;

const replaceRegex = function (regex, replacement) {
  return function (str) {
    return str.replace(regex, replacement);
  }
}

const boldsReplacer = function (fullMatch, tagStart, tagContents) {
  return '{white-bg}{black-fg}' + tagContents + '{/black-fg}{/white-bg}';
}

const italicsReplacer = function (fullMatch, tagStart, tagContents) {
  return '{underline}' + tagContents + '{/underline}';
}

const replaceBolds = replaceRegex(boldsRegex, boldsReplacer);
const replaceItalics = replaceRegex(italicsRegex, italicsReplacer);

function newMessage(msg) {
  messageList.addItem(
    `${msg.author.badges
        .filter(b => b.shown == true)
        .map(b => b.emoji)
        .join(" ")} ${parseInt(msg.date.substr(16 , msg.date.length - 60)) + 3}${msg.date.substr(18, msg.date.length - 56)} ${msg.author.username}: ${blessed.helpers.parseTags(replaceBolds(replaceItalics(msg.message)))}`.trim()
  );
  messageList.scrollTo(100);
  screen.render();
}

function switchChannel(channel, password) {
  messageList.clearItems();
  ws.send(
    JSON.stringify({
      type: "channel",
      channel: channel.substr(1),
      password: password != null ? password : ""
    })
  );
  channellist.select(channels.indexOf(channel))
  screen.title = channel + " - 2 Bit Terminal"
}

function sendMessage(message) {
  if (message.startsWith(";")) {
    const args = message.slice(1).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    if (command == "help") {
      messageList.addItem(blessed.helpers.parseTags("{bold}> Commands{/bold}"));
      messageList.addItem(blessed.helpers.parseTags("{bold}>> ;reverse{/bold} : Reverses the following text and sends it."));
      messageList.addItem(blessed.helpers.parseTags("{bold}>> ;ping{/bold} : Pings the chat server."));
      messageList.addItem(blessed.helpers.parseTags("{bold}>> ;debug{/bold} : Enables debug output."));
      messageList.addItem(blessed.helpers.parseTags("{bold}>> ;lenny{/bold} | {bold};shrug{/bold} : Funny faces :D"));
      messageList.addItem(blessed.helpers.parseTags("{bold}>> ;tableflip{/bold} | {bold};unflip{/bold} : Tables :DD"));
      messageList.addItem(blessed.helpers.parseTags("{bold}>> ;channel{/bold} : Changes the channel to the given channel name. Some channels may require permissions or passwords."));
      messageList.addItem(blessed.helpers.parseTags("{bold}>> ;channels{/bold} | {bold};channellist{/bold} : Lists channels."));
      messageList.addItem(blessed.helpers.parseTags("{bold}>> ;eval{/bold} : Evaluates following javascript code, shouldn't be used without knowledge or can cause serious problems such as losing data."));
      return messageList.addItem(blessed.helpers.parseTags("{bold}>> ;giphy{/bold} : Searches and sends a gif."));
    }
    if (command == "reverse") {
      message = args.join(" ").split("").reverse().join("");
    }
    if (command == "ping") {
      return ping();
    }
    if (command == "debug") {
      messageList.addItem(debug ? "> Off." : "> On.")
      messageList.scrollTo(100);
      screen.render();
      return debug = !debug;
    }
    if (command == "lenny") {
      message = "( ͡° ͜ʖ ͡°)";
    }
    if (command == "shrug") {
      message = "¯\\_(ツ)_/¯";
    }
    if (command == "tableflip") message = "(╯°□°）╯︵ ┻━┻";
    if (command == "unflip") message = "┬─┬ ノ( ゜-゜ノ)";
    if (command == "channel" && args.length == 1) {
      return switchChannel(args[0].startsWith("#") ? args[0] : "#" + args[0]);
    }
    if (command == "channel" && args.length == 2) {
      return switchChannel(args[0].startsWith("#") ? args[0] : "#" + args[0], args[1]);
    }
    if (command == "channels" || command == "channellist") {
      messageList.addItem("> Channels: ");
      return channels.forEach((name) => {
        messageList.addItem(">> " + name);
      })
    }
    if (command == "eval" && args.length > 0) {
      return messageList.addItem("$ " + eval(args.join(" ")));
    }
    if (command == "giphy" && args.length > 0) {
      fetch("https://api.giphy.com/v1/gifs/search?api_key=g3iO28DV7XXCAif50R8TNPr5dys3zvYD&q=" + args.join("%20") + "&limit=1").then((res) => res.json()).then((data) => {
        data = data.data;
        //console.error(JSON.stringify(data))
        sendMessage(data[0].embed_url)
      })
      return;
    }
  }

  if (message.trim() !== "" && message.trim() !== " ") {
    ws.send(
      JSON.stringify({
        type: "message",
        message: message
      })
    );
  }
}

function ping() {
  ws.send(JSON.stringify({
    type: "ping"
  }));
}