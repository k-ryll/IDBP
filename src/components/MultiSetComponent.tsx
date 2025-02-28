import React from 'react';

interface MultiSetProps {
  uploadedImage: string | null;
  sets: string[];
}

const MultiSetComponent: React.FC<MultiSetProps> = ({ uploadedImage, sets }) => {
  if (!uploadedImage || sets.length === 0) {
    return null;
  }
  
  const renderSetA = () => {
    return (
      <div className="set-a-layout">
        {/* Two 2x2 large photos */}
        <div className="large-photos">
          {[1, 2].map(index => (
            <div key={`large-${index}`} className="photo photo-large">
              <img src={uploadedImage} alt={`Large photo ${index}`} />
            </div>
          ))}
        </div>
        
        {/* Eight 1x1 small photos in 2 rows of 4, next to the 2x2 photos */}
        <div className="small-photos">
          <div className="small-photos-row">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={`small-row1-${index}`} className="photo photo-small">
                <img src={uploadedImage} alt={`Small photo ${index + 1}`} />
              </div>
            ))}
          </div>
          <div className="small-photos-row">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={`small-row2-${index}`} className="photo photo-small">
                <img src={uploadedImage} alt={`Small photo ${index + 5}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  // Render all selected sets
  return (
    <div className="multi-set-container">
      {sets.map((setId, index) => (
        <div key={`set-${setId}-${index}`} className="layout-set">
          <h3 style={{display : "none"}}>Set {index + 1}: {setId}</h3>
          {setId === 'setA' && renderSetA()}
          {/* Add more set types here when you create them */}
        </div>
      ))}
    </div>
  );
};

export default MultiSetComponent;