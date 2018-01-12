const request = require('request')
const fs = require('fs')
var conf = require('./tg-config.json')

var url = 'https://api.telegram.org/bot' + conf.token + '/getUpdates'

if (conf.charLimit === undefined) {
  conf.charLimit = -1
}

request({url: url, qs: {'limit': 100, 'offset': conf.counter}}, (err, res, body) => {
  if (err) {
    console.log('ERROR')
    return console.error(err)
  }
  var msgs = JSON.parse(body).result

  conf.counter = msgs[msgs.length - 1].update_id
  fs.writeFileSync('./tg-config.json', JSON.stringify(conf))

  getLastTxtMsg(msgs)
})

function getLastTxtMsg (msgs) {
  var type = ''
  if (msgs[msgs.length - 1].message === undefined) {
    type = 'edited_message'
  } else {
    type = 'message'
  }

  var str = ''

  if (msgs[msgs.length - 1][type].text !== undefined) {
    str = msgs[msgs.length - 1][type].text.split('\n').join(' / ')
    console.log(limitLength(str))
  } else if (msgs[msgs.length - 1][type].caption !== undefined) {
    str = msgs[msgs.length - 1][type].caption.split('\n').join(' / ')
    console.log(limitLength(str))
  } else {
    msgs.splice(-1, 1)
    getLastTxtMsg(msgs)
  }
}

function limitLength (msg) {
  if (conf.charLimit <= 0) {
    return msg
  } else if (msg.length > conf.charLimit) {
    return msg.substring(0, conf.charLimit - 4) + '...'
  } else {
    return msg
  }
}
