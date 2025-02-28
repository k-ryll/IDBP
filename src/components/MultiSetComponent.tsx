// src/components/MultiSetComponent.tsx
import React from 'react';

// The PageSet interface might be defined in your `types.ts`
interface PageSet {
  setId: string;
  imageUrl: string;
  // cropArea?: ...
}

interface MultiSetProps {
  pageSets: PageSet[];
}

const MultiSetComponent: React.FC<MultiSetProps> = ({ pageSets }) => {
  if (!pageSets || pageSets.length === 0) {
    return null;
  }

  const renderSetA = (imageUrl: string) => (
    <div className="set-a-layout">
      <div className="large-photos">
        {[1, 2].map((index) => (
          <div key={`large-${index}`} className="photo photo-large">
            <img src={imageUrl} alt={`Large photo ${index}`} />
          </div>
        ))}
      </div>
      <div className="small-photos">
        <div className="small-photos-row">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={`small-row1-${idx}`} className="photo photo-small">
              <img src={imageUrl} alt={`Small photo ${idx + 1}`} />
            </div>
          ))}
        </div>
        <div className="small-photos-row">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={`small-row2-${idx}`} className="photo photo-small">
              <img src={imageUrl} alt={`Small photo ${idx + 5}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSetB = (imageUrl: string) => (
    <div className="set-b-layout">
      <div className="photo-1_5-group">
        {[1, 2, 3, 4].map((index) => (
          <div key={`1.5-${index}`} className="photo photo-1_5">
            <img src={imageUrl} alt={`1.5 photo ${index}`} />
          </div>
        ))}
      </div>
      <div className="small-photos">
        <div className="small-photos-row">
          {Array.from({ length: 2 }).map((_, idx) => (
            <div key={`small-row1-${idx}`} className="photo photo-small">
              <img src={imageUrl} alt={`Small photo ${idx + 1}`} />
            </div>
          ))}
        </div>
        <div className="small-photos-row">
          {Array.from({ length: 1 }).map((_, idx) => (
            <div key={`small-row1-${idx}`} className="photo photo-small">
              <img src={imageUrl} alt={`Small photo ${idx + 1}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  const renderSetC = (imageUrl: string) => (
    <div className="set-b-layout">
      <div className="photo-passport-group">
        {[1, 2, 3].map((index) => (
          <div key={`passport-${index}`} className="photo photo-passport">
            <img src={imageUrl} alt={`passport photo ${index}`} />
          </div>
        ))}
      </div>
      <div className="small-photos">
        <div className="small-photos-row">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={`small-row1-${idx}`} className="photo photo-small">
              <img src={imageUrl} alt={`Small photo ${idx + 1}`} />
            </div>
          ))}
        </div>
        <div className="small-photos-row">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={`small-row1-${idx}`} className="photo photo-small">
              <img src={imageUrl} alt={`Small photo ${idx + 1}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSetD = (imageUrl: string) => (
    <div className="set-d-layout">
      <div className="large-photos">
        {[1, 2, 3, 4,].map((index) => (
          <div key={`large-${index}`} className="photo photo-large">
            <img src={imageUrl} alt={`Large photo ${index}`} />
          </div>
        ))}
      </div>
      
      <div className="large-photos">
        {[5, 6].map((index) => (
          <div key={`large-${index}`} className="photo photo-large">
            <img src={imageUrl} alt={`Large photo ${index}`} />
          </div>
        ))}
      </div>
      <div className="small-photos">
        <div className="small-photos-row">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={`small-row1-${idx}`} className="photo photo-small">
              <img src={imageUrl} alt={`Small photo ${idx + 1}`} />
            </div>
          ))}
        </div>
        <div className="small-photos-row">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={`small-row2-${idx}`} className="photo photo-small">
              <img src={imageUrl} alt={`Small photo ${idx + 5}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  
  const renderSetE = (imageUrl: string) => {
    return (
      <div className="set-e-layout">
        <div className="casa-photos">
          {[1, 2, 3, 4, 5].map((index) => (
            <div key={`casa-${index}`} className="photo-casa">
              <img src={imageUrl} alt={`Casa photo ${index}`} />
            </div>
          ))}
        </div>
      </div>
    );
  };  
  

  // Render each set using its own imageUrl
  return (
    <div className="multi-set-container">
      {pageSets.map((ps, index) => (
        <div key={`set-${index}`} className="layout-set">
          {/* For screen readers / debug: */}
          <h3 style={{ display: 'none' }}>
            Set {index + 1}: {ps.setId}
          </h3>

          {ps.setId === 'setA' && renderSetA(ps.imageUrl)}
          {ps.setId === 'setB' && renderSetB(ps.imageUrl)}
          {ps.setId === 'setC' && renderSetC(ps.imageUrl)}
          {ps.setId === 'setD' && renderSetD(ps.imageUrl)}
          {ps.setId === 'setE' && renderSetE(ps.imageUrl)}
          {/* Add more sets here (Set C, D, etc.) */}
        </div>
      ))}
    </div>
  );
};

export default MultiSetComponent;
