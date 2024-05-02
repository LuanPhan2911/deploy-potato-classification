"use client";
import { useEffect, useState } from "react";
import SelectImage from "./components/SelectImage";
import * as tfjs from "@tensorflow/tfjs";

export default function Home() {
  const labels = ["Early Blight", "Late Blight", "Healthy"];
  const [model, setModel] = useState<tfjs.GraphModel>();
  const [prediction, setPrediction] = useState({
    hasValue: false,
    error: false,
    label: "",
    confidence: "",
  });
  const [imageArr, setImageArr] = useState<tfjs.Tensor<tfjs.Rank>>();
  const [hasImage, setHasImage] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    tfjs.loadGraphModel("/model/model.json").then((result) => {
      setModel(result);
    });
  }, []);
  const getImageFile = (file: File): void => {
    setHasImage(true);
  };
  const getImageArray = (arr: tfjs.Tensor<tfjs.Rank>): void => {
    setImageArr(arr);
  };
  function argMax(array: any[]) {
    return array
      .map((x, i) => [x, i])
      .reduce((r, a) => (a[0] > r[0] ? a : r))[1];
  }
  const predict = async () => {
    if (!model || !hasImage || !imageArr) {
      return;
    }

    try {
      setLoading(true);
      tfjs.engine().startScope();
      let res = await model.predictAsync([imageArr]);
      let predictResult = Array.from(res?.dataSync());

      const predictedIndex = argMax(predictResult);
      const percent = predictResult[predictedIndex] as number;
      setPrediction((prev) => {
        return {
          ...prev,
          label: labels[predictedIndex],
          confidence: (percent * 100).toFixed(2),
          hasValue: true,
          error: false,
        };
      });

      tfjs.dispose(res);
      tfjs.engine().endScope();
    } catch (error) {
      console.log(error);
      setPrediction((prev) => {
        return {
          ...prev,
          error: true,
          hasValue: false,
        };
      });
    }
    setLoading(false);
  };
  return (
    <div className="main overflow-hidden">
      <div className="navbar">
        <div className="container-fluid">
          <div className="navbar-brand text-primary fw-bolder">
            Potato Disease Classification
          </div>
        </div>
      </div>
      <div className="row justify-content-center">
        <div className="col-lg-4 col-md-8">
          <div className="card bg-transparent shadow-lg">
            <div className="card-header bg-light">
              <div className="card-title text-primary fw-bold">
                Predict Potato Disease
              </div>
            </div>
            <div className="card-body">
              <SelectImage
                getImageArray={getImageArray}
                getImageFile={getImageFile}
              />
              {!hasImage ? (
                <div className="fst-italic fw-bold text-center">
                  Click to upload image
                </div>
              ) : (
                <div className="d-flex justify-content-center">
                  <button className="btn btn-primary" onClick={() => predict()}>
                    Predict
                  </button>
                </div>
              )}
            </div>
            {prediction?.hasValue && (
              <div className="card-footer bg-light" v-if="prediction.hasValue">
                {loading ? (
                  <div className="text-center text-primary">Predicting...</div>
                ) : (
                  <div className="row">
                    <div className="col-lg-6 text-primary fw-bold">
                      ClassName: {prediction.label}
                    </div>
                    <div className="col-lg-6 text-primary fw-bolder">
                      Confidence: {prediction.confidence}%
                    </div>
                  </div>
                )}
              </div>
            )}
            {prediction?.error && (
              <div className="card-footer bg-light">
                <div className="text-danger fw-bold text-center">
                  Error from server
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
