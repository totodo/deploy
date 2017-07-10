# deploy

### Run

```
npm run start                               # local dev
pm2 start bin/www.js --name 'deploy'        # for production
```

### Note
The environment variable `DEPLOY_ENV` is very important. If you set it with `production` and it will pull code from `master` branch. Otherwise, it pull code from `test` branch