from yggdrasil_mc import YggdrasilPlayer

from ..models import CommonQuery, CommonOptions

LITTLESKIN = YggdrasilPlayer("https://littleskin.cn/api/yggdrasil")


async def get_uuid(player_name: str):
    return await LITTLESKIN.Uuid.get3rdAsync(player_name)


async def get_query(player_uuid: str, options: CommonOptions = CommonOptions()):
    resp = await LITTLESKIN.Profile.get3rdAsync(player_uuid)
    name_tag = resp.name
    skin_url = resp.properties.textures.textures.skin.url
    cape_url = resp.properties.textures.textures.cape.url
    return CommonQuery(skinUrl=skin_url, capeUrl=cape_url, nameTag=name_tag).copy(
        update=options.dict()
    )
