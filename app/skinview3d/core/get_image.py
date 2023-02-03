from typing import Literal

from fastapi import Depends

from ..models import CommonQuery
from . import get_common_response

VIEWS = Literal["front", "back", "both"]

async def get_view(
    view: VIEWS, q: CommonQuery = Depends(CommonQuery)
):
    match view:
        case "front":
            return await get_common_response.get_front(q)
        case "back":
            return await get_common_response.get_back(q)
        case "both":
            return await get_common_response.get_both(q)
