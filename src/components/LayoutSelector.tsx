// src/components/LayoutSelector.tsx
import React from 'react';
import { LayoutSet } from '../types';

interface LayoutSelectorProps {
  availableLayoutSets: LayoutSet[];
  currentImage: string | null;
  onAddSetToPage: (setId: string) => void;
}

const LayoutSelector: React.FC<LayoutSelectorProps> = ({
  availableLayoutSets,
  currentImage,
  onAddSetToPage
}) => {
  return (
    <div className="layout-options">
      <h2>Available Layout Sets</h2>
      <div className="layout-sets">
        {availableLayoutSets.map(set => (
          <div key={set.id} className="layout-set-option">
            <h3>{set.name}</h3>
            <p>{set.description}</p>
            <button
              className="add-set-button"
              onClick={() => onAddSetToPage(set.id)}
              disabled={!currentImage}
            >
              Add to current page
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LayoutSelector;
