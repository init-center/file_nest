/* eslint-disable @next/next/no-img-element */
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Slider } from "@/components/ui/Slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import copy from "copy-to-clipboard";
import { useState } from "react";
import { toast } from "sonner";
import { Label } from "../ui/Label";
import { cn } from "@/lib/utils";

export function UrlMaker({ id }: { id: string }) {
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [quality, setQuality] = useState<number>(100);
  const [rotate, setRotate] = useState<number>(0);
  const [fit, setFit] = useState<
    "cover" | "contain" | "fill" | "inside" | "outside"
  >("cover");

  const [url, setUrl] = useState(`/files/${id}`);

  const handleSetUrl = () => {
    let url = `/files/${id}`;
    const params = new URLSearchParams();

    if (width) {
      params.set("width", width.toString());
    }
    if (height) {
      params.set("height", height.toString());
    }
    if (rotate) {
      params.set("rotate", rotate.toString());
    }
    if (quality) {
      params.set("quality", quality.toString());
    }

    if (fit) {
      params.set("fit", fit);
    }

    const count = Array.from(params.keys()).length;
    if (count > 0) {
      url += `?${params.toString()}`;
    }

    setUrl(url);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span>Rotate:</span>
          <Slider
            className="relative flex h-5 w-[200px] touch-none select-none items-center"
            defaultValue={[0]}
            value={[rotate]}
            onValueChange={(v) => setRotate(v[0] ?? 0)}
            max={180}
            min={-180}
            step={5}
          ></Slider>
          <span>{rotate}</span>
        </div>
        <div className="flex gap-2 items-center">
          <Label htmlFor="widthInput" className="mr-2">
            Width:
          </Label>
          <Input
            id="widthInput"
            type="number"
            value={width}
            max={2048}
            min={100}
            className={cn({ "text-transparent": width === 0 })}
            onChange={(e) => setWidth(Number(e.target.value))}
          />
        </div>
        <div className="flex gap-2 items-center">
          <Label htmlFor="heightInput" className="mr-2">
            Height:
          </Label>
          <Input
            id="heightInput"
            type="number"
            value={height}
            max={2048}
            min={100}
            className={cn({ "text-transparent": height === 0 })}
            onChange={(e) => setHeight(Number(e.target.value))}
          />
        </div>
        <div className="flex gap-2 items-center">
          <Label htmlFor="qualityInput" className="mr-2">
            Quality:
          </Label>
          <Input
            id="qualityInput"
            type="number"
            value={quality}
            max={100}
            min={1}
            onChange={(e) => setQuality(Number(e.target.value))}
          />
        </div>
        <div className="flex gap-2 items-center">
          <Label className="mr-2">Fit:</Label>
          <Select
            onValueChange={(e) => {
              setFit(e as "cover" | "contain" | "fill" | "inside" | "outside");
            }}
            defaultValue={fit}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Fit" />
            </SelectTrigger>
            <SelectContent>
              {["cover", "contain", "fill", "inside", "outside"].map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleSetUrl}>Make</Button>
      </div>

      <div className="flex justify-center items-center">
        <img
          src={url}
          alt="generate url"
          className=" max-w-full max-h-[60vh] min-w-[250px] min-h-[250px] object-contain"
        ></img>
      </div>

      <div className="flex justify-between items-center gap-2">
        <Input
          value={`${process.env.NEXT_PUBLIC_SITE_URL}${url}`}
          readOnly
        ></Input>
        <Button
          onClick={() => {
            copy(`${process.env.NEXT_PUBLIC_SITE_URL}${url}`);
            toast("Copy Succeed!");
          }}
        >
          Copy
        </Button>
      </div>
    </div>
  );
}
