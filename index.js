var argv = require('minimist')(process.argv.slice(2));
const proxyfile = argv['p'];
const threadCound = argv['t'];
const phoneArrange = argv['i'];
const emailfile = argv['e'];
console.log(proxyfile, threadCound, phoneArrange, emailfile)
//Get Proxy from text file
var proxyAddress = '';
var emailList = [];
const { SSL_OP_NETSCAPE_CA_DN_BUG } = require('constants');
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
      var webdriver = require('./node_modules/selenium-webdriver');
      let proxy = require('selenium-webdriver/proxy');
      let chrome = require('selenium-webdriver/chrome');
	  let opts = new chrome.Options();
	  opts.addArguments('--disable-dev-shm-usage');
	  opts.addArguments('--no-sandbox');
      opts.setProxy(proxy.manual({ http: proxyAddress }));
      var By = webdriver.By;
      var driver = new webdriver.Builder()
        .forBrowser('chrome')
        .setChromeOptions(opts)
        .build();
    //   driver.manage().window().maximize();

      //Email Check
      var imaps = require('imap-simple');
      const _ = require('lodash');

      const timer = ms => new Promise(res => setTimeout(res, ms));
	  let senderEmail = email.split(':')[0];
	  let password = email.split(':')[1];
	  console.log("email, password ===> ", senderEmail, password)
      var config = {
        imap: {
          user: senderEmail,
          password: password,
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

      driver.get("https://www.hlr-lookups.com/en/start")
        .then(function () {
          let promiseSignupButton =
            driver.findElement(By.className('signUp'));
          return promiseSignupButton;
        })
        .then(function (signUpButton) {
          let promiseClickSignUp = signUpButton.click();
          return promiseClickSignUp;
        })
        .then(async function () {
          await timer(1000);
          let promiseCompanyBox =
            driver.findElement(By.xpath('//*[@name="company"]'))
          return promiseCompanyBox;
        })
        .then(function (companyInputBox) {
          let promiseCompanyInput =
            companyInputBox.sendKeys('Company');
          return promiseCompanyInput
        })
        .then(function () {
          let promiseFirstNameBox =
            driver.findElement(By.xpath('//*[@name="firstName"]'))
          return promiseFirstNameBox;
        })
        .then(function (firstNameInputBox) {
          senderName = makeUserName(3)
          let promiseFirstNameInput =
            firstNameInputBox.sendKeys(senderName);
          return promiseFirstNameInput
        })
        .then(function () {
          let prmiseLastNameBox =
            driver.findElement(By.xpath('//*[@name="lastName"]'))
          return prmiseLastNameBox;
        })
        .then(function (lastNameInputBox) {
          let promiseLastNameInput =
            lastNameInputBox.sendKeys(makeUserName(3));
          return promiseLastNameInput
        })
        .then(function () {
          let prmiseEmailBox =
            driver.findElement(By.xpath('//*[@name="email"]'))
          return prmiseEmailBox;
        })
        .then(function (emailBox) {
          let promiseEmailInput =
            emailBox.sendKeys(senderEmail);
          return promiseEmailInput
        })
        .then(function () {
          let promiseUserNameBox =
            driver.findElement(By.xpath('//*[@name="rusername"]'))
          return promiseUserNameBox;
        })
        .then(function (userNameBox) {
          let promiseEmailInput =
            userNameBox.sendKeys(makeUserName(5));
          return promiseEmailInput
        })
        .then(function () {
          let promisePasswordBox =
            driver.findElement(By.xpath('//*[@name="rpassword"]'))
          return promisePasswordBox;
        })
        .then(function (passwordBox) {
          let promisePasswordInput =
            passwordBox.sendKeys('Password');
          return promisePasswordInput
        })
        .then(function () {
          let promiseUseCase =
            driver.findElement(By.xpath('//*[@value="USE_CASE_PORTABILITY"]')).click()
          return promiseUseCase;
        })
        .then(function () {
          let promiseCheckBox =
            driver.findElement(By.id('termsOfServiceCheckbox')).click()
          return promiseCheckBox
        })
        .then(function () {
          let promiseSubmit =
            driver.findElement(By.className('submit')).click()
          return promiseSubmit
        })
        .then(async function () {
          console.log("wait 10 seconds");
          await timer(10000);
          console.log("done");
          const nameCapitalized = senderName.charAt(0).toUpperCase() + senderName.slice(1).toLowerCase()
          console.log(nameCapitalized);

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
    })

  });
})



