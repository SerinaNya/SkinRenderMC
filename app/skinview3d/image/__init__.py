from fastapi import APIRouter

from . import front, back, both

prefix = '/image'

router = APIRouter()

for m in (front, back, both):
    router.include_router(m.router, prefix=prefix)