import Image from "next/image";
import defaultImage from "@/app/assets/default.png";
import * as tfjs from "@tensorflow/tfjs";
import { FunctionComponent, useRef, useState } from "react";

interface SelectImageProps {
  getImageFile: (file: File) => void;
  getImageArray: (arr: tfjs.Tensor<tfjs.Rank>) => void;
}

const SelectImage: FunctionComponent<SelectImageProps> = ({
  getImageArray,
  getImageFile,
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const previewImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target;

    if (!input.files?.length) {
      return;
    }

    const file = input.files[0];
    getImageFile(file);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(() => {
      return URL.createObjectURL(file);
    });

    const img = tfjs.browser.fromPixels(imgRef.current!);
    const floatImg = img.toFloat();
    const resizeImg = floatImg.resizeNearestNeighbor([256, 256]);
    const arrImg = resizeImg.expandDims(0);
    getImageArray(arrImg);
  };
  return (
    <>
      <div className="mb-3">
        <label
          htmlFor="avatar"
          className="d-flex justify-content-center mb-3 cursor-pointer"
        >
          <Image
            src={previewUrl ? previewUrl : defaultImage}
            width={256}
            height={300}
            alt="None"
            ref={imgRef}
          />
        </label>
        <input
          className="form-control"
          name="avatar"
          type="file"
          id="avatar"
          accept="image/*"
          hidden
          onChange={(e) => previewImage(e)}
        />
      </div>
    </>
  );
};

export default SelectImage;
