from fastapi import APIRouter, Depends

from . import get_common_response
from ..models import All_Response_Json, CommonQuery

router = APIRouter()


async def get_all(q: CommonQuery = Depends(CommonQuery)):
    resp = await get_common_response.get_both(q)
    return All_Response_Json.parse_obj(resp)
