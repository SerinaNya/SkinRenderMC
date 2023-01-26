from fastapi import APIRouter, Depends
from fastapi.responses import Response

from ..api import getViewRaw
from ..models import CommonQuery

router = APIRouter()


@router.get(
    "/front",
    responses={
        200: {
            "content": {"image/png": b""},
            "description": "The front view of the player.",
        }
    },
)
async def get_front(q: CommonQuery = Depends(CommonQuery)):
    resp = await getViewRaw(
        True, False, q.skinUrl, q.capeUrl, q.nameTag, q.definition, q.transparent
    )
    return Response(resp.front, media_type="image/png")
