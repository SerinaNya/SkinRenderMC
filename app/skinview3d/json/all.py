from collections import deque

from fastapi import APIRouter, Depends

from ..api import getViewRaw
from ..models import All_Response_Json, CommonQuery
from ..utils import spliceSameSizeImages_right

router = APIRouter()


@router.get(
    "/all",
    responses={
        200: {
            "description": "The front & back & both view of the player with extra backend info. Images are base64ed.",
        }
    },
)
async def get_all(q: CommonQuery = Depends(CommonQuery)):
    resp = await getViewRaw(q.skinUrl, q.capeUrl, q.nameTag)
    resp.both = spliceSameSizeImages_right(deque([resp.front, resp.back]))
    return All_Response_Json.parse_obj(resp)
