import React, { useState, useRef } from 'react';
import './App.css';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface LayoutSet {
  id: string;
  name: string;
  layoutType: 'setA' | 'custom';
  description: string;
}

interface PageSet {
  setId: string;
  imageUrl: string;
  cropArea: CropArea | null;
}

const availableLayoutSets: LayoutSet[] = [
  {
    id: 'setA',
    name: 'Set A',
    layoutType: 'setA',
    description: '2 large (2x2) photos and 8 small (1x1) photos'
  },
  // More sets can be added here
];

const App: React.FC = () => {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [pages, setPages] = useState<Array<PageSet[]>>([[]]);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [isCropping, setIsCropping] = useState<boolean>(false);
  const [cropStart, setCropStart] = useState<{ x: number, y: number } | null>(null);
  const [cropArea, setCropArea] = useState<CropArea | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const cropCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target) {
          const imageUrl = event.target.result as string;
          setUploadedImages([...uploadedImages, imageUrl]);
          setCurrentImage(imageUrl);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };
  
  // Start crop
  const startCrop = () => {
    if (!currentImage) return;
    setIsCropping(true);
    setCropArea(null);
    
    // Initialize the canvas with the image for cropping
    const canvas = cropCanvasRef.current;
    const image = imageRef.current;
    
    if (canvas && image) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Set canvas size to match the image
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        
        // Draw the image on the canvas
        ctx.drawImage(image, 0, 0);
      }
    }
  };
  
  // Handle mouse down on crop canvas
  const handleCropMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = cropCanvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    setCropStart({ x, y });
    setCropArea({ x, y, width: 0, height: 0 });
  };
  
  // Handle mouse move on crop canvas
  const handleCropMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!cropStart || !cropArea) return;
    
    const canvas = cropCanvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    // Update the crop area
    const width = x - cropStart.x;
    const height = y - cropStart.y;
    
    setCropArea({
      x: cropStart.x,
      y: cropStart.y,
      width,
      height
    });
    
    // Redraw the canvas with the crop area
    drawCropCanvas();
  };
  
  // Handle mouse up on crop canvas
  const handleCropMouseUp = () => {
    setCropStart(null);
  };
  
  // Draw the crop area on the canvas
  const drawCropCanvas = () => {
    const canvas = cropCanvasRef.current;
    const image = imageRef.current;
    
    if (!canvas || !image || !cropArea) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw the image
    ctx.drawImage(image, 0, 0);
    
    // Draw semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Clear the crop area to show the image
    ctx.clearRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
    
    // Draw border around crop area
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
  };
  
  // Apply the crop
  const applyCrop = () => {
    if (!cropArea || !currentImage) {
      setIsCropping(false);
      return;
    }
    
    const canvas = document.createElement('canvas');
    const image = imageRef.current;
    
    if (!image) {
      setIsCropping(false);
      return;
    }
    
    // Create a new canvas for the cropped image
    canvas.width = Math.abs(cropArea.width);
    canvas.height = Math.abs(cropArea.height);
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsCropping(false);
      return;
    }
    
    // Calculate crop coordinates (handle negative width/height)
    const cropX = cropArea.width > 0 ? cropArea.x : cropArea.x + cropArea.width;
    const cropY = cropArea.height > 0 ? cropArea.y : cropArea.y + cropArea.height;
    const cropWidth = Math.abs(cropArea.width);
    const cropHeight = Math.abs(cropArea.height);
    
    // Draw the cropped portion
    ctx.drawImage(
      image, 
      cropX, cropY, cropWidth, cropHeight,
      0, 0, cropWidth, cropHeight
    );
    
    // Get data URL of the cropped image
    const croppedImageUrl = canvas.toDataURL('image/jpeg');
    
    // Add the cropped image to the list
    setUploadedImages([...uploadedImages, croppedImageUrl]);
    setCurrentImage(croppedImageUrl);
    
    // Exit cropping mode
    setIsCropping(false);
  };
  
  // Cancel crop
  const cancelCrop = () => {
    setIsCropping(false);
    setCropArea(null);
  };
  
  // Add selected set to current page
  const addSetToPage = (setId: string) => {
    if (!currentImage) return;
    
    const updatedPages = [...pages];
    updatedPages[currentPage] = [
      ...updatedPages[currentPage], 
      {
        setId,
        imageUrl: currentImage,
        cropArea: null // No additional cropping for the set layout
      }
    ];
    setPages(updatedPages);
  };
  
  // Remove a set from current page
  const removeSetFromPage = (index: number) => {
    const updatedPages = [...pages];
    updatedPages[currentPage] = updatedPages[currentPage].filter((_, i) => i !== index);
    setPages(updatedPages);
  };
  
  // Add a new page
  const addNewPage = () => {
    setPages([...pages, []]);
    setCurrentPage(pages.length);
  };
  
  // Switch to a different page
  const switchPage = (pageIndex: number) => {
    setCurrentPage(pageIndex);
  };
  
  // Select an uploaded image to use
  const selectImage = (imageUrl: string) => {
    setCurrentImage(imageUrl);
  };
  
 // Save to PDF
