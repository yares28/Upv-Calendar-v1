import { Injectable, NgZone } from '@angular/core';

/**
 * Interface defining tooltip position information
 */
export interface TooltipPosition {
  top: string;
  left: string;
  transform: string;
  transformOrigin: string;
  placement: 'top' | 'right' | 'bottom' | 'left';
  arrowLeft?: string;
  arrowTop?: string;
  arrowTransform: string;
}

/**
 * Service for calculating optimal tooltip positions based on target elements
 */
@Injectable({
  providedIn: 'root'
})
export class TooltipPositionService {
  // Default tooltip dimensions - can be overridden for specific cases
  private defaultTooltipWidth = 300;
  private defaultTooltipHeight = 200;
  private arrowSize = 12;
  private minOffset = 10;
  
  constructor(private ngZone: NgZone) {}

  /**
   * Calculate the optimal position for a tooltip based on the target element
   * @param targetElement The element that triggered the tooltip
   * @param tooltipWidth Width of the tooltip (default 300px)
   * @param tooltipHeight Height of the tooltip (default 200px)
   * @returns TooltipPosition object with position information
   */
  calculateTooltipPosition(
    targetElement: HTMLElement, 
    tooltipWidth: number = this.defaultTooltipWidth, 
    tooltipHeight: number = this.defaultTooltipHeight
  ): TooltipPosition {
    // Find the actual calendar cell (may be the parent of the clicked element)
    let calendarCell = targetElement;
    while (calendarCell && !calendarCell.classList.contains('calendar-day-button') && calendarCell.parentElement) {
      calendarCell = calendarCell.parentElement;
    }
    
    // If we didn't find a calendar cell, use the original target
    if (!calendarCell.classList.contains('calendar-day-button')) {
      calendarCell = targetElement;
    }
    
    // Get the target element's boundaries relative to the viewport
    const targetRect = calendarCell.getBoundingClientRect();
    
    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Get scroll position
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    
    // Calculate space available in each direction (relative to viewport)
    const spaceTop = targetRect.top;
    const spaceRight = viewportWidth - targetRect.right;
    const spaceBottom = viewportHeight - targetRect.bottom;
    const spaceLeft = targetRect.left;
    
    // Determine best placement based on available space
    const placement = this.determineBestPlacement(
      spaceTop, spaceRight, spaceBottom, spaceLeft,
      tooltipHeight, tooltipWidth
    );
    
    // Calculate position based on determined placement
    return this.calculatePositionForPlacement(
      placement, 
      targetRect, 
      tooltipWidth, 
      tooltipHeight, 
      viewportWidth, 
      viewportHeight,
      scrollX,
      scrollY
    );
  }
  
  /**
   * Determines the best placement for the tooltip based on available space
   */
  private determineBestPlacement(
    spaceTop: number, 
    spaceRight: number, 
    spaceBottom: number, 
    spaceLeft: number,
    tooltipHeight: number,
    tooltipWidth: number
  ): 'top' | 'right' | 'bottom' | 'left' {
    // Check if there's enough space in each direction
    const hasSpaceTop = spaceTop >= tooltipHeight + this.minOffset;
    const hasSpaceRight = spaceRight >= tooltipWidth + this.minOffset;
    const hasSpaceBottom = spaceBottom >= tooltipHeight + this.minOffset;
    const hasSpaceLeft = spaceLeft >= tooltipWidth + this.minOffset;
    
    // Calculate a score for each direction (higher is better)
    // This prioritizes directions with more available space
    const scores = {
      top: hasSpaceTop ? spaceTop / tooltipHeight : 0,
      right: hasSpaceRight ? spaceRight / tooltipWidth : 0,
      bottom: hasSpaceBottom ? spaceBottom / tooltipHeight : 0,
      left: hasSpaceLeft ? spaceLeft / tooltipWidth : 0
    };
    
    // Prioritize right and left over top and bottom (better for calendar cells)
    scores.right *= 1.2;
    scores.left *= 1.2;
    
    // Find the direction with the highest score
    let bestPlacement: 'top' | 'right' | 'bottom' | 'left' = 'right';  // Default to right
    let highestScore = scores.right;
    
    if (scores.bottom > highestScore) {
      bestPlacement = 'bottom';
      highestScore = scores.bottom;
    }
    
    if (scores.left > highestScore) {
      bestPlacement = 'left';
      highestScore = scores.left;
    }
    
    if (scores.top > highestScore) {
      bestPlacement = 'top';
      highestScore = scores.top;
    }
    
    // If no direction has enough space, pick the one with the most space
    if (highestScore === 0) {
      const spaces = { top: spaceTop, right: spaceRight, bottom: spaceBottom, left: spaceLeft };
      const directions = Object.keys(spaces) as Array<'top' | 'right' | 'bottom' | 'left'>;
      
      bestPlacement = directions.reduce((prev, curr) => 
        spaces[curr] > spaces[prev] ? curr : prev
      , 'right');
    }
    
    return bestPlacement;
  }
  
