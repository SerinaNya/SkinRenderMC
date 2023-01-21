# SkinRenderMC

Render your Minecraft Skins and Capes in 3D view.

# What can this app do?

Send a HTTP request:
```plain
GET http://<your_server>:57680/skinview3d/image/both
    ?skinUrl=<your_skin_url>
    &capeUrl=<your_cape_url>
    &nameTag=<your_player_name>
```

You will get:

![the view from the front and the back of a minecraft player model](./assets/yushijinhun_both.png)

Yes, this app depends on [`bs-community/skinview3d`](https://github.com/bs-community/skinview3d), and [`yushijinhun`](https://github.com/yushijinhun) is the main maintainer of the `skinview3d` project.

Thanks to `yushijinhun` for guiding me during the development of this app.

# Deploy
Check out the **PRETTY** & **HARMLESS** `docker-compose.yml`!  
You know what you are supposed to do now!