import React, { useState } from 'react';
import axios from 'axios';
import './ImageCreate.css';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const ImageCreate = () => {
  // 상태 관리=====
  const [customPrompt, setCustomPrompt] = useState(''); // 사용자 정의 프롬프트
  const [style, setStyle] = useState(''); // 그림체
  const [background, setBackground] = useState(''); // 배경
  const [mood, setMood] = useState(''); // 필터 스타일
  const [generatedImage, setGeneratedImage] = useState(null); // 생성된 이미지
  const [loading, setLoading] = useState(false); // 로딩 상태
  const navigate = useNavigate(); // 뒤로가기 버튼

  // 카테고리별 상태 관리
  const [selectedOptions, setSelectedOptions] = useState({
    style: '',
    background: '',
    mood: '',
  });

  // 새 상태 변수 정의
  const [dimensions, setDimensions] = useState({ width: 512, height: 512 }); // Default dimensions
  const [guidanceScale, setGuidanceScale] = useState(7.5); // Default guidance scale
  const [numInferenceSteps, setNumInferenceSteps] = useState(40); // Default number of inference steps

  // ======= 옵션 변경 함수 =======
  const handleOptionChange = (category, option) => {
    // 이미 선택된 항목을 누르면 해제
    const isSame = selectedOptions[category] === option;
    const newValue = isSame ? '' : option;
  
    setSelectedOptions((prev) => ({
      ...prev,
      [category]: newValue,
    }));
  
    const styleOptions = {
      '일본 애니풍': 'anime',
      '실사풍': 'realistic',
      '레트로 감성': 'retro',
      '사이버펑크': 'cyberpunk',
    };    
  
    const backgroundOptions = {
      '해변가': 'beach',
      '푸른 하늘': 'sky',
      '숲': 'forest',
      '판타지 성': 'castle',
      '교실': 'classroom',
      '무대': 'stage',
      '복도': 'hallway',
      '카페': 'cafe',
    };    
  
    const moodOptions = {
      '자연광': 'natural',
      '네온 조명': 'neon',
      '차가운 조명': 'cool',
      '무지개 조명': 'rainbow',
    };
  
    if (category === 'style') {
      setStyle(isSame ? '' : styleOptions[option]);
    } else if (category === 'background') {
      setBackground(isSame ? '' : backgroundOptions[option]);
    } else if (category === 'mood') {
      setMood(isSame ? '' : moodOptions[option]);
    } else if (category === 'guidance') {
      if (isSame) {
        setGuidanceScale(7.5); // 기본값
      } else {
        const scale = option === 'low' ? 5 : option === 'high' ? 10 : 7.5;
        setGuidanceScale(scale);
      }
    } else if (category === 'noise') {
      if (isSame) {
        setNumInferenceSteps(50); // 기본값
      } else {
        const steps = option === 'low' ? 20 : option === 'high' ? 70 : 40;
        setNumInferenceSteps(steps);
      }
    }
  };

  // 이미지 생성 함수
  const handleGenerateImage = async () => {

    if (!customPrompt.trim()) {
      alert('프롬프트를 입력하세요!');
      return;
    }

    setLoading(true);
    setGeneratedImage(null);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_SERVER_DOMAIN}/generate-stable-img`,
        {
          prompt: customPrompt,
          art_style: style,
          background: background,
          mood: mood,
          width: dimensions.width,
          height: dimensions.height,
          guidance_scale: parseFloat(guidanceScale),
          num_inference_steps: parseInt(numInferenceSteps, 10),
        }
      );

      console.log('전달한 메시지:', response.data);
      setGeneratedImage(`data:image/png;base64,${response.data.image}`);
    } catch (error) {
      console.error('이미지 생성 오류:', error);
      alert('이미지 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 드롭다운 선택 시 width와 height를 설정하는 함수
  const handleDimensionChange = (value) => {
    const options = {
      square: { width: 512, height: 512 }, // 정사각형
      portrait: { width: 512, height: 880 }, // 세로형
      landscape: { width: 880, height: 512 }, // 가로형
    };
    console.log(`Dimension selected: ${value}`, options[value]);
    setDimensions(options[value]);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = 'generated_image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  

  return (
    <div className="imageCreate-container">
      <div className="image-create-title">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <h1>Custom Your Character Image</h1>
      </div>
      <br />
      <div className="image-create-area">
        <div className="image-create-left">
          {/* 그림체 선택 */}
          <div className="choose-image-style">
            <h3>Style</h3>
            {['일본 애니풍', '실사풍', '레트로 감성', '사이버펑크'].map(
              (style) => (
                <button
                  key={style}
                  className={selectedOptions.style === style ? 'active' : ''}
                  onClick={() => handleOptionChange('style', style)}
                >
                  {style}
                </button>
              )
            )}
            <br />
          </div>

          {/* 배경 선택 */}
          <div className="choose-bg-style">
            <h3>Background</h3>
            <div className="bg-outdoor">
              <h4>Outdoor</h4>
              {['해변가', '푸른 하늘', '숲', '판타지 성'].map((background) => (
                <button
                  key={background}
                  className={
                    selectedOptions.background === background ? 'active' : ''
                  }
                  onClick={() => handleOptionChange('background', background)}
                >
                  {background}
                </button>
              ))}
            </div>

            <div className="bg-indoor">
              <h4>Indor</h4>
              {['교실', '무대', '복도', '카페'].map((background) => (
                <button
                  key={background}
                  className={
                    selectedOptions.background === background ? 'active' : ''
                  }
                  onClick={() => handleOptionChange('background', background)}
                >
                  {background}
                </button>
              ))}
            </div>
          </div>

          <div className="choose-mood">
            {/* 필터 스타일 선택 */}
            <h3>Mood</h3>
            {[
              '자연광',
              '네온 조명',
              '차가운 조명',
              '무지개 조명',
            ].map((mood) => (
              <button
                key={mood}
                className={selectedOptions.mood === mood ? 'active' : ''}
                onClick={() => handleOptionChange('mood', mood)}
              >
                {mood}
              </button>
            ))}
          </div>
          <br />

          <div className="choose-size">
            <h3>Size</h3>
            <select
              onChange={(e) => handleDimensionChange(e.target.value)} // 드롭다운에서 선택하면 handleDimensionChange 호출
              style={{ marginLeft: '10px', padding: '5px' }}
            >
              <option value="square">정사각형 (512x512)</option>
              <option value="portrait">세로형 (512x880)</option>
              <option value="landscape">가로형 (880x512)</option>
            </select>
          </div>
          <br />
          <div className="choose-guidance">
            <h3>Guidance</h3>
            <p className="c-dic">
              프롬프트 충실도 단계가 높을수록 프롬프트를 강하게 반영합니다.
            </p>
            {['low', 'normal', 'high'].map((guidance) => (
              <button
                key={guidance}
                className={
                  selectedOptions.guidance === guidance ? 'active' : ''
                }
                onClick={() => handleOptionChange('guidance', guidance)}
              >
                {guidance}
              </button>
            ))}
          </div>
          <br />
          <div className="chose-noise">
            <h3>Noise</h3>
            <p className="c-dic">
              노이즈 제거 단계가 높을수록 소요되는 시간이 증가됩니다.
            </p>
            {['low', 'normal', 'high'].map((noise) => (
              <button
                key={noise}
                className={selectedOptions.noise === noise ? 'active' : ''}
                onClick={() => handleOptionChange('noise', noise)}
              >
                {noise}
              </button>
            ))}
          </div>
        </div>
        <br />

        <div className="image-create-right">
          {/* 사용자 프롬프트 입력 */}
          <div className="user-prompts">
            <h3>Promt</h3>

            <textarea
              className=""
              placeholder="원하는 프롬프트를 입력해 나만의 캐릭터 이미지를 만들어보세요."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              rows="3"
              cols="50"
            />
          </div>

          <button
            onClick={handleGenerateImage}
            disabled={loading}
            style={{ marginTop: '10px' }}
          >
            {loading ? '생성 중...(5분 정도 소요)' : '이미지 생성'}
          </button>

          <div className="create-finished-area">
            <p>Generated Image:</p>
            {generatedImage && (
              <div className="finished-image" style={{ marginTop: '20px' }}>
                <img
                  src={generatedImage}
                  alt="생성된 이미지"
                  style={{ maxWidth: '100%', maxHeight: '400px' }}
                />
                <br />
                <button onClick={handleDownload} style={{ marginTop: '10px' }}>
                  이미지 다운로드
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCreate;
