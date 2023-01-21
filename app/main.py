from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from . import skinview3d

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

for m in (skinview3d, ):
    app.include_router(m.router)


@app.get("/")
async def root():
    return {"status": status.HTTP_200_OK, "msg": "SkinRenderMC"}


