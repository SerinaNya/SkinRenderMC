from collections import deque

from fastapi import APIRouter, Depends
from fastapi.responses import Response

from ..api import getViewRaw
from ..models import CommonQuery
from ..utils import spliceSameSizeImages_right

router = APIRouter()


@router.get(
    "/both",
    responses={
        200: {
            "description": "The front and back view of the player.",
        }
    },
)
async def get_both(q: CommonQuery = Depends(CommonQuery)):
    resp = await getViewRaw(
        True, True, q.skinUrl, q.capeUrl, q.nameTag, q.definition, q.transparent
    )
    return Response(
        spliceSameSizeImages_right(deque((resp.front, resp.back))),
        media_type="image/png",
    )
