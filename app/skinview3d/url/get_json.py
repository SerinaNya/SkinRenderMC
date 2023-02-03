from fastapi import APIRouter, Depends

from ..core import get_common_response
from ..models import All_Response_Json, CommonQuery

router = APIRouter()


@router.get(
    "/json/all",
    responses={
        200: {
            "description": "The front & back & both view of the player with extra backend info. Images are base64ed.",
        }
    },
)
async def get_all(q: CommonQuery = Depends(CommonQuery)):
    resp = await get_common_response.get_both(q)
    return All_Response_Json.parse_obj(resp)