  /**
   * Calculates the exact position for a tooltip based on the placement
   */
  private calculatePositionForPlacement(
    placement: 'top' | 'right' | 'bottom' | 'left',
    targetRect: DOMRect,
    tooltipWidth: number,
    tooltipHeight: number,
    viewportWidth: number,
    viewportHeight: number,
    scrollX: number,
    scrollY: number
  ): TooltipPosition {
    // Initialize position values
    let top = 0;
    let left = 0;
    let transform = '';
    let transformOrigin = '';
    let arrowLeft = undefined;
    let arrowTop = undefined;
    let arrowTransform = '';
    
    // Get the center point of the target element (viewport relative)
    const targetCenterX = targetRect.left + (targetRect.width / 2);
    const targetCenterY = targetRect.top + (targetRect.height / 2);
    
    // Calculate position based on placement
    // Add scroll position to convert viewport coordinates to absolute page coordinates
    switch (placement) {
      case 'top':
        // Position above the target
        top = targetRect.top + scrollY - tooltipHeight - this.minOffset;
        left = targetCenterX + scrollX - (tooltipWidth / 2);
        transformOrigin = 'bottom center';
        arrowTransform = 'rotate(45deg)';
        break;
        
      case 'right':
        // Position to the right of the target
        top = targetCenterY + scrollY - (tooltipHeight / 2);
        left = targetRect.right + scrollX + this.minOffset;
        transformOrigin = 'left center';
        arrowTransform = 'rotate(-45deg)';
        break;
        
      case 'bottom':
        // Position below the target
        top = targetRect.bottom + scrollY + this.minOffset;
        left = targetCenterX + scrollX - (tooltipWidth / 2);
        transformOrigin = 'top center';
        arrowTransform = 'rotate(45deg)';
        break;
        
      case 'left':
        // Position to the left of the target
        top = targetCenterY + scrollY - (tooltipHeight / 2);
        left = targetRect.left + scrollX - tooltipWidth - this.minOffset;
        transformOrigin = 'right center';
        arrowTransform = 'rotate(-45deg)';
        break;
    }
    
    // Boundary checking - ensure tooltip stays within viewport
    // Since we're now using absolute positioning with scroll, we need to check
    // against viewport + scroll positions
    
    // Horizontal check
    if (left - scrollX < this.minOffset) {
      left = scrollX + this.minOffset;
    } else if (left - scrollX + tooltipWidth > viewportWidth - this.minOffset) {
      left = scrollX + viewportWidth - tooltipWidth - this.minOffset;
    }
    
    // Vertical check
    if (top - scrollY < this.minOffset) {
      top = scrollY + this.minOffset;
    } else if (top - scrollY + tooltipHeight > viewportHeight - this.minOffset) {
      top = scrollY + viewportHeight - tooltipHeight - this.minOffset;
    }
    
    // Calculate arrow position for correct pointing (viewport relative)
    // For arrows, we need positions relative to the tooltip itself, not absolute
    if (placement === 'top' || placement === 'bottom') {
      // For top/bottom tooltips, arrow should point to target center X
      const arrowLeftPos = targetCenterX + scrollX - left;
      
      // Convert to percentage for responsive positioning (clamp between 5% and 95%)
      const arrowLeftPercent = Math.max(5, Math.min(95, (arrowLeftPos / tooltipWidth) * 100));
      arrowLeft = `${arrowLeftPercent}%`;
      
      // Position arrow at bottom for top placement, top for bottom placement
      if (placement === 'top') {
        arrowTop = '100%';
      } else {
        arrowTop = '0';
      }
    } else {
      // For left/right tooltips, arrow should point to target center Y
      const arrowTopPos = targetCenterY + scrollY - top;
      
      // Convert to percentage for responsive positioning (clamp between 5% and 95%)
      const arrowTopPercent = Math.max(5, Math.min(95, (arrowTopPos / tooltipHeight) * 100));
      arrowTop = `${arrowTopPercent}%`;
      
      // Position arrow at right for left placement, left for right placement
      if (placement === 'left') {
        arrowLeft = '100%';
      } else {
        arrowLeft = '0';
      }
    }
    
    return {
      top: `${top}px`,
      left: `${left}px`,
      transform,
      transformOrigin,
      placement,
      arrowLeft,
      arrowTop,
      arrowTransform
    };
  }
  
  /**
   * Add window resize handler to reposition tooltip when window is resized
   * @param callback Function to call when window is resized
   * @returns Function to remove event listener
   */
  addResizeHandler(callback: () => void): () => void {
    const handler = () => {
      // Use NgZone to ensure Angular detects the changes
      this.ngZone.run(() => {
        callback();
      });
    };
    
    window.addEventListener('resize', handler);
    
    // Return function to remove event listener
    return () => {
      window.removeEventListener('resize', handler);
    };
  }
  
  /**
   * Add scroll handler to reposition tooltip when page is scrolled
   * @param callback Function to call when page is scrolled
   * @returns Function to remove event listener
   */
  addScrollHandler(callback: () => void): () => void {
    const handler = () => {
      // Use NgZone to ensure Angular detects the changes
      this.ngZone.run(() => {
        callback();
      });
    };
    
    window.addEventListener('scroll', handler, { passive: true });
    
    // Return function to remove event listener
    return () => {
      window.removeEventListener('scroll', handler);
    };
  }
} 