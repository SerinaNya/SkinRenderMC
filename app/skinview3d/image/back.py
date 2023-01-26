from fastapi import APIRouter, Depends
from fastapi.responses import Response

from ..api import getViewRaw
from ..models import CommonQuery

router = APIRouter()


@router.get(
    "/back",
    responses={
        200: {
            "content": {"image/png": b""},
            "description": "The back view of the player.",
        }
    },
)
async def get_back(q: CommonQuery = Depends(CommonQuery)):
    resp = await getViewRaw(
        False, True, q.skinUrl, q.capeUrl, q.nameTag, q.definition, q.transparent
    )
    return Response(resp.back, media_type="image/png")
