import React, { useState, useRef, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';

const ImageClassifier = ({ onImageSelect }) => {
  const [model, setModel] = useState(null);
  const [prediction, setPrediction] = useState('');
  const [preview, setPreview] = useState(null);
  const imgRef = useRef();

  useEffect(() => {
    async function loadModel() {
      try {
        console.log("Loading TensorFlow Model...");
        const loadedModel = await mobilenet.load();
        setModel(loadedModel);
        console.log("Model Loaded!");
      } catch (err) {
        console.error("Failed to load model", err);
      }
    }
    loadModel();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      setPrediction("분석 중...");
      if(onImageSelect) onImageSelect(file); // 상위로 파일 전달
    }
  };

  const classify = async () => {
    if (model && imgRef.current) {
      try {
        const predictions = await model.classify(imgRef.current);
        if (predictions && predictions.length > 0) {
            // 확률을 퍼센트로 변환
          setPrediction(`AI 분석 결과: ${predictions[0].className} (${(predictions[0].probability * 100).toFixed(1)}%)`);
        }
      } catch (err) {
        setPrediction("분석 실패");
      }
    }
  };

  return (
    <div style={{ margin: '15px 0', padding: '15px', border: '1px solid #ddd', borderRadius:'8px', background: '#fafafa' }}>
      <h4 style={{marginBottom:'10px', color:'#004098'}}>🖼️ AI 이미지 분석 (TensorFlow.js)</h4>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {preview && (
        <div style={{ marginTop: '10px' }}>
          <img 
            ref={imgRef} 
            src={preview} 
            alt="Preview" 
            style={{ maxWidth: '200px', maxHeight:'200px', borderRadius: '5px', display:'block', marginBottom:'5px' }} 
            onLoad={classify}
          />
          <p style={{ color: '#004098', fontWeight: 'bold' }}>{prediction}</p>
        </div>
      )}
    </div>
  );
};

export default ImageClassifier;