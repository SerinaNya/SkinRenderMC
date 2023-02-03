from . import image_username

from fastapi import APIRouter

prefix = '/littleskin'

router = APIRouter()

for m in (image_username,):
    router.include_router(m.router, prefix=prefix)
