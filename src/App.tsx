import { useState, useRef, MouseEvent, useEffect } from 'react';
import './App.css';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

import ImageUploader from './components/ImageUploader';
import LayoutSelector from './components/LayoutSelector';
import PageManagement from './components/PageManagement';
import MultiSetComponent from './components/MultiSetComponent';

import { CropArea, PageSet, LayoutSet } from './types';

const availableLayoutSets: LayoutSet[] = [
  {
    id: 'setA',
    name: 'Set A',
    layoutType: 'setA',
    description: '2 large (2x2) photos and 8 small (1x1) photos'
  },
  {
    id: 'setB',
    name: 'Set B',
    layoutType: 'setB',
    description: '3 (1.5x1.5) photos and 4 small (1x1) photos'
  },
  {
    id: 'setC',
    name: 'Set C',
    layoutType: 'setC',
    description: '3 (1.8x1.44) photos and 6 small (1x1) photos'
  },
  {
    id: 'setD',
    name: 'Set D',
    layoutType: 'setD',
    description: '6 large (2x2) photos and 8 small (1x1) photos'
  },
  {
    id: 'setE',
    name: 'Set E / CASA',
    layoutType: 'setE',
    description: '5 (2.34x1.5) photos'
  },
  // ... add more sets as needed
];

function App() {
  // ---------------------- State ----------------------
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [pages, setPages] = useState<PageSet[][]>([[]]);
  const [currentPage, setCurrentPage] = useState<number>(0);

  const [isAddingName, setIsAddingName] = useState<boolean>(false);
  const [imageName, setImageName] = useState<string>('');
  const [namePosition, setNamePosition] = useState<{ x: number; y: number } | null>(null);


  // Cropping-related states
  const [isCropping, setIsCropping] = useState<boolean>(false);
  const [cropStart, setCropStart] = useState<{ x: number; y: number } | null>(null);
  const [cropArea, setCropArea] = useState<CropArea | null>(null);
  const [cropAspectRatio, setCropAspectRatio] = useState<number | null>(null);
   
  // Rotation state
  const [currentRotation, setCurrentRotation] = useState<number>(0);

  // Refs for cropping
  const cropCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // PDF preview ref
  const canvasRef = useRef<HTMLDivElement>(null);

  // ---------------------- Image Upload Handlers ----------------------
  

  const handleNameImageLoad = () => {
    const canvas = cropCanvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    if (namePosition) {
      drawNameOnCanvas(ctx, imageName, namePosition);
    }
  };
   // ---------------------- Draw Name Utility ----------------------
   const drawNameOnCanvas = (
    ctx: CanvasRenderingContext2D,
    text: string,
    pos: { x: number; y: number },
  ) => {
    if (!text.trim()) return;
  
    // Calculate text metrics     
    ctx.font = '28px Arial';


    
    // Calculate background dimensions
    const backgroundWidth = 100000;
    const backgroundHeight = 70; // Fixed height similar to passport photos
    const backgroundX = pos.x - backgroundWidth/2;
    const backgroundY = pos.y - 25;
  
    // Draw white background
    ctx.fillStyle = 'white';
    ctx.fillRect(backgroundX, backgroundY, backgroundWidth, backgroundHeight);
  
    // Draw text
    ctx.fillStyle = 'black';
    ctx.font = '45px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, pos.x, pos.y + 10);
  };
  // ---------------------- Update Canvas Live ----------------------
  // Update the useEffect for live preview
useEffect(() => {
  if (isAddingName && cropCanvasRef.current && imageRef.current) {
    const canvas = cropCanvasRef.current;
    const image = imageRef.current;
    
    // Calculate scaled dimensions
    const scaleFactor = STANDARD_IMAGE_WIDTH / image.naturalWidth;
    const scaledWidth = STANDARD_IMAGE_WIDTH;
    const scaledHeight = image.naturalHeight * scaleFactor;

    // Set canvas dimensions
    canvas.width = scaledWidth;
    canvas.height = scaledHeight;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Draw scaled image
      ctx.drawImage(image, 0, 0, scaledWidth, scaledHeight);
      
      // Calculate default position
      const pos = namePosition || { 
        x: scaledWidth / 2,
        y: scaledHeight - NAME_BOTTOM_MARGIN
      };
      
      drawNameOnCanvas(ctx, imageName, pos);
    }
  }
}, [imageName, namePosition, isAddingName]);

  // ---------------------- Handlers for Name Mode ----------------------
  const handleCanvasClickForName = (e: MouseEvent<HTMLCanvasElement>) => {
    const canvas = cropCanvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    setNamePosition({ x, y });
  };

  // Add these constants at the top
