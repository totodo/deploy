# deploy
# 用户项目的自动部署。

### Run

```
npm run start                               # local dev
pm2 start bin/www.js --name 'deploy'        # for production
```

### Note
The environment variable `DEPLOY_ENV` is very important. If you set it with `production` and it will pull code from `master` branch. Otherwise, it pull code from `test` branch

设置环境变量 `DEPLOY_ENV`是非常中庸的，如果是定了`production` 那么我们就从`master`分支上 拉取代码. 	没有设定或者设定了其他  那都从`test`分支上拉取。