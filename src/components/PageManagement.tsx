// src/components/PageManagement.tsx
import React from 'react';
import { PageSet } from '../types';

interface PageManagementProps {
  pages: Array<PageSet[]>;
  currentPage: number;
  onSwitchPage: (pageIndex: number) => void;
  onAddNewPage: () => void;
  onRemoveSetFromPage: (index: number) => void;
}

const PageManagement: React.FC<PageManagementProps> = ({
  pages,
  currentPage,
  onSwitchPage,
  onAddNewPage,
  onRemoveSetFromPage
}) => {
  return (
    <div className="page-management">
      <h2>Page Management</h2>
      <div className="page-tabs">
        {pages.map((page, index) => (
          <button
            key={`page-${index}`}
            className={`page-tab ${currentPage === index ? 'active' : ''}`}
            onClick={() => onSwitchPage(index)}
          >
            Page {index + 1} ({page.length} sets)
          </button>
        ))}
        <button className="add-page-button" onClick={onAddNewPage}>
          + Add Page
        </button>
      </div>

      <div className="current-page-sets">
        <h3>Sets on current page</h3>
        {pages[currentPage].length === 0 ? (
          <p>No sets added. Select a layout set from above.</p>
        ) : (
          <ul className="page-sets-list">
            {pages[currentPage].map((pageSet, index) => (
              <li key={`page-set-${index}`} className="page-set-item">
                <div className="page-set-info">
                  <span>{pageSet.setId}</span>
                  <img
                    src={pageSet.imageUrl}
                    alt={`Set thumbnail ${index}`}
                    className="set-thumbnail"
                  />
                </div>
                <button
                  className="remove-set-button"
                  onClick={() => onRemoveSetFromPage(index)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default PageManagement;
