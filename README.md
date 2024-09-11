# cloudflare-talk-demo
Slides for my Cloudflare talk @Tridev and demo application

[Meetup Event](https://www.meetup.com/tridev/events/301580758/) | [TriDev](https://tricities.dev/) | [More Events](http://meetup.com/TriDev)

## Hello There 👋
This repo contains the slides for my TriDev Cloudflare talk covering the basics of Cloudflare and a demo application that uses Cloudflare Workers, Pages, and various bindings to build a basic presentation app.

## Find What You're Looking For
There's a few different directories in this repo:
- [The Nextjs Frontend](https://github.com/mackenly/cloudflare-talk-demo/tree/main/durable-presentation-next)
- [The backend Durable Object](https://github.com/mackenly/cloudflare-talk-demo/tree/main/durable-presentation-server)
- [The Slides](https://github.com/mackenly/cloudflare-talk-demo/tree/main/durable-presentation-next/public/slides)

Opportunities for future development:
- Integrate the slides with R2 for storage and D1 to store the slide data
- Let users create/edit slides
- Support different types of slides including images, videos, webpages, custom text (using templates), and code snippets

## Let's Connect
Always happy to answer follow-ups, chat about tech, or whatever. Find me on the usuals:
- [X/Twitter @mackenlyjones](https://twitter.com/mackenlyjones)
- [LinkedIn @mackenly](https://linkedin.com/in/mackenly)
- [GitHub @mackenly](https://github.com/mackenly)
- [Website mackenly.com](https://mackenly.com)

## License
Note that this repo is AGPL-3.0 licensed. You are free to use, modify, and distribute the contents (unless otherwise owned) as long as you provide attribution and share-alike. See the [LICENSE](LICENSE) file for more details.

## Deployments and CI/CD
CD is set up for the Worker server.
Set secrets for:
- `CLOUDFLARE_API_TOKEN`
Connect Pages to the repo under `durable-presentation-next` for preview deployments.

In the Pages application set Secrets for:
- `AUTH_SECRET`: See https://authjs.dev/guides/environment-variables
- `AUTH_RESEND_KEY`: See https://resend.com/
- `AUTH_EMAIL_FROM`: See https://resend.com/
- `GITHUB_CLIENT_ID`: See https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app
- `GITHUB_CLIENT_SECRET`: See https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app