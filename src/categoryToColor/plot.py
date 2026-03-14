import json
import matplotlib.pyplot as plt
import colorsys




with open("categoryVectors.json") as f:
    data = json.load(f)

with open("categories.json") as f:
    myCats = json.load(f)

xs = []
ys = []
colors = []
labels = []

for cat in myCats:
    d = data[cat]

    xs.append(d["x"])
    ys.append(d["y"])
    labels.append(cat)

    r,g,b = colorsys.hsv_to_rgb(d["hue"], d["saturation"], 1)
    colors.append((r,g,b))

plt.figure(figsize=(8,8))
plt.scatter(xs, ys, c=colors)

for x,y,label in zip(xs,ys,labels):
    plt.text(x,y,label, fontsize=8)

plt.show()