const STANDARD_IMAGE_WIDTH = 600;
const NAME_BOTTOM_MARGIN = 40;

// Update the applyName function
const applyName = () => {
  if (!currentImage || !imageName.trim()) {
    setIsAddingName(false);
    return;
  }

  const img = new Image();
  img.onload = () => {
    // Calculate scaled dimensions
    const scaleFactor = STANDARD_IMAGE_WIDTH / img.naturalWidth;
    const scaledWidth = STANDARD_IMAGE_WIDTH;
    const scaledHeight = img.naturalHeight * scaleFactor;

    const offCanvas = document.createElement('canvas');
    offCanvas.width = scaledWidth;
    offCanvas.height = scaledHeight;
    
    const ctx = offCanvas.getContext('2d');
    if (!ctx) {
      setIsAddingName(false);
      return;
    }

    // Draw scaled image
    ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);
    
    // Calculate position
    const pos = namePosition || {
      x: scaledWidth / 2,
      y: scaledHeight - NAME_BOTTOM_MARGIN
    };
    
    drawNameOnCanvas(ctx, imageName, pos);
    
    const finalDataUrl = offCanvas.toDataURL('image/png');
    setCurrentImage(finalDataUrl);
    setUploadedImages(prev => [...prev, finalDataUrl]);
    setIsAddingName(false);
    setImageName('');
    setNamePosition(null);
  };
  img.src = currentImage;
};
  const cancelName = () => {
    setIsAddingName(false);
    setImageName('');
    setNamePosition(null);
  };

  // ---------------------- Rotate Image ----------------------
 const handleRotateImage = (degrees: number) => {
    if (!currentImage) return;

    // Update the current rotation
    const newRotation = (currentRotation + degrees) % 360;
    setCurrentRotation(newRotation);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      
      // Determine canvas dimensions based on rotation
      const isVertical = newRotation === 90 || newRotation === 270;
      canvas.width = isVertical ? img.height : img.width;
      canvas.height = isVertical ? img.width : img.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Move the origin to the center
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((newRotation * Math.PI) / 180);
      
      // Draw image offset by half of its width/height
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      // Save the rotated image
      const rotatedDataUrl = canvas.toDataURL('image/png');
      setCurrentImage(rotatedDataUrl);
    };
    img.src = currentImage;
  }; 

  // ---------------------- Crop Image Logic ----------------------
  const handleCropImage = (aspectRatio: number | null = null) => {
    // Switch to cropping mode
    setIsCropping(true);
    setCropArea(null);
    setCropAspectRatio(aspectRatio);
  };

  const handleCropMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
    const canvas = cropCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    setCropStart({ x, y });
    setCropArea({ x, y, width: 0, height: 0 });
  };

  const handleCropMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    if (!cropStart || !cropArea) return;
    const canvas = cropCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    // Calculate width and height
    let width = x - cropStart.x;
    let height = y - cropStart.y;

    // Maintain aspect ratio if specified
    if (cropAspectRatio) {
      if (Math.abs(width) > Math.abs(height * cropAspectRatio)) {
        // Width is too large for the height
        width = Math.sign(width) * Math.abs(height * cropAspectRatio);
      } else {
        // Height is too large for the width
        height = Math.sign(height) * Math.abs(width / cropAspectRatio);
      }
    }

    const newCropArea: CropArea = {
      x: cropStart.x,
      y: cropStart.y,
      width,
      height
    };
    setCropArea(newCropArea);

    drawCropCanvas(newCropArea);
  };

  const handleCropMouseUp = () => {
    setCropStart(null);
  };

  // Redraw the overlay with the new crop area
  const drawCropCanvas = (area: CropArea) => {
    const canvas = cropCanvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw the original image
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    // Overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Normalize crop area (handle negative width/height)
    const normalizedArea = normalizeArea(area);

    // Reveal the crop area
    ctx.clearRect(normalizedArea.x, normalizedArea.y, normalizedArea.width, normalizedArea.height);

    // Outline the crop
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(normalizedArea.x, normalizedArea.y, normalizedArea.width, normalizedArea.height);

    // Draw grid lines (rule of thirds)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1;
    
    // Vertical lines
    for (let i = 1; i <= 2; i++) {
      const lineX = normalizedArea.x + (normalizedArea.width * i / 3);
      ctx.beginPath();
      ctx.moveTo(lineX, normalizedArea.y);
      ctx.lineTo(lineX, normalizedArea.y + normalizedArea.height);
      ctx.stroke();
    }
    
    // Horizontal lines
    for (let i = 1; i <= 2; i++) {
      const lineY = normalizedArea.y + (normalizedArea.height * i / 3);
      ctx.beginPath();
      ctx.moveTo(normalizedArea.x, lineY);
      ctx.lineTo(normalizedArea.x + normalizedArea.width, lineY);
      ctx.stroke();
    }
  };

  // Helper function to normalize crop area (handle negative width/height)
  const normalizeArea = (area: CropArea): CropArea => {
    return {
      x: area.width < 0 ? area.x + area.width : area.x,
      y: area.height < 0 ? area.y + area.height : area.y,
      width: Math.abs(area.width),
      height: Math.abs(area.height)
    };
  };

  const applyCrop = () => {
    if (!cropArea || !currentImage) {
      setIsCropping(false);
      return;
    }
  
    const normalizedArea = normalizeArea(cropArea);
    const image = imageRef.current;
    if (!image) {
      setIsCropping(false);
      return;
    }
  
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsCropping(false);
      return;
    }
  
    const displayCanvas = cropCanvasRef.current;
    if (!displayCanvas) {
      setIsCropping(false);
      return;
    }
  
    const ratioX = image.naturalWidth / displayCanvas.width;
    const ratioY = image.naturalHeight / displayCanvas.height;
  
    const realX = normalizedArea.x * ratioX;
    const realY = normalizedArea.y * ratioY;
    const realW = normalizedArea.width * ratioX;
    const realH = normalizedArea.height * ratioY;
  
    canvas.width = realW;
    canvas.height = realH;
    ctx.drawImage(image, realX, realY, realW, realH, 0, 0, realW, realH);
  
    const croppedDataUrl = canvas.toDataURL('image/jpeg');
  
    // Update uploaded images list with cropped image
    setUploadedImages(prevImages => [...prevImages, croppedDataUrl]);
  
    // Update current image to the cropped one
    setCurrentImage(croppedDataUrl);
  
    setIsCropping(false);
    setCropArea(null);
    setCropAspectRatio(null);
  };
  
  const cancelCrop = () => {
    setIsCropping(false);
    setCropArea(null);
    setCropAspectRatio(null);
  };

  // ---------------------- Page / Set Management ----------------------
  const addSetToPage = (setId: string) => {
    if (!currentImage) return;
    const updatedPages = [...pages];
    updatedPages[currentPage].push({
      setId,
      imageUrl: currentImage, // store the current image for this set
      cropArea: null,
    });
    setPages(updatedPages);
  };

  const removeSetFromPage = (index: number) => {
    const updatedPages = [...pages];
    updatedPages[currentPage] = updatedPages[currentPage].filter((_, i) => i !== index);
    setPages(updatedPages);
  };

  const addNewPage = () => {
    setPages([...pages, []]);
    setCurrentPage(pages.length);
  };

  const switchPage = (pageIndex: number) => {
    setCurrentPage(pageIndex);
  };

  // ---------------------- PDF Export (Optional) ----------------------
  const saveToPDF = async () => {
    if (!canvasRef.current || pages.every(page => page.length === 0)) return;

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    for (let i = 0; i < pages.length; i++) {
      if (pages[i].length === 0) continue;
      if (i > 0) pdf.addPage();

      // Create a temporary element
      const tempElement = canvasRef.current.cloneNode(true) as HTMLElement;
      tempElement.style.position = 'absolute';
      tempElement.style.left = '-9999px';
      tempElement.style.width = '210mm';
      tempElement.style.height = '297mm';
      document.body.appendChild(tempElement);

      // TODO: Replace the .multi-set-container content with the sets from pages[i]
      // For a full solution, replicate the rendering from MultiSetComponent
      // or do a separate approach.

      const canvas = await html2canvas(tempElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        width: 210 * 3.78,
        height: 297 * 3.78,
        logging: false,
        backgroundColor: '#FFFFFF'
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);

      document.body.removeChild(tempElement);
    }

    pdf.save('photo-layout.pdf');
  };

  // ---------------------- Render ----------------------
  if (isCropping && currentImage) {
    // Show the cropping UI
    return (
      <div className="App">
        <header className="App-header">
          <h1>IDBP Manila Photo Printing</h1>
        </header>

        <div className="cropping-container">
          <h2>Crop Image</h2>

          <div className="crop-actions crop-presets">
            <button onClick={() => handleCropImage(null)}>Free Form</button>
            <button onClick={() => handleCropImage(1)}>Square (1:1)</button>
            <button onClick={() => handleCropImage(4/3)}>4:3</button>
            <button onClick={() => handleCropImage(3/2)}>3:2</button>
            <button onClick={() => handleCropImage(16/9)}>16:9</button>
            <button onClick={() => handleCropImage(2/3)}>Portrait (2:3)</button>
          </div>

          <div className="crop-canvas-container">
            <canvas
              ref={cropCanvasRef}
              className="crop-canvas"
              onMouseDown={handleCropMouseDown}
              onMouseMove={handleCropMouseMove}
              onMouseUp={handleCropMouseUp}
              onMouseLeave={handleCropMouseUp}
            />
            {/* Hidden image for reference */}
            <img
              ref={imageRef}
              src={currentImage}
              alt="Crop reference"
              style={{ display: 'none' }}
              onLoad={() => {
                // Sync the cropCanvas size to the image's display size
                const canvas = cropCanvasRef.current;
                const image = imageRef.current;
                if (canvas && image) {
                  // We'll just use the image's natural width/height
                  canvas.width = image.naturalWidth;
                  canvas.height = image.naturalHeight;

                  const ctx = canvas.getContext('2d');
                  if (ctx) {
                    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
                  }
                }
              }}
            />
          </div>

          <div className="crop-hints">
            <p>Click and drag to select the crop area. Use the presets above for common aspect ratios.</p>
            {cropArea && (
              <div className="crop-info">
                <span>W: {Math.abs(Math.round(cropArea.width))}px</span>
                <span>H: {Math.abs(Math.round(cropArea.height))}px</span>
              </div>
            )}
          </div>

          <div className="crop-actions">
            <button className="apply-crop-button" onClick={applyCrop}>
              Apply Crop
            </button>
            <button className="cancel-crop-button" onClick={cancelCrop}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }
  // Add-Name UI
  if (isAddingName && currentImage) {
    return (
      <div className="App">
        <header className="App-header">
          <h1>IDBP Manila Photo Printing</h1>
        </header>
        <div className="naming-container">
          <h2>Add Name to Image</h2>
          <div className="name-input">
            <input
              type="text"
              placeholder="Enter name here..."
              value={imageName}
              onChange={(e) => setImageName(e.target.value)}
            />
          </div>
          <div className="naming-canvas-container">
            <canvas
              ref={cropCanvasRef}
              className="naming-canvas"
              onClick={handleCanvasClickForName}
            />
            <img
              ref={imageRef}
              src={currentImage}
              alt="Naming reference"
              style={{ display: 'none' }}
              onLoad={handleNameImageLoad}
            />
          </div>
          <div className="naming-actions">
            <button onClick={applyName}>Apply Name</button>
            <button onClick={cancelName}>Cancel</button>
          </div>
        </div>
      </div>
    );
  }
  // Otherwise, show the normal UI
  return (
    <div className="App">
      <header className="App-header">
        <h1>IDBP Manila Photo Printing</h1>
      </header>

      <div className="container">
        {/* Left side: Upload & Layout selection */}
        <div className="controls">
        <ImageUploader
            uploadedImages={uploadedImages}
            onImagesChange={setUploadedImages}
            currentImage={currentImage}
            onCurrentImageChange={setCurrentImage}
            onCropImage={(imgUrl) => {
              setCurrentImage(imgUrl);
              setIsCropping(true);
            }}
            onAddName={(imgUrl) => {
              setCurrentImage(imgUrl);
              setIsAddingName(true);
            }}
          />

          
          {currentImage && (
            <div className="rotation-controls" style={{display: "none"}}>
              <h3>Rotate Image</h3>
              <div className="rotation-buttons">
                <button onClick={() => handleRotateImage(-90)}>↶ Rotate Left</button>
                <button onClick={() => handleRotateImage(90)}>↷ Rotate Right</button>
                <button onClick={() => handleRotateImage(180)}>↷↷ Flip 180°</button>
              </div>
              <div className="rotation-info">
                <span>Current rotation: {currentRotation}°</span>
              </div>
            </div>
          )} 

          <LayoutSelector
            availableLayoutSets={availableLayoutSets}
            currentImage={currentImage}
            onAddSetToPage={addSetToPage}
          />

          <PageManagement
            pages={pages}
            currentPage={currentPage}
            onSwitchPage={switchPage}
            onAddNewPage={addNewPage}
            onRemoveSetFromPage={removeSetFromPage}
          />
        </div>

        {/* Right side: "Canvas" preview for the current page */}
        <div className="output-section">
          <h2>A4 Canvas - Page {currentPage + 1}</h2>

          <div ref={canvasRef} className="a4-canvas">
            <MultiSetComponent pageSets={pages[currentPage]} />
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
    </div>
  );
}

export default App;