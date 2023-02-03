# SkinRenderMC  你先别急皮肤渲染器


你说的对，但是《SkinRenderMC》是由 Xiao_Jin 开发的一款 Minecraft 皮肤渲染器。软件诞生在一个叫「FastAPI」的美好世界，在这里，被神选中的人将被授予「键盘」，导引「VSCode」​​​‌‌‌‌‌‌‌‌​​‌‌​‌‌‌​‌​。你将扮演一位名为「个人开发者」的神秘角色，在代码的编写中邂逅不同语言、不同框架的同伴们，和他们一起击败「three.js」，找回失散的「WebGL2 Canvas」—— 同时，逐步发掘「Chromium」的真相。



# 此灵车能做什么？


给它一个 HTTP 请求：


```plain
GET http://<your_server>:57680/skinview3d/image/both
    ?skinUrl=<your_skin_url>
    &capeUrl=<your_cape_url>
    &nameTag=<your_player_name>
    &definition=1.5
    &transparent=false
```


它会吐出来：


![前视角和后视角下的一个名叫 yushijinhun 的 Minecraft 玩家模型](https://pic.imgdb.cn/item/63d361afface21e9ef83c83c.png)


没错，此灵车基于 [`bs-community/skinview3d`](https://github.com/bs-community/skinview3d)，开发者 [`yushijinhun`](https://github.com/yushijinhun) 是 `skinview3d` 的现任主要维护者。


非常感谢 `yushijinhun` 在 SkinRenderMC 的开发过程中对我的指导和帮助！


# 此灵车目前接受的一些参数的详解


- `definition`  
    浮点型，默认 `1.5`  


    `0.8 <= definition <= 3.0`。值越大，越清晰，分辨率越大，数据大小越大。反之亦然。


- `transparent`
    布尔型，默认 `false`  


    值为 `true` 时，吐出来的图片的背景是透明的。


# 部署此灵车

```sh
mkdir skinrendermc && cd skinrendermc
curl -O docker-compose.yml https://github.com/jinzhijie/SkinRenderMC/raw/master/docker-compose.yml
sudo docker-compose up -d
```

服务器将在 `57680` 端口上启动，访问 `http://<ip>:56780/docs` 查看 API 文档。

---

# 中文特供部分

## 为什么叫这个中文名？

> 值越大，越清晰，分辨率越大，数据大小越大。

他们无头浏览器是这样的。

## 真的很急咋办？

> 值越大，越清晰，分辨率越大，数据大小越大。


经过测试，`definition=1.5` 能满足大部分场景下的需求。`1.25` 也能将就着用用。

## 糊！

> 值越大，越清晰，分辨率越大，数据大小越大。


## 就这么一个功能？

错误的，是文档来不及写。

此灵车支持 `image/png` 和 `application/json` 格式的响应，支持 前、后、前+后 的响应，在 json 里还能顺带告诉你传入的皮肤是不是 slim。

## 为什么叫灵车？

因为没有 Star。你知道我要说什么的 → <https://github.com/jinzhijie/SkinRenderMC>

你的 Star 就是我的动力！