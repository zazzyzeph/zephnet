---
title: "Plants"
date: 2022-07-31T11:01:17-04:00
type: singles
layout: plants
draft: false
---

I like to grow plants sometimes, using [hydroponics](https://en.wikipedia.org/wiki/Hydroponics) usually.

I'm currently growing [aji dulce peppers](https://en.wikipedia.org/wiki/Aj%C3%AD_dulce) - a sweet and very slightly hot pepper which is a mainstay of Puerto Rican cusine.

![Close up of two small red aji dulce peppers on the plant](https://media.zephnet.biz/ajidulce2.jpg)

My current setup is a 2 pot [Autopot](https://autopot-usa.com/) system, which is fairly simple and forgiving. There are no electrical components - a mixture of water and soluable nutrients are fed throught a tube to the base of each pot, where a special valve stops water from flowing once the water level gets to a certain height. This lets the plant consume as much water and food as it needs, while the top portion of the roots get plenty of oxygen.

![A rectangular water reservoir, covered in silver reflective tape. A black tube delievers water from the reservoir to the pots the pepper plants are in.](https://media.zephnet.biz/ajidulce3.jpg)

The reservoir that came with the Autopot kit is 12.4 gallons (~47L) which lasts me about a week and a half at this point (with the plants fully grown) before refilling, and it's made of black plastic. The black plastic is a problem in the Philly summer sun, which will raise the temperature of the water to a level that blocks nutrient uptake for the plants. To mitigate this, I put some reflective insulation tape around the bucket, and it keeps the temperature down somewhat. I've considered buying a aquarium chiller for the reservoir but they're expensive!

I use [Masterblend](https://www.masterblend.com/) dry nutrients - they're cheap and work well for a wide variety of plants, though the nutrient ratios are designed for tomatoes and peppers.

![2 large pepper plants, side by side, in a large box made of PVC pipe. A white netting used to protect fruit trees from inspects is draped over the PVC tent](https://media.zephnet.biz/ajidulce1.jpg)

The plants are about 7 feet tall right now. Being in South Philly, the back alleys have tons of stray cats, raccoons, and flies - so I built this big enclosure using pvc pipe and 3 way junction corner pieces, and then covered it with one of those big zippered nets they sell to protect fruit trees from pests. This way I can get in and out to trim and harvest, and the plants have been pretty well protected. I also use a trellis net meant for supporting plants (mainly those of... evolving legality) in a similar setup, a grow tent.

![A black cat lies next to the two pots with the peppers when they were smaller](https://media.zephnet.biz/girly1.jpg)

Some of the cats are friendly, but many of them pee in whatever planters they can find, hence my defense mechanisms. (This one is taken care of by our neighbor. Her name is Girly Girl.)

![A grey long hair cat getting scratched under the chin by the camera-holder](https://media.zephnet.biz/cuddles.jpg)

This is Cuddles, another good one (rip :')

![Two other pepper plants (poblano) growing inside a reflective tent. Many red peppers are on the lower branches](https://media.zephnet.biz/phillyphoblano.jpg)

I'll grow things inside too using a grow tent setup and LED grow lights - these two are [poblano](https://en.wikipedia.org/wiki/Poblano) plants, which I let overripen so I could dehydrate them into ancho chiles for use in stews.

---

When I grow things indoors, I make timelapse videos of the plants growing - for example: [Rosella Purple Tomato (indoors)](https://drive.google.com/file/d/1yQeGwZIi2AnR_XP_2-n_cP8dcdBA7L6Z/view?usp=sharing)

I figured out a pretty good rigging situation for my grow tent:

![A circuit board is mounted on a thin piece of scrap wood, using screws and screw standoffs. There is a thin ribbon cable coming out of the thin end of the rectangular circuit board. There is a camera mount meant for a cell phone gripping the wood, which is attached to a pole inside a tent with reflective walls.](https://media.zephnet.biz/pimelapse1.jpg)

![The other side of the mounted scrap wood shows a camera, mounted to another black circuit board. It has two circular led lights on either side of the camera. The ribbon cable is connected to the camera.](https://media.zephnet.biz/pimelapse2.jpg)

It uses a [Raspberry Pi Zero 2W](https://www.adafruit.com/product/5291) as the brains, and a generic chinese IR-cut camera module which supports the Raspberry Pi Camera spec (OV5647, you can find that or similar on aliexpress or ebay). The IR cut feature means it can take images in infrared when the lights are off. I mounted these things to a small piece of scrap wood, about the size of a phone, and then I got a [Smallrig Camera Mount](https://www.amazon.com/dp/B0CM9B6DBD?ref_=ppx_hzsearch_conn_dt_b_fed_asin_title_3&th=1) which mounts to a tent pole.

I wrote a few Bash scripts which run on a [cron](https://en.wikipedia.org/wiki/Cron) scheduler
- one script takes pictures from the camera and saves them to a folder (once every 10 minutes)
- another combines all those images into a ~2.4 second video at the end of each day, and saves it to another folder
- the last one will stitch all those video files into a single timelapse video (run at the users discretion)

All scripts and instructions are here: [Insturctions & code for my Raspberry Pi plant cam setup](https://github.com/zazzyzeph/pimelapse)

---

![A black cat sits on a white table, near two flowers in small glass vases](https://media.zephnet.biz/girly2.jpg)

Bonus pic of Girly :^)

