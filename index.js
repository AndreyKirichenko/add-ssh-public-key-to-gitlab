import { createCursor } from 'ghost-cursor';
import fs from 'fs';
import readlineSync from 'readline-sync';
import minimist from 'minimist';
import browser from './browser.js';
import chalk from 'chalk';

const getPublicKey = async () => {
  return new Promise((resolve, reject) => {
    fs.readFile(`${process.env.HOME}/.ssh/id_rsa.pub`, 'utf8' , (error, data) => {
      if (error) {
        reject(error);
      }
      resolve(data);
    })
  })
};

const getLogin = () => {
  const { u } = minimist(process.argv.slice(2));
  const user = u || readlineSync.question('Gitlab user name: ');

  if (!user) {
    console.log(chalk.red('Empty user name!'));
    return getLogin();
  }

  return user;
}

const getPassword = () => {
  const { p } = minimist(process.argv.slice(2));
  const password = p || readlineSync.question('Gitlab password: ', {
    hideEchoBack: true,
  });

  if (!password) {
    console.log(chalk.red('Empty password'));
    return getPassword();
  }

  return password;
}

const isHomePage = (page) => {
  const url = page.url();
  return !!url.match(/com$/) || !!url.match(/com\/$/);
};

const logIn = async (page, login, password) => {
  console.log(chalk.yellow('Logging In...'));
  try {
    page.goto('http://gitlab.com/users/sign_in');

    // TODO: fix this hack
    await page.waitForTimeout(10000);

    await page.type('input[name="user[login]"]', login);
    await page.type('input[name="user[password]"]', password);

    const cursor = createCursor(page);

    await Promise.all([
      page.waitForNavigation(),
      cursor.click('input[name="commit"]')
    ]);

    if (isHomePage(page)) {
      console.log(chalk.green('Logged in!'));
      return;
    }

    throw new Error('Authorization error!')
  } catch (error) {
    throw error;
  }
};

const addPublicKey = async (page, publicKey) => {
  console.log(chalk.yellow('Adding public key...'));
  try {
    await page.goto('https://gitlab.com/-/profile/keys');

    await page.type('textarea[name="key[key]"]', publicKey);

    const cursor = createCursor(page);
    
    await Promise.all([
      page.waitForNavigation(),
      cursor.click('input[name="commit"]'),
    ]);

    const $flashError = await page.$('#error_explanation');
    if (!$flashError) {
      console.log(chalk.green('Public key is added to your gitlab account!'));
      return ;
    }  

    throw new Error('Public key adding error!')
    
  } catch (error) {
    throw error;
  }
};

const setGitlabPublicKey = async () => {  
  try {
    const login = getLogin();
    const password = getPassword();

    const page = await browser.then((browser) => browser.newPage());
    
    await logIn(page, login, password);

    const publicKey = await getPublicKey();

    await addPublicKey(page, publicKey);
  } catch (error) {
    console.log(chalk.red(error));
  }

  process.exit(0);
};

setGitlabPublicKey();

export default setGitlabPublicKey;
