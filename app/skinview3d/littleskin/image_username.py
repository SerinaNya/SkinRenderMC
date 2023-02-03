from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response

from ..core import get_image
from ..models import CommonOptions
from .littleskin_api import get_uuid, get_query

router = APIRouter()


@router.get(
    "/image/{view}",
    responses={
        200: {
            "content": {"image/png": b""},
            "description": "The front/back/both view of the player.",
        },
    },
)
async def get_view(view:get_image.VIEWS, name: str, options: CommonOptions = Depends(CommonOptions)):
    player_uuid = await get_uuid(name)
    if not player_uuid.existed:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"Player {name} does not exist in LittleSkin.")
    q = await get_query(player_uuid.id, options)
    resp = await get_image.get_view(view, q)
    return Response(resp.auto_image, media_type="image/png")
