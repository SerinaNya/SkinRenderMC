from wand.image import Image
from wand.drawing import Drawing
from wand.color import Color

from collections import deque

background = Color("#FFFFFF")
format = "png"


def spliceSameSizeImages_right(ss_images: deque[bytes]):
    generated_image = Image(width=1, height=1, background=background)
    if not ss_images:
        raise Exception("Are you kidding me? Why your ss_images has no element???")
    while ss_images:
        with Image(blob=ss_images.popleft()) as origin, Image(
            image=generated_image
        ) as result, Drawing() as draw:
            with Image(
                width=result.width + origin.width,
                height=origin.height,
                background=background,
            ) as target:
                draw.composite(
                    operator="copy",
                    left=0,
                    top=0,
                    width=result.width,
                    height=result.height,
                    image=result,
                )
                draw.composite(
                    operator="copy",
                    left=result.width,
                    top=0,
                    width=origin.width,
                    height=origin.height,
                    image=origin,
                )
                draw(target)
                generated_image = Image(image=target)
    return generated_image.make_blob(format)
