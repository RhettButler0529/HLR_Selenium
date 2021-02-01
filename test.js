var argv = require('minimist')(process.argv.slice(2));
const proxyfile = argv['p'];
const threadCound = argv['t'];
const phoneArrange = argv['i'];
const emailfile = argv['e'];
console.log(proxyfile, threadCound, phoneArrange, emailfile)
//Get Proxy from text file
var proxyAddress = '';
var emailList = [];
var fs = require('fs');
const { start } = require('repl');

//Setting the start-end phone number
let startString = phoneArrange.split('-')[0];
let lastString = phoneArrange.split('-')[1];
let zeroCount = lastString.length;
let zeroString = new Array(zeroCount + 1).join('0');
var startPhoneNumber = Number(startString + zeroString);
var endPhoneNumber = Number(startString + lastString);
for (let index = startPhoneNumber; index < endPhoneNumber + 1; index++) {
  let reqNum = "+" + index.toString()

}
console.log("Range=>", startPhoneNumber, endPhoneNumber)

fs.readFile(proxyfile, 'utf8', function (err, data) {
  if (err) throw err;
  console.log('OK: ' + proxyfile);
  console.log(data)
  proxyAddress = data

  fs.readFile(emailfile, 'utf8', function (err, data) {
    if (err) throw err;
    console.log('OK: ' + emailfile);

    emailList = data.split("\n")
    console.log(emailList)
    emailList.map(email => {
      const { send } = require('process');
      const HlrLookupClient = require('node-hlr-client');
      var webdriver = require('selenium-webdriver');
      let proxy = require('selenium-webdriver/proxy');
      let chrome = require('selenium-webdriver/chrome');
      let opts = new chrome.Options();
      opts.setProxy(proxy.manual({ http: proxyAddress }));
      var By = webdriver.By;
      var driver = new webdriver.Builder()
        .forBrowser('chrome')
        .setChromeOptions(opts)
        .build();
      driver.manage().window().maximize();

      //Email Check
      var imaps = require('imap-simple');
      const _ = require('lodash');

      const timer = ms => new Promise(res => setTimeout(res, ms));
      let senderEmail = email.split(':')[0];
      var config = {
        imap: {
          user: senderEmail,
          password: email.split(':')[1],
          host: 'imap.mail.ru',
          port: 993,
          tls: true,
          tlsOptions: { rejectUnauthorized: false },
          authTimeout: 3000
        }
      };

      //Make Random user name
      function makeUserName(length) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
      }

      
      let senderName = '';
      let code = '';
      let apiKey = '';
      let apiSecret = '';

      imaps.connect(config).then(function (connection) {
        return connection.openBox('INBOX').then(function () {
          var searchCriteria = ['ALL'];
          var fetchOptions = {
            bodies: ['HEADER', 'TEXT', ''],
          };
          return connection.search(searchCriteria, fetchOptions).then(function (messages) {
            messages.forEach(function (item) {
              var all = _.find(item.parts, { "which": "TEXT" })
              var html = (Buffer.from(all.body, 'base64').toString('ascii'));
              if (html.includes("Hi " + nameCapitalized)) {

                code = html.split('/').pop().split('\n')[0]
                console.log("includes==> True, ", code)
                driver.get('https://www.hlr-lookups.com/en/activate/' + code)
                  .then(function () {
                    driver.get("https://www.hlr-lookups.com/en/api-settings#apiCredentials")
                      .then(function () {
                        let promiseApiBox =
                          driver.findElement(By.className('apiKey'))
                        return promiseApiBox;
                      })
                      .then(function (apiBox) {
                        apiBox.getText().then(function (value) {
                          apiKey = value
                          console.log("apiKey==> ", apiKey)
                        })
                          .then(function () {
                            let promiseSecretButton =
                              driver.findElement(By.className('showSecret'))
                            return promiseSecretButton;
                          })
                          .then(function (secretButton) {
                            secretButton.click()
                          })
                          .then(function () {
                            let promiseSecretKeyBox =
                              driver.findElement(By.className('apiSecret'))
                            return promiseSecretKeyBox;
                          })
                          .then(function (secretKeyBox) {
                            secretKeyBox.getText()
                              .then(function (value) {
                                apiSecret = value;
                                console.log("apiSecret ===> ", apiSecret)
                              })
                              .then(function () {
                                console.log("api client===> ", apiKey, apiSecret)
                                const client = new HlrLookupClient(
                                  apiKey,
                                  apiSecret
                                );
                                for (let index = startPhoneNumber; index < endPhoneNumber + 1; index++) {
                                  let reqNum = "+" + index.toString()
                                  const params = { msisdn: reqNum };
                                  const callback = function (response) {
                                    console.log(response.data);
                                  };
                                  client.post('/hlr-lookup', params, callback);
                                }

                              })

                          })
                      })


                  })
              } else {
                console.log("FALSE")
              }

            });
          });
        })

      })

      
    })

  });
})



