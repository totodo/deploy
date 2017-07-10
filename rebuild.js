const moment         = require("moment");
const exec           = require('child_process').exec;


const releaseRoot    = '/home/qkong/release';
const wwwPath        = '/root/www';
const projects = ['WisdomStudy', 'web-admin'];

const parse = (params) => {
  const result = {
    ref: param.ref,
    repoName: param.repository.name,
    pusher: param.user.name
  };
  let commits = [];
  param.commits.forEach((commit) => {
    commits.push({
      message: commit.message,
    });
  });
  result.commits = commits;
  return result;
};


const socket = require('socket.io-client')('http://101.200.167.37:6679');
socket.on('connect', function(){
  console.log('socket connected');
});


function t() {
  return moment().format('YYYY-MM-DD-HH-mm-ss');
}
module.exports = (body) => {
  if (body.zen) {
    console.log('is zen');
    return ;
  }
  const msg = parse(body);
  const branch = msg.ref;
  const deployEnv = process.env.DEPLOY_ENV || 'test';

  console.log('deploy start:', t());
  console.log("repoName:", msg.repoName);
  console.log("deployEnv:", deployEnv);
  
  let branchName = '';
  if (branch === 'refs/heads/test') {
    branchName = 'test';
  } else if (branch === 'refs/heads/master'){
    branchName = 'master';
  } else {
    console.log('Invalid branch:', branch);
    return ;
  }
  console.log("branchName:", branchName);

  if (branch === 'refs/heads/test') {
    if (deployEnv === 'production') {
      console.log('ignore');
      return;
    }
  } else if (branch === 'refs/heads/master') {
    if (deployEnv === 'test') {
      console.log('ignore');
      return;
    }
  } else {
    console.log('ignore');
    return ;
  }
  const repoName = msg.repoName;

  if (projects.indexOf(repoName) === -1) {
    console.log('Invalid repoName', repoName);
    return ;
  }
  const releasePath = `${releaseRoot}/${repoName}/${t()}`;
  let cmd = [];

  switch (repoName) {
    case 'web-admin':
      cmd = [
        `cd /root/github/${repoName}`,
        `git pull origin ${branchName}`,
        'cnpm i',
        'npm run build',
        `cp -R dist ${releasePath}`,
        `rm -rf ${wwwPath}/${repoName}/dist`,
        `ln -s ${releasePath} ${wwwPath}/${repoName}/dist`
      ];
      break;
    case 'WisdomStudy':
      cmd = [
        `cd /root/github/${repoName}`,
        `git pull origin ${branchName}`,
        'cnpm install',
        `rsync -av --exclude node_modules ../${repoName} ${releasePath}`,
        `ln -s /root/github/${repoName}/node_modules ${releasePath}/${repoName}/node_modules`,
        `cd ${releasePath}/${repoName}/`,
        `pm2 delete ${repoName}`,
        `pm2 start bin/www.js --name "${repoName}"`
      ];
      break;
  }

  const cmds = cmd.join(' && ');
  exec(cmds, {}, function (error, stdout, stderr) {
    if (error) {
      console.error(error);
      return;
    }
    socket.emit('deploy',{date: new Date(), env: deployEnv, msg: msg});
    console.log('deploy over:', new Date());
  });
};