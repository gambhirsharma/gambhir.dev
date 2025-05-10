---
title: Writing my first IaC with SAM
description: I build a simple web-scraping lambda function using SAM.
duration: 5min
date: 2024-12-24
---

## Background

So, I am tired of checking [Lazio Disco]()'s  scholarship website for messages. So I decided to build a simple scraping tool. The `v0.0.1` of bot was deploy in EC2 instance and save the log in the instance it self.

But after but I was fascinated by `Lambda(λ)` and want to build a full fleged IaC that can check for update notify me and save all the logs in `dyanmoDB`

## Architecture

The architecture is very simple. The `Lambda(λ)` function will be triggered by `SchedulerV2` a feature by `EventBridge` event every 30 minutes. The function will scrape the website and check for any new messages. If there are any new messages, it will save the message in `dynamoDB` and send me a message in telegram.

<img src="../../../../public/blog-assets/Lazio-Serverless Diagram.png" alt="IaC Architecture"/>

```typescript
import * as cdk from '@aws-cdk/core'
import * as lambda from '@aws-cdk/aws-lambda'

const app = new cdk.App()
```

## Problems I faced

- Lambda doesn't have support for `.env`

Check out the code at [repo](https://github.com/gambhirsharma/lazio-disco-bot)
