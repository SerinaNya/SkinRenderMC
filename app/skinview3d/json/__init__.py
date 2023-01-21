from fastapi import APIRouter

from . import all

prefix = "/json"

router = APIRouter()

for m in (all,):
    router.include_router(m.router, prefix=prefix)
