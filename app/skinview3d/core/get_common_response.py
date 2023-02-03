from fastapi.responses import Response
from collections import deque

from ..render_api import getViewRaw
from ..models import CommonQuery, CommonResponse
from ..utils import spliceSameSizeImages_right


async def _get(q: CommonQuery, shot_front: bool = True, shot_back: bool = True) -> CommonResponse:
    resp = await getViewRaw(
        shot_front,
        shot_back,
        q.skinUrl,
        q.capeUrl,
        q.nameTag,
        q.definition,
        q.transparent,
    )
    return resp


async def get_front(q: CommonQuery) -> CommonResponse:
    return await _get(q, shot_back=False)


async def get_back(q: CommonQuery) -> CommonResponse:
    return await _get(q, shot_front=False)


async def get_both(q: CommonQuery) -> CommonResponse:
    resp = await _get(q)
    resp.both = spliceSameSizeImages_right(deque((resp.front, resp.back)))
    return resp