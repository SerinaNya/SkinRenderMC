from yggdrasil_mc.ygg_async import YggdrasilGameProfileApi, YggdrasilPlayerUuidApi

from ..models import CommonQuery, CommonOptions

LITTLESKIN = "https://littleskin.cn/api/yggdrasil"


async def get_uuid(player_name: str):
    return await YggdrasilPlayerUuidApi.getBlessingSkinServer(LITTLESKIN, player_name)


async def get_query(player_uuid: str, options: CommonOptions = CommonOptions()):
    resp = await YggdrasilGameProfileApi.getBlessingSkinServer(LITTLESKIN, player_uuid)
    name_tag = resp.name
    skin_url = resp.properties.textures.textures.skin.url
    cape_url = resp.properties.textures.textures.cape.url
    return CommonQuery(skinUrl=skin_url, capeUrl=cape_url, nameTag=name_tag).copy(
        update=options.dict()
    )
