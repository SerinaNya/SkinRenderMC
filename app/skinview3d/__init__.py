from . import image, json
from fastapi import APIRouter

prefix = '/skinview3d'

router = APIRouter()

for m in (image, json):
    router.include_router(m.router, prefix=prefix)
