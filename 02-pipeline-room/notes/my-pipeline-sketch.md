# How I think about CI vs CD

I used to think a pipeline was just running `npm test` on a GitHub server. That is one part, but the flow is more useful when each stage answers a separate question.

```text
My laptop                       GitHub Actions
----------                      --------------
edit code
    |
    +-- npm test                push / PR
    |                               |
    +-- git push ----------------> checkout
                                    |
                           static checks + tests
                                    |
                            build a dist folder
                                    |
                         verify checksum manifest
                                    |
                             build Docker image
                                    |
                    PR: no push  | main: publish image

                         v1.0.0 release tag
                                    |
                         rebuild + check version
                                    |
                           upload bundle artifact
```

`CI` means I get feedback when code changes. `CD` can mean delivery or actual deployment. This lab does continuous delivery *up to* a packaged artifact or container image. It does **not** change a running live service, so calling it fully automated production deployment would be wrong.

The API itself isn't complicated. Most of the practice is learning to keep a repeatable path from the same source tree to the same build contents.
