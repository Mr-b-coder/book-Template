import React from 'react';
import { CoverCalculations, BindingType } from '../types'; 

interface TemplatePreviewProps {
  calculations: CoverCalculations | null;
  showTechnicalGuides: boolean;
}

export const TemplatePreview = ({ 
    calculations, 
    showTechnicalGuides,
}: TemplatePreviewProps): JSX.Element | null => {
  if (!calculations) {
    return <p className="text-center text-[#4A5E78] dark:text-[#94A3B8]">Enter details above to see a preview.</p>;
  }

  const {
    totalCoverWidth, totalCoverHeight, trimWidthNum, trimHeightNum,
    spineWidth = 0, 
    bindingType, safetyMargin = 0,
    bleedAmount, wrapAmount, hingeWidth, boardWidth, boardHeight,
    frontPanelBoardWidth, boardExtension,
    safetyMarginTopBottom, safetyMarginBindingEdge, safetyMarginOutsideEdge,
  } = calculations;

  const isCoilHardcover = bindingType === BindingType.COIL_WIRE_O_HARDCOVER;
  const isCoilSoftcover = bindingType === BindingType.COIL_WIRE_O_SOFTCOVER;
  const isCoilType = isCoilHardcover || isCoilSoftcover;

  const MAX_SVG_WIDTH_REFERENCE = 500; 
  const scaleFactor = MAX_SVG_WIDTH_REFERENCE / totalCoverWidth;
  
  const svgEffectiveWidth = totalCoverWidth * scaleFactor;
  const svgEffectiveHeight = totalCoverHeight * scaleFactor;

  const FONT_SIZE = Math.max(8, Math.min(12, svgEffectiveWidth / 45)); 
  const INFO_FONT_SIZE = Math.max(6, Math.min(10, FONT_SIZE * 0.8));
  const BARCODE_LABEL_FONT_SIZE = Math.max(5, Math.min(8, INFO_FONT_SIZE * 0.8));

  // Determine if dark mode is active by checking the html class
  const isDarkMode = typeof window !== 'undefined' && document.documentElement.classList.contains('dark');

  const colors = {
    trimColor: '#4A90E2', 
    spineFoldColor: '#9013FE', 
    safetyMarginColor: '#22C55E', 
    bleedWrapEdgeColor: '#FF6B6B', 
    hingeColor: '#F5A623', 
    boardEdgeColor: '#444444', 
    punchHoleColor: '#BBBBBB',
    backgroundColor: 'transparent', 
    textColor: isDarkMode ? '#F1F5F9' : '#0A2F5C',
    labelColor: isDarkMode ? '#F1F5F9' : '#0A2F5C',
    infoLabelColor: isDarkMode ? '#94A3B8' : '#4A5E78',
    barcodePlaceholderColor: isDarkMode ? '#64748B' : '#8DA0B9',
  };
  
  const tooltipTexts = {
    wrap: "Wrap: The extra printed area that folds over the edge of the hardcover board.",
    safety: "Safety: The area within which all important text and graphics should be kept to avoid being cut off or lost in the binding/trimming process.",
    hinge: "Hinge: The flexible area that allows a hardcover book to open and close easily, located on either side of the spine board.",
    spineWidth: "Spine Width: The thickness of the book's spine, determined by page count and paper type. Critical for spine text placement.",
    bleed: "Bleed: The area of artwork that extends beyond the actual trim edge of the page. It's trimmed off after printing to ensure color/images reach the very edge of the finished product.",
    board: "Board: The stiff cardboard material used to create the covers of a hardcover book. 'Board / Fold Line' indicates where the wrap turns over the board.",
    trimLine: "Trim Line: The final intended size of the page/cover after it has been cut.",
    barcodeArea: "Recommended placement zone for the book's barcode (e.g., ISBN). Ensure barcode is within safety margins and does not enter bleed/wrap areas."
  };

  const DashedLine: React.FC<React.SVGProps<SVGLineElement>> = (props) => (
    <line {...props} strokeDasharray="3,2" strokeWidth={props.strokeWidth || "0.75"} />
  );
  
  interface TextLabelProps extends React.SVGProps<SVGTextElement> {
    label: string;
    tooltip?: string;
  }

  const TextLabel: React.FC<TextLabelProps> = ({ label, tooltip, children, ...props }) => (
    <text {...props} fontSize={props.fontSize || FONT_SIZE} fill={props.fill || colors.labelColor} textAnchor={props.textAnchor ||"middle"} dominantBaseline={props.dominantBaseline || "central"}>
      {label}
      {tooltip && <title>{tooltip}</title>}
      {children}
    </text>
  );

  const renderFileSpecInfo = (
    panelSafeX: number, 
    panelSafeY: number, 
    panelSafeHeight: number, 
    yPositionOfBarcodeRectTopEdge: number 
  ) => {
    if (!showTechnicalGuides) return null;

    const specItems = [
      "File Format: .pdf",
      "Resolution: 300dpi",
      "Fonts: Embedded",
      "Crop Marks: Not Necessary",
      "All Units are shown in \"Inches\""
    ];

    const textFontSize = INFO_FONT_SIZE * 0.9;
    const lineHeight = textFontSize * 1.4;
    const paddingFromLeft = INFO_FONT_SIZE * 0.5;
    const gapAboveBarcodeRect = INFO_FONT_SIZE * 0.6; 

    const totalTextHeight = specItems.length * lineHeight;
    
    const yForTextBottom = yPositionOfBarcodeRectTopEdge - gapAboveBarcodeRect;
    const yForTextTopCandidate = yForTextBottom - totalTextHeight;
    let actualYForTextTop = Math.max(panelSafeY + INFO_FONT_SIZE * 0.2, yForTextTopCandidate);

    if (actualYForTextTop + totalTextHeight > yForTextBottom) {
        actualYForTextTop = yForTextBottom - totalTextHeight;
        actualYForTextTop = Math.max(panelSafeY + INFO_FONT_SIZE * 0.2, actualYForTextTop);
    }

    return (
      <g>
        {specItems.map((item, index) => {
          const lineY = actualYForTextTop + (index * lineHeight);
          if (lineY < yPositionOfBarcodeRectTopEdge - gapAboveBarcodeRect && (lineY + textFontSize) < (panelSafeY + panelSafeHeight)) {
            return (
              <TextLabel
                key={index}
                label={item}
                x={panelSafeX + paddingFromLeft}
                y={lineY}
                textAnchor="start"
                fontSize={textFontSize}
                fill={colors.infoLabelColor}
                dominantBaseline="hanging"
              />
            );
          }
          return null;
        })}
      </g>
    );
  };


  const renderBarcodePlaceholder = (
    panelX: number, panelY: number, panelWidth: number, panelHeight: number, panelSafety: number
  ): JSX.Element | null => {
    
    const marginFromSafetyEdge = panelSafety * 0.25 > 5 ? 5 : Math.max(1, panelSafety * 0.25); 

    const defaultBarcodeW_scaled = 1.75 * scaleFactor * 0.8; 
    const defaultBarcodeH_scaled = 1.0 * scaleFactor * 0.8;
     
    const x = panelX + panelWidth - defaultBarcodeW_scaled - panelSafety - marginFromSafetyEdge;
    const y = panelY + panelHeight - defaultBarcodeH_scaled - panelSafety - marginFromSafetyEdge;
    
    return (
        <g>
            <rect 
                x={x} y={y} 
                width={defaultBarcodeW_scaled} height={defaultBarcodeH_scaled} 
                fill={isDarkMode ? "rgba(100, 116, 139, 0.1)" : "rgba(141, 160, 185, 0.1)"} 
                stroke={colors.barcodePlaceholderColor} strokeWidth="0.5" strokeDasharray="2,2"
            />
            <TextLabel 
                label="Barcode Area" 
                x={x + defaultBarcodeW_scaled / 2} y={y + defaultBarcodeH_scaled / 2} 
                fontSize={BARCODE_LABEL_FONT_SIZE} fill={colors.barcodePlaceholderColor}
                tooltip={tooltipTexts.barcodeArea}
            />
        </g>
    );
  };


  const renderPerfectBind = () => {
    if (typeof bleedAmount !== 'number' || typeof safetyMargin !== 'number') return null;
    const trimX = bleedAmount * scaleFactor;
    const trimY = bleedAmount * scaleFactor;
    const trimW = trimWidthNum * scaleFactor; 
    const trimH = trimHeightNum * scaleFactor;
    const spineW = spineWidth * scaleFactor; 
    const safety = safetyMargin * scaleFactor;

    const leftSpineFoldX = trimX + trimW; 
    const rightSpineFoldX = leftSpineFoldX + spineW; 

    const guideLabelIndentX = INFO_FONT_SIZE * 0.35; 
    const bleedLabelYPos = INFO_FONT_SIZE * 1.25;    

    const yPosTrimLabel = trimY - INFO_FONT_SIZE * 1.5;
    const yPosSpineValueLabel = Math.max(INFO_FONT_SIZE * 0.2, (trimY + safety) - (INFO_FONT_SIZE * 1.1));

    const barcodeArea = renderBarcodePlaceholder(trimX, trimY, trimW, trimH, safety); 

    const marginFromSafetyEdge_barcode = safety * 0.25 > 5 ? 5 : Math.max(1, safety * 0.25);
    const defaultBarcodeH_scaled = 1.0 * scaleFactor * 0.8;
    const yTopOfBarcodeRectForBackCover = trimY + trimH - defaultBarcodeH_scaled - safety - marginFromSafetyEdge_barcode;
    
    const backCoverSafeX = trimX + safety;
    const backCoverSafeY = trimY + safety;
    const backCoverSafeHeight = trimH - (2 * safety);

    return (
      <>
        <rect x="0" y="0" width={svgEffectiveWidth} height={svgEffectiveHeight} fill={colors.backgroundColor} stroke={colors.bleedWrapEdgeColor} strokeWidth="1" />
        <rect x={trimX} y={trimY} width={trimW} height={trimH} stroke={colors.trimColor} strokeWidth="1" fill="none" /> 
        <rect x={leftSpineFoldX} y={trimY} width={spineW} height={trimH} stroke={colors.spineFoldColor} strokeWidth="1" fill={isDarkMode ? "rgba(144,19,254,0.15)" : "rgba(144,19,254,0.05)"} /> 
        <rect x={rightSpineFoldX} y={trimY} width={trimW} height={trimH} stroke={colors.trimColor} strokeWidth="1" fill="none" /> 

        <TextLabel label="Back Cover" x={trimX + trimW / 2} y={trimY + trimH / 2} fill={colors.textColor} />
        {spineW > 0 && <TextLabel label="Spine" x={leftSpineFoldX + spineW / 2} y={trimY + trimH / 2} transform={`rotate(-90 ${leftSpineFoldX + spineW / 2},${trimY + trimH / 2})`} tooltip={tooltipTexts.spineWidth} fill={colors.textColor}/>}
        <TextLabel label="Front Cover" x={rightSpineFoldX + trimW / 2} y={trimY + trimH / 2} fill={colors.textColor}/>
        
        {barcodeArea}

        {showTechnicalGuides && (
          <>
            <TextLabel 
                label={`Bleed: ${bleedAmount.toFixed(3)}"`} 
                x={guideLabelIndentX - -4} 
                y={bleedLabelYPos - 4} 
                textAnchor="start" 
                dominantBaseline="hanging" 
                fontSize={INFO_FONT_SIZE} 
                fill={colors.bleedWrapEdgeColor} 
                tooltip={tooltipTexts.bleed}
            />

            <TextLabel label={`Trim Line`} x={trimX + INFO_FONT_SIZE * 0.5} y={yPosTrimLabel} textAnchor="start" dominantBaseline="alphabetic" fontSize={INFO_FONT_SIZE} fill={colors.trimColor} tooltip={tooltipTexts.trimLine}/>
            {spineW > 0 && <TextLabel label={`Spine: ${spineWidth.toFixed(3)}"`} x={leftSpineFoldX + spineW / 2} y={yPosSpineValueLabel} textAnchor="middle" dominantBaseline="hanging" fontSize={INFO_FONT_SIZE} fill={colors.spineFoldColor} tooltip={tooltipTexts.spineWidth}/>}

            <DashedLine x1={trimX + safety} y1={trimY + safety} x2={leftSpineFoldX - safety} y2={trimY + safety} stroke={colors.safetyMarginColor} />
            <DashedLine x1={trimX + safety} y1={trimY + trimH - safety} x2={leftSpineFoldX - safety} y2={trimY + trimH - safety} stroke={colors.safetyMarginColor} />
            <DashedLine x1={trimX + safety} y1={trimY + safety} x2={trimX + safety} y2={trimY + trimH - safety} stroke={colors.safetyMarginColor} />
            <DashedLine x1={leftSpineFoldX - safety} y1={trimY + safety} x2={leftSpineFoldX - safety} y2={trimY + trimH - safety} stroke={colors.safetyMarginColor} />
            
            <DashedLine x1={rightSpineFoldX + safety} y1={trimY + safety} x2={rightSpineFoldX + trimW - safety} y2={trimY + safety} stroke={colors.safetyMarginColor} />
            <DashedLine x1={rightSpineFoldX + safety} y1={trimY + trimH - safety} x2={rightSpineFoldX + trimW - safety} y2={trimY + trimH - safety} stroke={colors.safetyMarginColor} />
            <DashedLine x1={rightSpineFoldX + safety} y1={trimY + safety} x2={rightSpineFoldX + safety} y2={trimY + trimH - safety} stroke={colors.safetyMarginColor} />
            <DashedLine x1={rightSpineFoldX + trimW - safety} y1={trimY + safety} x2={rightSpineFoldX + trimW - safety} y2={trimY + trimH - safety} stroke={colors.safetyMarginColor} />
            
            <TextLabel label={`Safety: ${safetyMargin.toFixed(3)}"`} x={trimX + safety + INFO_FONT_SIZE*0.5} y={trimY + safety + INFO_FONT_SIZE*1.2} textAnchor='start' fill={colors.safetyMarginColor} fontSize={INFO_FONT_SIZE} tooltip={tooltipTexts.safety}/>
            
            {renderFileSpecInfo(backCoverSafeX, backCoverSafeY, backCoverSafeHeight, yTopOfBarcodeRectForBackCover)}
          </>
        )}
      </>
    );
  };

  const renderCaseBind = () => {
    if (typeof wrapAmount !== 'number' || typeof hingeWidth !== 'number' || typeof frontPanelBoardWidth !== 'number' || typeof boardHeight !== 'number' || typeof boardWidth !== 'number' || typeof safetyMargin !== 'number') return null;
    const wrap = wrapAmount * scaleFactor;
    const hinge = hingeWidth * scaleFactor;
    const panelW = frontPanelBoardWidth * scaleFactor; 
    const panelH = boardHeight * scaleFactor; 
    const spineW = spineWidth * scaleFactor; 
    const safety = safetyMargin * scaleFactor; 
    const assemblyW = boardWidth * scaleFactor; 

    const boardStartX = wrap; 
    const boardStartY = wrap; 

    const backPanelRightEdgeX = boardStartX + panelW;
    const leftHingeRightEdgeX = backPanelRightEdgeX + hinge;
    const spinePanelRightEdgeX = leftHingeRightEdgeX + spineW;
    const rightHingeRightEdgeX = spinePanelRightEdgeX + hinge;
    
    const hingeLabelXLeft = backPanelRightEdgeX + hinge / 2;
    const hingeLabelXRight = spinePanelRightEdgeX + hinge / 2;
    const hingeLabelY = boardStartY + panelH / 2;
    
    const yPosWrapText = INFO_FONT_SIZE * 1.25; 
    const yPosBoardLabel = boardStartY - INFO_FONT_SIZE * 1.0; 
    const yPosSpineValueLabel = INFO_FONT_SIZE * 1.25; 

    const barcodeArea = renderBarcodePlaceholder(boardStartX, boardStartY, panelW, panelH, safety); 

    const marginFromSafetyEdge_barcode = safety * 0.25 > 5 ? 5 : Math.max(1, safety * 0.25);
    const defaultBarcodeH_scaled = 1.0 * scaleFactor * 0.8;
    const yTopOfBarcodeRectForBackBoard = boardStartY + panelH - defaultBarcodeH_scaled - safety - marginFromSafetyEdge_barcode;

    const backBoardSafeX = boardStartX + safety;
    const backBoardSafeY = boardStartY + safety;
    const backBoardSafeHeight = panelH - (2 * safety);

    const boardLabelX = boardStartX + INFO_FONT_SIZE * 0.5 + 6; 

    // --- V V V THIS IS THE NEW LINE OF CODE V V V ---
    // We only show the "Hinge" label if the hinge width is reasonably large
    const showHingeLabel = hingeWidth > 0.1; 
    // --- ^ ^ ^ THIS IS THE NEW LINE OF CODE ^ ^ ^ ---

    return (
      <>
        <rect x="0" y="0" width={svgEffectiveWidth} height={svgEffectiveHeight} fill={colors.backgroundColor} stroke={colors.bleedWrapEdgeColor} strokeWidth="1" />
        <rect x={boardStartX} y={boardStartY} width={assemblyW} height={panelH} stroke={colors.boardEdgeColor} strokeWidth="1" fill={isDarkMode ? "rgba(68,68,68,0.15)" :"rgba(68,68,68,0.05)"} />
        
        <rect x={backPanelRightEdgeX} y={boardStartY} width={hinge} height={panelH} stroke={colors.hingeColor} strokeWidth="0.5" fill={isDarkMode ? "rgba(245,166,35,0.15)" : "rgba(245,166,35,0.05)"} />
        {spineW > 0 && <rect x={leftHingeRightEdgeX} y={boardStartY} width={spineW} height={panelH} stroke={colors.spineFoldColor} strokeWidth="1" fill={isDarkMode ? "rgba(144,19,254,0.15)" : "rgba(144,19,254,0.05)"} />}
        <rect x={spinePanelRightEdgeX} y={boardStartY} width={hinge} height={panelH} stroke={colors.hingeColor} strokeWidth="0.5" fill={isDarkMode ? "rgba(245,166,35,0.15)" : "rgba(245,166,35,0.05)"} />

        <TextLabel label="Back Board" x={boardStartX + panelW / 2} y={boardStartY + panelH / 2} tooltip={tooltipTexts.board} fill={colors.textColor}/>
        
        {/* --- V V V THESE LINES HAVE BEEN MODIFIED V V V --- */}
        {showHingeLabel && <TextLabel label="Hinge" x={hingeLabelXLeft} y={hingeLabelY} transform={`rotate(-90 ${hingeLabelXLeft},${hingeLabelY})`} tooltip={tooltipTexts.hinge} fill={colors.textColor}/>}
        {spineW > 0 && <TextLabel label="Spine Board" x={leftHingeRightEdgeX + spineW / 2} y={boardStartY + panelH / 2} transform={`rotate(-90 ${leftHingeRightEdgeX + spineW / 2},${boardStartY + panelH / 2})`} tooltip={tooltipTexts.spineWidth} fill={colors.textColor}/>}
        {showHingeLabel && <TextLabel label="Hinge" x={hingeLabelXRight} y={hingeLabelY} transform={`rotate(-90 ${hingeLabelXRight},${hingeLabelY})`} tooltip={tooltipTexts.hinge} fill={colors.textColor}/>}
        {/* --- ^ ^ ^ THESE LINES HAVE BEEN MODIFIED ^ ^ ^ --- */}

        <TextLabel label="Front Board" x={rightHingeRightEdgeX + panelW / 2} y={boardStartY + panelH / 2} tooltip={tooltipTexts.board} fill={colors.textColor}/>

        {barcodeArea}

        {showTechnicalGuides && (
          <>
            <TextLabel label={`Wrap: ${wrapAmount.toFixed(3)}"`} x={INFO_FONT_SIZE*0.35} y={yPosWrapText - 9} textAnchor="start" dominantBaseline="hanging" fontSize={INFO_FONT_SIZE} fill={colors.bleedWrapEdgeColor} tooltip={tooltipTexts.wrap}/>
            <TextLabel 
                label={`Board / Fold Line`} 
                x={boardLabelX} 
                y={yPosBoardLabel} 
                textAnchor="start" 
                dominantBaseline="hanging" 
                fontSize={INFO_FONT_SIZE} 
                fill={colors.boardEdgeColor} 
                tooltip={tooltipTexts.board}
            />
            {spineW > 0 && <TextLabel label={`Spine: ${spineWidth.toFixed(3)}"`} x={leftHingeRightEdgeX + spineW/2} y={yPosSpineValueLabel} textAnchor="middle" dominantBaseline="hanging" fontSize={INFO_FONT_SIZE} fill={colors.spineFoldColor} tooltip={tooltipTexts.spineWidth}/>}
            
            <DashedLine x1={boardStartX + safety} y1={boardStartY + safety} x2={backPanelRightEdgeX - safety} y2={boardStartY + safety} stroke={colors.safetyMarginColor} />
            <DashedLine x1={boardStartX + safety} y1={boardStartY + panelH - safety} x2={backPanelRightEdgeX - safety} y2={boardStartY + panelH - safety} stroke={colors.safetyMarginColor} />
            <DashedLine x1={boardStartX + safety} y1={boardStartY + safety} x2={boardStartX + safety} y2={boardStartY + panelH - safety} stroke={colors.safetyMarginColor} />
            <DashedLine x1={backPanelRightEdgeX - safety} y1={boardStartY + safety} x2={backPanelRightEdgeX - safety} y2={boardStartY + panelH - safety} stroke={colors.safetyMarginColor} />
           
            <DashedLine x1={rightHingeRightEdgeX + safety} y1={boardStartY + safety} x2={rightHingeRightEdgeX + panelW - safety} y2={boardStartY + safety} stroke={colors.safetyMarginColor} />
            <DashedLine x1={rightHingeRightEdgeX + safety} y1={boardStartY + panelH - safety} x2={rightHingeRightEdgeX + panelW - safety} y2={boardStartY + panelH - safety} stroke={colors.safetyMarginColor} />
            <DashedLine x1={rightHingeRightEdgeX + safety} y1={boardStartY + safety} x2={rightHingeRightEdgeX + safety} y2={boardStartY + panelH - safety} stroke={colors.safetyMarginColor} />
            <DashedLine x1={rightHingeRightEdgeX + panelW - safety} y1={boardStartY + safety} x2={rightHingeRightEdgeX + panelW - safety} y2={boardStartY + panelH - safety} stroke={colors.safetyMarginColor} />
            
            <TextLabel label={`Safety: ${safetyMargin.toFixed(3)}"`} x={boardStartX+safety + INFO_FONT_SIZE*0.5} y={boardStartY+safety + INFO_FONT_SIZE*1.2} textAnchor='start' fill={colors.safetyMarginColor} fontSize={INFO_FONT_SIZE} tooltip={tooltipTexts.safety}/>
            {renderFileSpecInfo(backBoardSafeX, backBoardSafeY, backBoardSafeHeight, yTopOfBarcodeRectForBackBoard)}
          </>
        )}
      </>
    );
  };

  const renderCoilWirePage = (isFront: boolean) => { 
    if (typeof safetyMarginTopBottom !== 'number' || typeof safetyMarginBindingEdge !== 'number' || typeof safetyMarginOutsideEdge !== 'number') return null;

    const pageTitle = isFront ? "Front Cover" : "Back Cover"; 
    
    const punchHoleRadius = Math.max(1, 0.075 * scaleFactor);
    const punchHoleSpacing = Math.max(2, 0.375 * scaleFactor);
    const punchHoleCenterOffset = Math.max(1.5, 0.3125 * scaleFactor);

    let barcodeArea: JSX.Element | null = null;
    let fileSpecArea: JSX.Element | null = null;
    let yTopOfBarcodeRectForFrontCover = 0;

    const guideLabelIndentX = INFO_FONT_SIZE * 0.35; 
    const firstLabelYPos = INFO_FONT_SIZE * 1.25;    


    if (isCoilHardcover && typeof wrapAmount === 'number' && typeof boardExtension === 'number' && typeof boardHeight === 'number') {
        const wrap = wrapAmount * scaleFactor;
        const physicalBoardW = (trimWidthNum + boardExtension) * scaleFactor;
        const physicalBoardH = boardHeight * scaleFactor; 
        const boardAreaX = wrap;
        const boardAreaY = wrap;
        const panelSafetyEffective = safetyMarginOutsideEdge * scaleFactor; 
        
        if (isFront) { 
             barcodeArea = renderBarcodePlaceholder(boardAreaX, boardAreaY, physicalBoardW, physicalBoardH, panelSafetyEffective);
             const marginFromSafetyEdge_barcode = panelSafetyEffective * 0.25 > 5 ? 5 : Math.max(1, panelSafetyEffective * 0.25);
             const defaultBarcodeH_scaled = 1.0 * scaleFactor * 0.8;
             yTopOfBarcodeRectForFrontCover = boardAreaY + physicalBoardH - defaultBarcodeH_scaled - panelSafetyEffective - marginFromSafetyEdge_barcode;
             
             const frontSafeX = safetyMarginBindingEdge * scaleFactor; 
             const frontSafeY = safetyMarginTopBottom * scaleFactor;
             const frontSafeHeight = svgEffectiveHeight - 2 * frontSafeY;
             fileSpecArea = renderFileSpecInfo(frontSafeX, frontSafeY, frontSafeHeight, yTopOfBarcodeRectForFrontCover);
        }

        let punchHoleEdgeX;
        const safeTop = safetyMarginTopBottom * scaleFactor; 
        const safeBottom = svgEffectiveHeight - safetyMarginTopBottom * scaleFactor; 
        let safeL, safeR; 

        if (isFront) { 
            safeL = safetyMarginBindingEdge * scaleFactor;
            safeR = svgEffectiveWidth - safetyMarginOutsideEdge * scaleFactor;
            punchHoleEdgeX = boardAreaX + punchHoleCenterOffset; 
        } else { 
            safeL = safetyMarginOutsideEdge * scaleFactor;
            safeR = svgEffectiveWidth - safetyMarginBindingEdge * scaleFactor;
            punchHoleEdgeX = boardAreaX + physicalBoardW - punchHoleCenterOffset; 
        }

        const punchHoles: JSX.Element[] = [];
        if (showTechnicalGuides) {
            for (let y = boardAreaY + punchHoleSpacing / 2; y < boardAreaY + physicalBoardH - punchHoleSpacing / 3; y += punchHoleSpacing) {
                punchHoles.push(<circle key={`ph-${y}`} cx={punchHoleEdgeX} cy={y} r={punchHoleRadius} fill={colors.punchHoleColor} />);
            }
        }
        
        const yPosBoardLabel = boardAreaY - INFO_FONT_SIZE * 1.0; 

        return (
          <>
            <rect x="0" y="0" width={svgEffectiveWidth} height={svgEffectiveHeight} fill={colors.backgroundColor} stroke={colors.bleedWrapEdgeColor} strokeWidth="1" />
            <rect x={boardAreaX} y={boardAreaY} width={physicalBoardW} height={physicalBoardH} stroke={colors.boardEdgeColor} strokeWidth="1" fill={isDarkMode ? "rgba(68,68,68,0.15)" :"rgba(68,68,68,0.05)"} />
            <TextLabel label={pageTitle} x={svgEffectiveWidth / 2} y={svgEffectiveHeight / 2} fill={colors.textColor}/>
            {barcodeArea}

            {showTechnicalGuides && (
              <>
                <TextLabel label={`Wrap: ${wrapAmount.toFixed(3)}"`} x={guideLabelIndentX} y={firstLabelYPos} dominantBaseline="hanging" textAnchor="start" fontSize={INFO_FONT_SIZE} fill={colors.bleedWrapEdgeColor} tooltip={tooltipTexts.wrap}/>
                <TextLabel label={`Board / Fold Line`} x={boardAreaX + INFO_FONT_SIZE*0.5} y={yPosBoardLabel} textAnchor="start" dominantBaseline='alphabetic' fontSize={INFO_FONT_SIZE} fill={colors.boardEdgeColor} tooltip={tooltipTexts.board}/>
                <TextLabel label={`Board Ext: ${boardExtension.toFixed(3)}"`} x={boardAreaX + INFO_FONT_SIZE*0.5} y={boardAreaY + physicalBoardH + INFO_FONT_SIZE*1.2} textAnchor="start" dominantBaseline='hanging' fontSize={INFO_FONT_SIZE} fill={colors.boardEdgeColor}/>

                <DashedLine x1={safeL} y1={safeTop} x2={safeR} y2={safeTop} stroke={colors.safetyMarginColor} />
                <DashedLine x1={safeL} y1={safeBottom} x2={safeR} y2={safeBottom} stroke={colors.safetyMarginColor} />
                <DashedLine x1={safeL} y1={safeTop} x2={safeL} y2={safeBottom} stroke={colors.safetyMarginColor} />
                <DashedLine x1={safeR} y1={safeTop} x2={safeR} y2={safeBottom} stroke={colors.safetyMarginColor} />
                <TextLabel label={`Safety (from page edge)`} x={safeL + INFO_FONT_SIZE*0.5} y={safeTop + INFO_FONT_SIZE*0.5} dominantBaseline="hanging" textAnchor='start' fill={colors.safetyMarginColor} fontSize={INFO_FONT_SIZE} tooltip={tooltipTexts.safety}/>
                <TextLabel label={`T/B: ${safetyMarginTopBottom.toFixed(3)}"`} x={safeL + INFO_FONT_SIZE*0.5} y={safeTop + INFO_FONT_SIZE*1.7} dominantBaseline="hanging" textAnchor='start' fill={colors.safetyMarginColor} fontSize={INFO_FONT_SIZE}/>
                <TextLabel label={`Bind: ${safetyMarginBindingEdge.toFixed(3)}"`} x={safeL + INFO_FONT_SIZE*0.5} y={safeTop + INFO_FONT_SIZE*2.9} dominantBaseline="hanging" textAnchor='start' fill={colors.safetyMarginColor} fontSize={INFO_FONT_SIZE}/>
                <TextLabel label={`Outer: ${safetyMarginOutsideEdge.toFixed(3)}"`} x={safeL + INFO_FONT_SIZE*0.5} y={safeTop + INFO_FONT_SIZE*4.1} dominantBaseline="hanging" textAnchor='start' fill={colors.safetyMarginColor} fontSize={INFO_FONT_SIZE}/>
                
                {punchHoles}
                {punchHoles.length > 0 && <TextLabel label="Punch Holes (Approx.)" x={punchHoleEdgeX + (isFront ? punchHoleRadius + 2 : -punchHoleRadius -2)} y={boardAreaY + INFO_FONT_SIZE} textAnchor={isFront ? "start" : "end"} fontSize={INFO_FONT_SIZE * 0.9} fill={colors.punchHoleColor}/>}
                {fileSpecArea}
              </>
            )}
          </>
        );

    } else if (isCoilSoftcover && typeof bleedAmount === 'number') {
        const trimX = bleedAmount * scaleFactor;
        const trimY = bleedAmount * scaleFactor;
        const trimW = svgEffectiveWidth - 2 * trimX; 
        const trimH = svgEffectiveHeight - 2 * trimY; 
        const panelSafetyEffective = safetyMarginOutsideEdge * scaleFactor; 
        
        if (isFront) {
             barcodeArea = renderBarcodePlaceholder(trimX, trimY, trimW, trimH, panelSafetyEffective);
             const marginFromSafetyEdge_barcode = panelSafetyEffective * 0.25 > 5 ? 5 : Math.max(1, panelSafetyEffective * 0.25);
             const defaultBarcodeH_scaled = 1.0 * scaleFactor * 0.8;
             yTopOfBarcodeRectForFrontCover = trimY + trimH - defaultBarcodeH_scaled - panelSafetyEffective - marginFromSafetyEdge_barcode;
             
             const frontSafeX = trimX + safetyMarginBindingEdge * scaleFactor;
             const frontSafeY = trimY + safetyMarginTopBottom * scaleFactor;
             const frontSafeHeight = trimH - 2 * (safetyMarginTopBottom * scaleFactor);
             fileSpecArea = renderFileSpecInfo(frontSafeX, frontSafeY, frontSafeHeight, yTopOfBarcodeRectForFrontCover);
        }

        let punchHoleEdgeX;
        const safeTop = trimY + safetyMarginTopBottom * scaleFactor; 
        const safeBottom = trimY + trimH - safetyMarginTopBottom * scaleFactor; 
        let safeL, safeR; 
        
        if (isFront) { 
            safeL = trimX + safetyMarginBindingEdge * scaleFactor;
            safeR = trimX + trimW - safetyMarginOutsideEdge * scaleFactor;
            punchHoleEdgeX = trimX + punchHoleCenterOffset;
        } else { 
            safeL = trimX + safetyMarginOutsideEdge * scaleFactor;
            safeR = trimX + trimW - safetyMarginBindingEdge * scaleFactor;
            punchHoleEdgeX = trimX + trimW - punchHoleCenterOffset;
        }
        
        const punchHoles: JSX.Element[] = [];
        if (showTechnicalGuides) {
            for (let y = trimY + punchHoleSpacing / 2; y < trimY + trimH - punchHoleSpacing / 3; y += punchHoleSpacing) {
                punchHoles.push(<circle key={`ph-${y}`} cx={punchHoleEdgeX} cy={y} r={punchHoleRadius} fill={colors.punchHoleColor} />);
            }
        }
        
        const yPosTrimLabel = trimY - INFO_FONT_SIZE * 1.5;

        return (
          <>
            <rect x="0" y="0" width={svgEffectiveWidth} height={svgEffectiveHeight} fill={colors.backgroundColor} stroke={colors.bleedWrapEdgeColor} strokeWidth="1" />
            <rect x={trimX} y={trimY} width={trimW} height={trimH} stroke={colors.trimColor} strokeWidth="1" fill="none" />
            <TextLabel label={pageTitle} x={svgEffectiveWidth / 2} y={svgEffectiveHeight / 2} fill={colors.textColor}/>
            {barcodeArea}

            {showTechnicalGuides && (
              <>
                <TextLabel 
                    label={`Bleed: ${bleedAmount.toFixed(3)}"`} 
                    x={guideLabelIndentX} 
                    y={firstLabelYPos - 9} 
                    dominantBaseline="hanging" 
                    textAnchor="start" 
                    fontSize={INFO_FONT_SIZE} 
                    fill={colors.bleedWrapEdgeColor} 
                    tooltip={tooltipTexts.bleed}
                />
                <TextLabel label={`Trim Line`} x={trimX + INFO_FONT_SIZE*0.5} y={yPosTrimLabel} textAnchor="start" dominantBaseline='alphabetic' fontSize={INFO_FONT_SIZE} fill={colors.trimColor} tooltip={tooltipTexts.trimLine}/>

                <DashedLine x1={safeL} y1={safeTop} x2={safeR} y2={safeTop} stroke={colors.safetyMarginColor} />
                <DashedLine x1={safeL} y1={safeBottom} x2={safeR} y2={safeBottom} stroke={colors.safetyMarginColor} />
                <DashedLine x1={safeL} y1={safeTop} x2={safeL} y2={safeBottom} stroke={colors.safetyMarginColor} />
                <DashedLine x1={safeR} y1={safeTop} x2={safeR} y2={safeBottom} stroke={colors.safetyMarginColor} />
                <TextLabel label={`Safety (from trim)`} x={safeL + INFO_FONT_SIZE*0.5} y={safeTop + INFO_FONT_SIZE*0.5} dominantBaseline="hanging" textAnchor='start' fill={colors.safetyMarginColor} fontSize={INFO_FONT_SIZE} tooltip={tooltipTexts.safety}/>
                <TextLabel label={`T/B: ${safetyMarginTopBottom.toFixed(3)}"`} x={safeL + INFO_FONT_SIZE*0.5} y={safeTop + INFO_FONT_SIZE*1.7} dominantBaseline="hanging" textAnchor='start' fill={colors.safetyMarginColor} fontSize={INFO_FONT_SIZE}/>
                <TextLabel label={`Bind: ${safetyMarginBindingEdge.toFixed(3)}"`} x={safeL + INFO_FONT_SIZE*0.5} y={safeTop + INFO_FONT_SIZE*2.9} dominantBaseline="hanging" textAnchor='start' fill={colors.safetyMarginColor} fontSize={INFO_FONT_SIZE}/>
                <TextLabel label={`Outer: ${safetyMarginOutsideEdge.toFixed(3)}"`} x={safeL + INFO_FONT_SIZE*0.5} y={safeTop + INFO_FONT_SIZE*4.1} dominantBaseline="hanging" textAnchor='start' fill={colors.safetyMarginColor} fontSize={INFO_FONT_SIZE}/>

                {punchHoles}
                {punchHoles.length > 0 && <TextLabel label="Punch Holes (Approx.)" x={punchHoleEdgeX + (isFront ? punchHoleRadius + 2 : -punchHoleRadius -2)} y={trimY + INFO_FONT_SIZE} textAnchor={isFront ? "start" : "end"} fontSize={INFO_FONT_SIZE * 0.9} fill={colors.punchHoleColor}/>}
                {fileSpecArea}
              </>
            )}
          </>
        );
    }
    return null; 
  };
  
  const renderContent = () => {
    switch(bindingType) {
      case BindingType.PERFECT_BIND:
        return renderPerfectBind();
      case BindingType.CASE_BIND:
        return renderCaseBind();
      case BindingType.COIL_WIRE_O_SOFTCOVER:
      case BindingType.COIL_WIRE_O_HARDCOVER:
        return (
          <>
            {renderCoilWirePage(true)} 
          </>
        );
      default:
        return <p className="text-center text-[#4A5E78] dark:text-[#94A3B8]">Select a binding type to see a preview.</p>;
    }
  };

  const viewBox = `-0.5 -0.5 ${svgEffectiveWidth + 1} ${svgEffectiveHeight + 1}`;

  return (
    <svg 
        viewBox={viewBox} 
        width="100%" 
        height="100%"
        preserveAspectRatio="xMidYMid meet"
        aria-labelledby="template-title"
        role="img"
    >
        <title id="template-title">{`${bindingType} Cover Template Preview`}</title>
        {renderContent()}
    </svg>
  );
};