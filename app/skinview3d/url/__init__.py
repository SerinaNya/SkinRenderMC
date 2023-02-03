from . import get_image, get_json
from fastapi import APIRouter

prefix = '/url'

router = APIRouter()

for m in (get_image, get_json):
    router.include_router(m.router, prefix=prefix)