const saveToPDF = async () => {
  if (!canvasRef.current || pages.every(page => page.length === 0)) return;
  
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  // Process each page one by one
  for (let i = 0; i < pages.length; i++) {
    if (pages[i].length === 0) continue;
    
    // If not the first page, add a new page
    if (i > 0) {
      pdf.addPage();
    }
    
    // Create a clone of the current page canvas for conversion
    const pageElement = canvasRef.current.cloneNode(true) as HTMLElement;
    
    // Temporarily update the clone with content from the target page
    if (i !== currentPage) {
      // Clear the clone and add the correct page content
      const container = pageElement.querySelector('.multi-set-container');
      if (container) {
        container.innerHTML = '';
        
        // Add the sets from the target page
        pages[i].forEach((pageSet) => {
          const setDiv = document.createElement('div');
          setDiv.className = 'layout-set';
          
          if (pageSet.setId === 'setA') {
            setDiv.innerHTML = `
              <div class="set-a-layout">
                <div class="large-photos">
                  ${[1, 2].map(photoIndex => `
                    <div class="photo photo-large">
                      <img src="${pageSet.imageUrl}" alt="Large photo ${photoIndex}" style="object-fit: cover; width: 100%; height: 100%;">
                    </div>
                  `).join('')}
                </div>
                <div class="small-photos">
                  <div class="small-photos-row">
                    ${Array.from({ length: 4 }).map((_, photoIndex) => `
                      <div class="photo photo-small">
                        <img src="${pageSet.imageUrl}" alt="Small photo ${photoIndex + 1}" style="object-fit: cover; width: 100%; height: 100%;">
                      </div>
                    `).join('')}
                  </div>
                  <div class="small-photos-row">
                    ${Array.from({ length: 4 }).map((_, photoIndex) => `
                      <div class="photo photo-small">
                        <img src="${pageSet.imageUrl}" alt="Small photo ${photoIndex + 5}" style="object-fit: cover; width: 100%; height: 100%;">
                      </div>
                    `).join('')}
                  </div>
                </div>
              </div>
            `;
          }
          
          container.appendChild(setDiv);
        });
      }
    }
    
    // Prepare for PDF rendering
    pageElement.style.position = 'absolute';
    pageElement.style.left = '-9999px';
    pageElement.style.width = '210mm';
    pageElement.style.height = '297mm';
    pageElement.style.margin = '0';
    pageElement.style.padding = '8px';
    pageElement.style.border = 'none';
    pageElement.style.backgroundColor = 'white';
    
    // Temporarily add to document
    document.body.appendChild(pageElement);
    
    // Convert to image with proper dimensions
    const canvas = await html2canvas(pageElement, {
      scale: 2, // Higher quality
      useCORS: true,
      allowTaint: true,
      width: 210 * 3.78, // A4 width in pixels (1mm ≈ 3.78px)
      height: 297 * 3.78, // A4 height in pixels
      logging: false,
      backgroundColor: '#FFFFFF'
    });
    
    // Add the image to the PDF
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
    
    // Remove the temporary element
    document.body.removeChild(pageElement);
  }
  
  // Save the PDF
  pdf.save('photo-layout.pdf');
};
  // Render the Set A layout for display
  const renderSetA = (imageUrl: string) => {
    return (
      <div className="set-a-layout">
        {/* Two 2x2 large photos */}
        <div className="large-photos">
          {[1, 2].map(index => (
            <div key={`large-${index}`} className="photo photo-large">
              <img src={imageUrl} alt={`Large photo ${index}`} />
            </div>
          ))}
        </div>
        
        {/* Eight 1x1 small photos in 2 rows of 4, next to the 2x2 photos */}
        <div className="small-photos">
          <div className="small-photos-row">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={`small-row1-${index}`} className="photo photoc-small">
                <img src={imageUrl} alt={`Small photo ${index + 1}`} />
              </div>
            ))}
          </div>
          <div className="small-photos-row">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={`small-row2-${index}`} className="photo photo-small">
                <img src={imageUrl} alt={`Small photo ${index + 5}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="App">
      <header className="App-header">
        <h1>IDBP Manila Photo Printing</h1>
      </header>
      
      {isCropping ? (
        <div className="cropping-container">
          <h2>Crop Image</h2>
          <div className="crop-canvas-container">
            <canvas
              ref={cropCanvasRef}
              className="crop-canvas"
              onMouseDown={handleCropMouseDown}
              onMouseMove={handleCropMouseMove}
              onMouseUp={handleCropMouseUp}
              onMouseLeave={handleCropMouseUp}
            ></canvas>
            <img
              ref={imageRef}
              src={currentImage || ''}
              style={{ display: 'none' }}
              alt="Image for cropping"
              onLoad={() => {
                const canvas = cropCanvasRef.current;
                const image = imageRef.current;
                if (canvas && image) {
                  canvas.width = image.naturalWidth;
                  canvas.height = image.naturalHeight;
                  const ctx = canvas.getContext('2d');
                  if (ctx) {
                    ctx.drawImage(image, 0, 0);
                  }
                }
              }}
            />
          </div>
          <div className="crop-actions">
            <p>Click and drag to select crop area</p>
            <button className="apply-crop-button" onClick={applyCrop}>Apply Crop</button>
            <button className="cancel-crop-button" onClick={cancelCrop}>Cancel</button>
          </div>
        </div>
      ) : (
        <div className="container">
          <div className="controls">
            <div className="upload-section">
            <h2>Upload &amp; Manage Images</h2>
      {/* Hidden file input */}
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="file-input"
        id="file-upload"
        multiple
      />
      {/* Styled label that triggers the file input */}
      <label htmlFor="file-upload" className="file-label">
        Choose Images
      </label>
              
              {uploadedImages.length > 0 && (
                <div className="image-gallery">
                  <h3>Your Images</h3>
                  <div className="image-thumbnails">
                    {uploadedImages.map((img, index) => (
                      <div 
                        key={`img-${index}`}
                        className={`image-thumbnail ${currentImage === img ? 'selected' : ''}`}
                        onClick={() => selectImage(img)}
                      >
                        <img src={img} alt={`Thumbnail ${index}`} />
                      </div>
                    ))}
                  </div>
                  
                  {currentImage && (
                    <div className="selected-image-actions">
                      <button className="crop-button" onClick={startCrop}>Crop This Image</button>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="layout-options">
              <h2>Available Layout Sets</h2>
              <div className="layout-sets">
                {availableLayoutSets.map(set => (
                  <div 
                    key={set.id} 
                    className="layout-set-option"
                  >
                    <h3>{set.name}</h3>
                    <p>{set.description}</p>
                    <button 
                      className="add-set-button"
                      onClick={() => addSetToPage(set.id)}
                      disabled={!currentImage}
                    >
                      Add to current page
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="page-management">
              <h2>Page Management</h2>
              <div className="page-tabs">
                {pages.map((page, index) => (
                  <button 
                    key={`page-${index}`}
                    className={`page-tab ${currentPage === index ? 'active' : ''}`}
                    onClick={() => switchPage(index)}
                  >
                    Page {index + 1} ({page.length} sets)
                  </button>
                ))}
                <button className="add-page-button" onClick={addNewPage}>+ Add Page</button>
              </div>
              
              <div className="current-page-sets">
                <h3>Sets on current page</h3>
                {pages[currentPage].length === 0 ? (
                  <p>No sets added. Select a layout set from above.</p>
                ) : (
                  <ul className="page-sets-list">
                    {pages[currentPage].map((pageSet, index) => {
                      const set = availableLayoutSets.find(s => s.id === pageSet.setId);
                      return (
                        <li key={`page-set-${index}`} className="page-set-item">
                          <div className="page-set-info">
                            <span>{set?.name || pageSet.setId}</span>
                            <img src={pageSet.imageUrl} alt={`Set thumbnail ${index}`} className="set-thumbnail" />
                          </div>
                          <button 
                            className="remove-set-button"
                            onClick={() => removeSetFromPage(index)}
                          >
                            Remove
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </div>
          
          <div className="output-section">
            <h2>A4 Canvas - Page {currentPage + 1}</h2>
            <div 
              ref={canvasRef} 
              className="a4-canvas"
            >
              <div className="multi-set-container">
                {pages[currentPage].map((pageSet, index) => {
                  const set = availableLayoutSets.find(s => s.id === pageSet.setId);
                  return (
                    <div key={`output-set-${index}`} className="layout-set">
                      <h3 style={{display: "none"}}>Set {index + 1}: {set?.name || pageSet.setId}</h3>
                      {pageSet.setId === 'setA' && renderSetA(pageSet.imageUrl)}
                      {/* Add rendering for other set types here */}
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="actions">
              <button 
                className="save-pdf-button"
                onClick={saveToPDF}
                disabled={pages.every(page => page.length === 0)}
              >
                Save as PDF
              </button>
              <button 
                className="print-button"
                onClick={() => window.print()}
                disabled={pages.every(page => page.length === 0)}
              >
                Print All Pages
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;