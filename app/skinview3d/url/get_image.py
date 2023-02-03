from fastapi import APIRouter, Depends
from fastapi.responses import Response

from ..core import get_image
from ..models import CommonResponse

router = APIRouter()


@router.get(
    "/image/{view}",
    responses={
        200: {
            "content": {"image/png": b""},
            "description": "The front/back/both view of the player.",
        }
    },
)
async def get_view(upstream_resp: CommonResponse = Depends(get_image.get_view)):
    return Response(upstream_resp.auto_image, media_type="image/png")
